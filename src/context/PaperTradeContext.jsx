import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { mockStocks } from '../data/mockStocks';

const PaperTradeContext = createContext();

export const ID_MAP = {
  "1333": "HDFCBANK",
  "2885": "RELIANCE",
  "11536": "TCS",
  "1594": "INFY",
  "4963": "ICICIBANK",
  "3045": "SBIN",
  "1660": "ITC"
};

export const SYMBOL_MAP = {
  "HDFCBANK": "2885",
  "RELIANCE": "2885",
  "TCS": "11536",
  "INFY": "1594",
  "ICICIBANK": "4963",
  "SBIN": "3045",
  "ITC": "1660"
};

const calculateOptionPrice = (underlyingSymbol, strike, type, livePrice) => {
  const isIndex = underlyingSymbol === 'NIFTY50' || underlyingSymbol === 'BANKNIFTY' || underlyingSymbol === 'SENSEX';
  const atmExtrinsic = isIndex ? (livePrice * 0.015) : (livePrice * 0.03);
  const distance = (livePrice - strike) / livePrice;
  const volatility = isIndex ? 0.02 : 0.04;
  const timeValue = atmExtrinsic * Math.exp(-Math.pow(distance / volatility, 2));
  
  let intrinsic = 0;
  if (type === 'CE') {
    intrinsic = Math.max(0, livePrice - strike);
  } else {
    intrinsic = Math.max(0, strike - livePrice);
  }
  
  const totalPrice = intrinsic + timeValue;
  return Math.max(0.05, Number(totalPrice.toFixed(2)));
};

const getDeterministicOI = (symbol, strike, type, livePrice) => {
  const isIndex = symbol === 'NIFTY50' || symbol === 'BANKNIFTY' || symbol === 'SENSEX';
  const baseOI = isIndex ? 150000 : 15000;
  
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed += symbol.charCodeAt(i);
  }
  seed = (seed + strike) % 100;
  
  const variance = 0.7 + (seed / 300);
  const distance = (strike - livePrice) / livePrice;
  
  const skew = type === 'CE' 
    ? (distance > 0 ? 1.4 : 0.6) 
    : (distance < 0 ? 1.4 : 0.6);
     
  const oi = baseOI * variance * skew * Math.exp(-Math.pow(distance / 0.02, 2));
  return Math.round(Math.max(baseOI * 0.1, oi));
};

const getOptionLTPStatic = (symbol) => {
  const parts = symbol.split(' ');
  if (parts.length === 3) {
    const underlying = parts[0];
    const strike = parseInt(parts[1]);
    const type = parts[2]; // "CE" or "PE"
    
    const stock = mockStocks.find(s => s.symbol === underlying);
    const spotPrice = stock?.price || 100;
    return calculateOptionPrice(underlying, strike, type, spotPrice);
  }
  return null;
};

export function usePaperTrade() {
  return useContext(PaperTradeContext);
}

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

