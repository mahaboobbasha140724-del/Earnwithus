import React, { useState } from 'react';
import { usePaperTrade } from '../context/PaperTradeContext';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, Briefcase, Activity, Clock } from 'lucide-react';

export default function PaperTrade() {
  const { user } = useAuth();
  const { marketData, portfolio, positions, orders, loading, placeOrder } = usePaperTrade();
  const [selectedSymbol, setSelectedSymbol] = useState("1333"); // Default HDFCBANK
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderMsg, setOrderMsg] = useState("");

  if (loading) {
    return <div className="loading-state">Loading Paper Trading Data...</div>;
  }

  if (!user) {
    return (
      <div className="section-container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Login Required</h2>
        <p>You must be logged in to access Paper Trading.</p>
      </div>
    );
  }

  const currentTick = marketData[selectedSymbol];

  const handleOrder = async (type) => {
    setOrderMsg("");
    const res = await placeOrder(selectedSymbol, type, orderQuantity, true);
    setOrderMsg(res.message);
    if (res.success) {
      setTimeout(() => setOrderMsg(""), 3000);
    }
  };

  return (
    <div className="section-container" style={{ paddingTop: '80px', paddingBottom: '50px' }}>
      <div className="section-header">
        <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Paper Trading Simulator</h1>
        <p>Practice trading F&O and Equity with real-time data</p>
      </div>

      <div style={styles.grid}>
        {/* Left Column: Portfolio & Order Entry */}
        <div style={styles.leftCol}>
          {/* Portfolio Summary */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Briefcase size={20} color="#10b981" />
              <h3>Virtual Portfolio</h3>
            </div>
            <div style={styles.portfolioGrid}>
              <div style={styles.portfolioItem}>
                <span style={styles.label}>Available Margin</span>
                <span style={styles.value}>₹{portfolio.balance.toLocaleString('en-IN')}</span>
              </div>
              <div style={styles.portfolioItem}>
                <span style={styles.label}>Total MTM</span>
                <span style={{ ...styles.value, color: portfolio.mtm >= 0 ? '#10b981' : '#ef4444' }}>
                  {portfolio.mtm >= 0 ? '+' : ''}₹{portfolio.mtm.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Entry */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Activity size={20} color="#3b82f6" />
              <h3>Place Order</h3>
            </div>
            
            <div style={styles.formGroup}>
              <label>Symbol ID (e.g. 1333 for HDFCBANK)</label>
              <input 
                type="text" 
                value={selectedSymbol} 
                onChange={(e) => setSelectedSymbol(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.livePriceBox}>
              <span style={styles.label}>Live Price:</span>
              <span style={styles.livePrice}>
                {currentTick ? `₹${currentTick.price}` : 'Waiting for tick...'}
              </span>
            </div>

            <div style={styles.formGroup}>
              <label>Quantity</label>
              <input 
                type="number" 
                value={orderQuantity} 
                onChange={(e) => setOrderQuantity(e.target.value)}
                style={styles.input}
                min="1"
              />
            </div>

            {orderMsg && (
              <div style={{ marginBottom: '15px', color: orderMsg.includes('success') ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                {orderMsg}
              </div>
            )}

            <div style={styles.actionButtons}>
              <button onClick={() => handleOrder('BUY')} className="btn-buy" style={styles.btnBuy}>Buy Market</button>
              <button onClick={() => handleOrder('SELL')} className="btn-sell" style={styles.btnSell}>Sell Market</button>
            </div>
          </div>
        </div>

        {/* Right Column: Positions & Orders */}
        <div style={styles.rightCol}>
          {/* Active Positions */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Activity size={20} color="#f59e0b" />
              <h3>Open Positions</h3>
            </div>
            {positions.filter(p => p.quantity > 0).length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No open positions.</p>
            ) : (
              <div className="table-responsive">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Avg Price</th>
                      <th>LTP</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.filter(p => p.quantity > 0).map(pos => {
                      const ltp = marketData[pos.symbol]?.price || pos.averagePrice;
                      const pnl = pos.type === 'BUY' 
                        ? (ltp - pos.averagePrice) * pos.quantity 
                        : (pos.averagePrice - ltp) * pos.quantity;
                      
                      return (
                        <tr key={pos.id}>
                          <td>{pos.symbol}</td>
                          <td style={{ color: pos.type === 'BUY' ? '#10b981' : '#ef4444' }}>{pos.type}</td>
                          <td>{pos.quantity}</td>
                          <td>₹{pos.averagePrice.toFixed(2)}</td>
                          <td>₹{ltp}</td>
                          <td style={{ color: pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Clock size={20} color="#8b5cf6" />
              <h3>Order History</h3>
            </div>
            {orders.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No recent orders.</p>
            ) : (
              <div className="table-responsive">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Symbol</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice().reverse().slice(0, 10).map((order, idx) => (
                      <tr key={idx}>
                        <td>{new Date(order.timestamp?.seconds * 1000 || Date.now()).toLocaleTimeString()}</td>
                        <td>{order.symbol}</td>
                        <td style={{ color: order.type === 'BUY' ? '#10b981' : '#ef4444' }}>{order.type}</td>
                        <td>{order.quantity}</td>
                        <td>₹{order.price.toFixed(2)}</td>
                        <td><span style={styles.statusExecuted}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '24px',
    alignItems: 'start'
  },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: {
    padding: '24px',
    borderRadius: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '10px'
  },
  portfolioGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  portfolioItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: { fontSize: '0.9rem', color: '#94a3b8' },
  value: { fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    outline: 'none'
  },
  livePriceBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    marginBottom: '16px'
  },
  livePrice: { fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  btnBuy: {
    background: '#10b981', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
  },
  btnSell: {
    background: '#ef4444', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  statusExecuted: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  }
};
