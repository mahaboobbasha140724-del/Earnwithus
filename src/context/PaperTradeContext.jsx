import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const PaperTradeContext = createContext();

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
  const [loading, setLoading] = useState(true);

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);
    
    newSocket.on('initial_market_data', (data) => {
      setMarketData(data);
    });

    newSocket.on('market_tick', (tick) => {
      setMarketData(prev => ({ ...prev, [tick.symbol]: tick }));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

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
        
        setLoading(false);
        return () => {
          unsubPortfolio();
          unsubPositions();
        };
      } else {
        setPortfolio({ balance: 0, invested: 0, mtm: 0 });
        setPositions([]);
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

  // Place Order Logic
  const placeOrder = async (symbol, type, quantity, isMarket, limitPrice = 0) => {
    if (!user) return { success: false, message: "Please log in first" };
    
    const price = isMarket ? marketData[symbol]?.price : limitPrice;
    if (!price) return { success: false, message: "No live price available" };

    const requiredMargin = price * quantity;

    if (type === 'BUY' && requiredMargin > portfolio.balance) {
      return { success: false, message: "Insufficient virtual funds" };
    }

    try {
      const orderData = {
        symbol,
        type, // BUY or SELL
        quantity: Number(quantity),
        orderType: isMarket ? 'MARKET' : 'LIMIT',
        price: Number(price),
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
          // Complex logic for averaging or squaring off. Simple version for now:
          const posRef = doc(db, 'users', user.uid, 'positions', existingPos.id);
          let newQuantity = existingPos.quantity;
          let newType = existingPos.type;
          
          if (existingPos.type === type) {
            newQuantity += Number(quantity);
            // new avg price calculation needed here ideally
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
            await updateDoc(posRef, { quantity: newQuantity, type: newType });
          }
        } else {
          const positionsRef = collection(db, 'users', user.uid, 'positions');
          await addDoc(positionsRef, {
            symbol,
            type,
            quantity: Number(quantity),
            averagePrice: Number(price),
            status: 'OPEN'
          });
        }

        // 3. Update Portfolio Balance
        const portfolioRef = doc(db, 'users', user.uid, 'portfolio', 'summary');
        const newBalance = type === 'BUY' ? portfolio.balance - requiredMargin : portfolio.balance + requiredMargin;
        await updateDoc(portfolioRef, { balance: newBalance });
      }

      return { success: true, message: `Order placed for ${symbol}` };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    marketData,
    portfolio,
    positions,
    orders,
    loading,
    placeOrder
  };

  return (
    <PaperTradeContext.Provider value={value}>
      {children}
    </PaperTradeContext.Provider>
  );
};