export const PaperTradeProvider = ({ children }) => {
  const [marketData, setMarketData] = useState({});
  const [socket, setSocket] = useState(null);
  
  // User Data
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState({ balance: 0, invested: 0, mtm: 0 });
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [publicTrades, setPublicTrades] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOptionLTP = (symbol) => {
    const parts = symbol.split(' ');
    if (parts.length === 3) {
      const underlying = parts[0];
      const strike = parseInt(parts[1]);
      const type = parts[2]; // "CE" or "PE"
      
      const liveUnderlying = marketData[underlying];
      const stock = mockStocks.find(s => s.symbol === underlying);
      const spotPrice = liveUnderlying?.price || stock?.price || 100;
      
      return calculateOptionPrice(underlying, strike, type, spotPrice);
    }
    return null;
  };

  const getOptionChain = (symbol, spotPrice) => {
    let step = 10;
    if (symbol === 'NIFTY50' || symbol === 'BANKNIFTY' || symbol === 'SENSEX') {
      step = 100;
    } else if (spotPrice < 100) {
      step = 1;
    } else if (spotPrice < 500) {
      step = 5;
    } else if (spotPrice < 1000) {
      step = 10;
    } else if (spotPrice < 3000) {
      step = 20;
    } else if (spotPrice < 10000) {
      step = 50;
    } else {
      step = 100;
    }

    const atmStrike = Math.round(spotPrice / step) * step;
    const chain = [];
    
    for (let i = -3; i <= 3; i++) {
      const strike = atmStrike + (i * step);
      const callPrice = calculateOptionPrice(symbol, strike, 'CE', spotPrice);
      const putPrice = calculateOptionPrice(symbol, strike, 'PE', spotPrice);
      const callOI = getDeterministicOI(symbol, strike, 'CE', spotPrice);
      const putOI = getDeterministicOI(symbol, strike, 'PE', spotPrice);
      
      chain.push({
        strike,
        callPrice,
        putPrice,
        callOI,
        putOI
      });
    }
    
    return chain;
  };
  
  // Custom backend URL stored in localStorage for Firebase to Render communication
  const [backendUrl, setBackendUrl] = useState(() => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname.startsWith('192.168.') ||
                        window.location.hostname.startsWith('10.');
    const defaultLocalUrl = `http://${window.location.hostname}:3001`;
    
    const saved = localStorage.getItem('VITE_BACKEND_URL');
    if (isLocalhost) {
      // Only return saved if it is valid and points to a local address
      if (saved && isValidUrl(saved) && (saved.includes('localhost') || saved.includes('127.0.0.1') || saved.includes('192.168.') || saved.includes('10.'))) {
        return saved;
      }
      return defaultLocalUrl;
    }
    
    if (saved && isValidUrl(saved)) {
      return saved;
    }
    return import.meta.env.VITE_BACKEND_URL || 
           'https://earnwithus.onrender.com';
  });

  const updateBackendUrl = (url) => {
    localStorage.setItem('VITE_BACKEND_URL', url);
    setBackendUrl(url);
    window.location.reload(); // Refresh to establish new WebSocket connection
  };

  // Fetch initial market data from REST API as fallback/immediate load
  useEffect(() => {
    if (!backendUrl) return;
    const fetchInitialData = () => {
      fetch(`${backendUrl}/api/market/overview`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            console.log("[REST] Loaded initial market data:", data.data);
            const mappedData = {};
            data.data.forEach(tick => {
              const symbol = ID_MAP[tick.symbol] || tick.symbol;
              mappedData[symbol] = {
                ...tick,
                symbol
              };
            });
            setMarketData(prev => ({
              ...mappedData,
              ...prev // Socket updates override REST values
            }));
          }
        })
        .catch(err => console.error("Failed to fetch initial market overview:", err));
    };
    fetchInitialData();
    // Poll every 30 seconds as fallback/backup update
    const interval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Initialize Socket.io
  useEffect(() => {
    if (!backendUrl) return;
    console.log(`[Socket] Attempting to connect to backend at: ${backendUrl}`);
    const newSocket = io(backendUrl);
    
    newSocket.on('connect', () => {
      console.log(`[Socket] Connected successfully to: ${backendUrl}`);
    });

    newSocket.on('connect_error', (err) => {
      console.error(`[Socket] Connection error for ${backendUrl}:`, err);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected from ${backendUrl} (Reason: ${reason})`);
    });
    
    newSocket.on('initial_market_data', (data) => {
      console.log("[Socket] Received initial market data:", data);
      // Map keys from numeric Dhan ID to human-readable symbol
      const mappedData = {};
      Object.keys(data).forEach(id => {
        const symbol = ID_MAP[id] || id;
        mappedData[symbol] = {
          ...data[id],
          symbol
        };
      });
      setMarketData(mappedData);
    });

    newSocket.on('market_tick', (tick) => {
      const symbol = ID_MAP[tick.symbol] || tick.symbol;
      setMarketData(prev => ({ 
        ...prev, 
        [symbol]: {
          ...tick,
          symbol
        } 
      }));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [backendUrl]);

  // Listen to Auth State and load Firestore data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Real-time listener for portfolio
        const portfolioRef = doc(db, 'users', currentUser.uid, 'portfolio', 'summary');
        const unsubPortfolio = onSnapshot(portfolioRef, (docSnap) => {
          if (docSnap.exists()) {
            setPortfolio(prev => ({ ...prev, ...docSnap.data() }));
          } else {
            // Initialize with 10L virtual capital
            setDoc(portfolioRef, { balance: 1000000, invested: 0, initialBalance: 1000000 });
          }
        });

        // Real-time listener for positions
        const positionsRef = collection(db, 'users', currentUser.uid, 'positions');
        const unsubPositions = onSnapshot(positionsRef, (snapshot) => {
          const pos = [];
          snapshot.forEach(doc => pos.push({ id: doc.id, ...doc.data() }));
          setPositions(pos);
        });

        // Real-time listener for orders
        const ordersRef = collection(db, 'users', currentUser.uid, 'orders');
        const qOrders = query(ordersRef, orderBy('timestamp', 'desc'), limit(100));
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
          const ords = [];
          snapshot.forEach(doc => ords.push({ id: doc.id, ...doc.data() }));
          setOrders(ords);
        });
        // Load Public Trades (Community Feed)
        const qTrades = query(collection(db, 'public_trades'), orderBy('timestamp', 'desc'), limit(50));
        const unsubPublic = onSnapshot(qTrades, (snapshot) => {
          const trades = [];
          snapshot.forEach(doc => trades.push({ id: doc.id, ...doc.data() }));
          setPublicTrades(trades);
        });

        // Load Leaderboard (Users sorted by P&L or Balance)
        // For simplicity, we just fetch all users' summaries or we can query a specific 'leaderboard' collection.
        // We will mock this or fetch simple summaries if needed. Since 'users/{uid}/portfolio/summary' is nested,
        // it's better to keep a central 'leaderboard' collection updated via cloud functions, but we can do client-side reads for now if small.
        // To keep it simple, we will just fetch top balances from a root 'leaderboard' collection that we update.
        const qLeader = query(collection(db, 'leaderboard'), orderBy('balance', 'desc'), limit(10));
        const unsubLeader = onSnapshot(qLeader, (snapshot) => {
           const leaders = [];
           snapshot.forEach(doc => leaders.push({ id: doc.id, ...doc.data() }));
           setLeaderboard(leaders);
        });

        setLoading(false);
        return () => {
          unsubPortfolio();
          unsubPositions();
          unsubOrders();
          unsubPublic();
          unsubLeader();
        };
      } else {
        setPortfolio({ balance: 0, invested: 0, mtm: 0 });
        setPositions([]);
        setPublicTrades([]);
        setLeaderboard([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Calculate MTM in real-time
  useEffect(() => {
    if (positions.length > 0) {
      let totalMTM = 0;
      positions.forEach(pos => {
        let currentPrice = marketData[pos.symbol]?.price;
        if (!currentPrice && pos.symbol.includes(' ')) {
          currentPrice = getOptionLTP(pos.symbol);
        }
        if (currentPrice) {
          if (pos.type === 'BUY') {
            totalMTM += (currentPrice - pos.averagePrice) * pos.quantity;
          } else {
            totalMTM += (pos.averagePrice - currentPrice) * pos.quantity;
          }
        }
      });
      setPortfolio(prev => ({ ...prev, mtm: totalMTM }));
    } else {
      setPortfolio(prev => ({ ...prev, mtm: 0 }));
    }
  }, [marketData, positions]);

  // Sync balance to leaderboard collection for social ranking
  useEffect(() => {
    if (user && portfolio.balance) {
      const leaderRef = doc(db, 'leaderboard', user.uid);
      setDoc(leaderRef, {
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous Trader',
        balance: portfolio.balance,
        mtm: portfolio.mtm || 0,
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [user, portfolio.balance, portfolio.mtm]);

  // Place Order Logic
  const placeOrder = async ({ symbol, type, quantity, isMarket, limitPrice, target, stopLoss, rationale, isPublic }) => {
    if (!user) return { success: false, message: "Please log in first" };
    
    // Convert symbol (e.g. RELIANCE) to ID for backend compatibility if needed, 
    // but the frontend state is all stored in terms of human-readable symbols now!
    let price = isMarket ? marketData[symbol]?.price : limitPrice;
    if (!price && symbol.includes(' ')) {
      price = getOptionLTP(symbol);
    }
    if (!price) return { success: false, message: `No live price available for ${symbol}` };

    const requiredMargin = price * quantity;

    if (type === 'BUY' && requiredMargin > portfolio.balance) {
      return { success: false, message: "Insufficient virtual funds" };
    }

    try {
      const orderData = {
        symbol,
        type, 
        quantity: Number(quantity),
        orderType: isMarket ? 'MARKET' : 'LIMIT',
        price: Number(price),
        target: target ? Number(target) : null,
        stopLoss: stopLoss ? Number(stopLoss) : null,
        rationale: rationale || "",
        status: isMarket ? 'EXECUTED' : 'PENDING',
        timestamp: new Date()
      };

      // 1. Add Order History
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      await addDoc(ordersRef, orderData);

      if (isMarket) {
        // 2. Update Position
        const existingPos = positions.find(p => p.symbol === symbol);
        if (existingPos) {
          const posRef = doc(db, 'users', user.uid, 'positions', existingPos.id);
          let newQuantity = existingPos.quantity;
          let newType = existingPos.type;
          let newAveragePrice = existingPos.averagePrice || price;
          
          if (existingPos.type === type) {
            newQuantity += Number(quantity);
            newAveragePrice = (existingPos.quantity * (existingPos.averagePrice || price) + Number(quantity) * Number(price)) / newQuantity;
          } else {
            newQuantity -= Number(quantity);
            if (newQuantity < 0) {
              newType = type;
              newQuantity = Math.abs(newQuantity);
              newAveragePrice = Number(price); // Reversal uses current price
            } else {
              newAveragePrice = existingPos.averagePrice || price; // Keep cost basis on reduction
            }
          }

          if (newQuantity === 0) {
            await updateDoc(posRef, { quantity: 0, status: 'CLOSED', averagePrice: 0 });
          } else {
            await updateDoc(posRef, { 
              quantity: newQuantity, 
              type: newType,
              averagePrice: Number(newAveragePrice.toFixed(2)),
              target: target ? Number(target) : (existingPos.target || null),
              stopLoss: stopLoss ? Number(stopLoss) : (existingPos.stopLoss || null)
            });
          }
        } else {
          const positionsRef = collection(db, 'users', user.uid, 'positions');
          await addDoc(positionsRef, {
            symbol,
            type,
            quantity: Number(quantity),
            averagePrice: Number(price),
            target: target ? Number(target) : null,
            stopLoss: stopLoss ? Number(stopLoss) : null,
            status: 'OPEN'
          });
        }

        // 3. Update Portfolio Balance
        const portfolioRef = doc(db, 'users', user.uid, 'portfolio', 'summary');
        const newBalance = type === 'BUY' ? portfolio.balance - requiredMargin : portfolio.balance + requiredMargin;
        await updateDoc(portfolioRef, { balance: newBalance });
        
        // 4. Publish to Community Feed if public
        if (isPublic) {
          const publicTradesRef = collection(db, 'public_trades');
          await addDoc(publicTradesRef, {
            userId: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous Trader',
            photoURL: user.photoURL || null,
            symbol,
            type,
            quantity: Number(quantity),
            price: Number(price),
            target: target ? Number(target) : null,
            stopLoss: stopLoss ? Number(stopLoss) : null,
            rationale: rationale || "",
            timestamp: serverTimestamp(),
            likes: 0,
            comments: 0
          });
        }
      }

      return { success: true, message: `Order placed for ${symbol}` };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message };
    }
  };

  // Reset capital and wipe positions
  const resetCapital = async (amount) => {
    if (!user) return { success: false, message: "Please log in first" };
    try {
      // 1. Reset summary balance
      const portfolioRef = doc(db, 'users', user.uid, 'portfolio', 'summary');
      await updateDoc(portfolioRef, { 
        balance: Number(amount), 
        invested: 0, 
        mtm: 0,
        initialBalance: Number(amount)
      });

      // 2. Clear positions
      const positionsRef = collection(db, 'users', user.uid, 'positions');
      const positionsSnap = await getDocs(positionsRef);
      const deletePromises = [];
      positionsSnap.forEach((docSnap) => {
        // We can either set quantity to 0 or completely delete. Setting to 0/CLOSED is cleaner.
        deletePromises.push(updateDoc(doc(db, 'users', user.uid, 'positions', docSnap.id), {
          quantity: 0,
          status: 'CLOSED'
        }));
      });
      await Promise.all(deletePromises);

      // Add a reset log in orders
      const ordersRef = collection(db, 'users', user.uid, 'orders');
      await addDoc(ordersRef, {
        symbol: "SYSTEM",
        type: "RESET",
        quantity: 0,
        orderType: "RESET",
        price: Number(amount),
        status: "SUCCESS",
        timestamp: new Date()
      });

      return { success: true, message: "Capital reset successfully!" };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  const value = {
    marketData,
    portfolio,
    positions,
    orders,
    publicTrades,
    leaderboard,
    loading,
    backendUrl,
    updateBackendUrl,
    placeOrder,
    resetCapital,
    getOptionLTP,
    getOptionChain
  };

  return (
    <PaperTradeContext.Provider value={value}>
      {children}
    </PaperTradeContext.Provider>
  );
};
