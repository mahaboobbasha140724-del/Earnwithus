import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
  "HDFCBANK": "1333",
  "RELIANCE": "2885",
  "TCS": "11536",
  "INFY": "1594",
  "ICICIBANK": "4963",
  "SBIN": "3045",
  "ITC": "1660"
};

export function usePaperTrade() {
  return useContext(PaperTradeContext);
}

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
  
  // Custom backend URL stored in localStorage for Firebase to Render communication
  const [backendUrl, setBackendUrl] = useState(() => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname.startsWith('192.168.') ||
                        window.location.hostname.startsWith('10.');
    const defaultLocalUrl = `http://${window.location.hostname}:3001`;
    
    if (isLocalhost) {
      const saved = localStorage.getItem('VITE_BACKEND_URL');
      // Only return saved if it points to a local address
      if (saved && (saved.includes('localhost') || saved.includes('127.0.0.1') || saved.includes('192.168.') || saved.includes('10.'))) {
        return saved;
      }
      return defaultLocalUrl;
    }
    
    return localStorage.getItem('VITE_BACKEND_URL') || 
           import.meta.env.VITE_BACKEND_URL || 
           'https://earn-with-us.onrender.com';
  });

  const updateBackendUrl = (url) => {
    localStorage.setItem('VITE_BACKEND_URL', url);
    setBackendUrl(url);
    window.location.reload(); // Refresh to establish new WebSocket connection
  };

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
        const currentPrice = marketData[pos.symbol]?.price;
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
    const price = isMarket ? marketData[symbol]?.price : limitPrice;
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
          
          if (existingPos.type === type) {
            newQuantity += Number(quantity);
          } else {
            newQuantity -= Number(quantity);
            if (newQuantity < 0) {
              newType = type;
              newQuantity = Math.abs(newQuantity);
            }
          }

          if (newQuantity === 0) {
            await updateDoc(posRef, { quantity: 0, status: 'CLOSED' });
          } else {
            await updateDoc(posRef, { 
              quantity: newQuantity, 
              type: newType,
              target: target ? Number(target) : existingPos.target,
              stopLoss: stopLoss ? Number(stopLoss) : existingPos.stopLoss
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
    resetCapital
  };

  return (
    <PaperTradeContext.Provider value={value}>
      {children}
    </PaperTradeContext.Provider>
  );
};
