import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePaperTrade } from '../context/PaperTradeContext';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Activity, Clock, Users, MessageSquare, TrendingUp, TrendingDown, Target, ShieldAlert, Award, Settings } from 'lucide-react';
import './PaperTrade.css';

const PRESET_STOCKS = ["HDFCBANK", "RELIANCE", "TCS", "INFY", "ICICIBANK", "SBIN", "ITC"];

export default function PaperTrade() {
  const { currentUser: user } = useAuth();
  const { 
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
  } = usePaperTrade();
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'market', 'portfolio', 'leaderboard', 'settings'
  
  // Order entry modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [orderType, setOrderType] = useState('BUY');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderTarget, setOrderTarget] = useState('');
  const [orderStopLoss, setOrderStopLoss] = useState('');
  const [orderRationale, setOrderRationale] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [orderMsg, setOrderMsg] = useState("");

  // Capital reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [customCapitalAmount, setCustomCapitalAmount] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  // Backend settings url state
  const [tempBackendUrl, setTempBackendUrl] = useState(backendUrl || '');

  // Auto-open order modal from URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sym = params.get('symbol');
    if (sym && PRESET_STOCKS.includes(sym.toUpperCase())) {
      openOrderModal(sym.toUpperCase(), 'BUY');
      // Clear route search queries
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

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

  const openOrderModal = (symbol, type = 'BUY') => {
    setSelectedSymbol(symbol);
    setOrderType(type);
    setIsModalOpen(true);
    setOrderMsg("");
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderMsg("");
    
    const res = await placeOrder({
      symbol: selectedSymbol,
      type: orderType,
      quantity: orderQuantity,
      isMarket: true,
      target: orderTarget,
      stopLoss: orderStopLoss,
      rationale: orderRationale,
      isPublic: isPublic
    });
    
    setOrderMsg(res.message);
    if (res.success) {
      setTimeout(() => {
        setIsModalOpen(false);
        setOrderMsg("");
        // Reset form
        setOrderQuantity(1);
        setOrderTarget('');
        setOrderStopLoss('');
        setOrderRationale('');
      }, 1500);
    }
  };

  const handleResetCapitalSubmit = async (amt) => {
    setResetMsg("");
    if (!amt || isNaN(amt) || Number(amt) <= 0) {
      setResetMsg("Please enter a valid amount");
      return;
    }
    const res = await resetCapital(amt);
    setResetMsg(res.message);
    if (res.success) {
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetMsg("");
        setCustomCapitalAmount("");
      }, 1500);
    }
  };

  const symbols = PRESET_STOCKS;

  return (
    <div className="paper-trade-layout">
      {/* Top Summary Bar */}
      <div className="summary-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 40 }}>
          <div className="summary-item">
            <span className="summary-label">Available Margin</span>
            <span className="summary-value" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              ₹{portfolio.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 4 }}
                onClick={() => setIsResetModalOpen(true)}
              >
                Reset Capital
              </button>
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total MTM</span>
            <span className={`summary-value ${portfolio.mtm >= 0 ? 'text-green' : 'text-red'}`}>
              {portfolio.mtm >= 0 ? '+' : ''}₹{portfolio.mtm.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Display Status of Live Connection */}
        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="live-dot" style={{ backgroundColor: Object.keys(marketData).length > 0 ? '#10b981' : '#f59e0b', boxShadow: Object.keys(marketData).length > 0 ? '0 0 8px #10b981' : '0 0 8px #f59e0b' }} />
          {Object.keys(marketData).length > 0 ? 'Live Feed Connected' : 'Waiting for connection...'}
        </div>
      </div>

      <div className="paper-trade-container">
        
        {/* Left Sidebar Tabs */}
        <div className="sidebar-tabs">
          <button className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
            <MessageSquare size={18} /> Community Feed
          </button>
          <button className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
            <Activity size={18} /> Live Market
          </button>
          <button className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>
            <Briefcase size={18} /> My Portfolio
          </button>
          <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>
            <Award size={18} /> Leaderboard
          </button>
          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Connection Settings
          </button>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          
          {/* COMMUNITY FEED */}
          {activeTab === 'feed' && (
            <div className="feed-container">
              <div className="tab-header">
                <h2>Community Trades</h2>
                <button className="btn-primary" onClick={() => openOrderModal(symbols[0] || 'RELIANCE')}>Post a Trade</button>
              </div>
              
              {publicTrades.length === 0 ? (
                <p className="empty-state">No trades shared yet. Be the first!</p>
              ) : (
                <div className="feed-list">
                  {publicTrades.map(trade => (
                    <div key={trade.id} className="feed-card">
                      <div className="feed-card-header">
                        <div className="feed-user-info">
                          <div className="avatar">{trade.displayName?.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="username">{trade.displayName}</div>
                            <div className="time">{trade.timestamp?.seconds ? new Date(trade.timestamp.seconds * 1000).toLocaleString() : 'Just now'}</div>
                          </div>
                        </div>
                        <div className={`trade-badge ${trade.type === 'BUY' ? 'bg-green' : 'bg-red'}`}>
                          {trade.type} {trade.symbol}
                        </div>
                      </div>
                      
                      <div className="feed-trade-details">
                        <div className="detail-item">
                          <span>Entry</span>
                          <strong>₹{trade.price?.toFixed(2)}</strong>
                        </div>
                        {trade.target && (
                          <div className="detail-item target">
                            <span><Target size={14}/> Target</span>
                            <strong className="text-green">₹{trade.target}</strong>
                          </div>
                        )}
                        {trade.stopLoss && (
                          <div className="detail-item stoploss">
                            <span><ShieldAlert size={14}/> SL</span>
                            <strong className="text-red">₹{trade.stopLoss}</strong>
                          </div>
                        )}
                      </div>

                      {trade.rationale && (
                        <div className="feed-rationale">
                          <p>"{trade.rationale}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIVE MARKET */}
          {activeTab === 'market' && (
            <div className="market-container">
              <h2>Live Market Scanners</h2>
              <div className="market-grid">
                {symbols.map(sym => {
                  const data = marketData[sym];
                  const price = data?.price || 0;
                  const change = data ? (data.price - (data.close || data.price)) : 0;
                  const isPositive = change >= 0;
                  
                  return (
                    <div key={sym} className="market-card">
                      <div className="market-card-header">
                        <h3>{sym}</h3>
                        <span className={`price ${isPositive ? 'text-green' : 'text-red'}`}>
                          {price > 0 ? `₹${price.toFixed(2)}` : 'Waiting...'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12 }}>
                        {data ? `${change >= 0 ? '+' : ''}${change.toFixed(2)} today` : '---'}
                      </div>
                      <div className="market-card-actions">
                        <button className="btn-buy-sm" onClick={() => openOrderModal(sym, 'BUY')}>BUY</button>
                        <button className="btn-sell-sm" onClick={() => openOrderModal(sym, 'SELL')}>SELL</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MY PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="portfolio-container">
              <h2>Open Positions</h2>
              {positions.filter(p => p.quantity > 0).length === 0 ? (
                <p className="empty-state">No open positions.</p>
              ) : (
                <div className="positions-list">
                  {positions.filter(p => p.quantity > 0).map(pos => {
                    const ltp = marketData[pos.symbol]?.price || pos.averagePrice;
                    const pnl = pos.type === 'BUY' 
                      ? (ltp - pos.averagePrice) * pos.quantity 
                      : (pos.averagePrice - ltp) * pos.quantity;
                    
                    return (
                      <div key={pos.id} className="position-card">
                        <div className="pos-header">
                          <div className="pos-title">
                            <span className={`type-badge ${pos.type === 'BUY' ? 'bg-green' : 'bg-red'}`}>{pos.type}</span>
                            <h3>{pos.symbol}</h3>
                            <span className="qty">Qty: {pos.quantity}</span>
                          </div>
                          <div className={`pos-pnl ${pnl >= 0 ? 'text-green' : 'text-red'}`}>
                            {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                          </div>
                        </div>
                        <div className="pos-stats">
                          <div><span>Avg:</span> ₹{pos.averagePrice.toFixed(2)}</div>
                          <div><span>LTP:</span> ₹{ltp.toFixed(2)}</div>
                          {pos.target && <div><span>Target:</span> ₹{pos.target}</div>}
                          {pos.stopLoss && <div><span>SL:</span> ₹{pos.stopLoss}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <h2 style={{ marginTop: '30px' }}>Order History</h2>
              <div className="table-responsive">
                <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px 8px' }}>Time</th>
                      <th style={{ padding: '12px 8px' }}>Symbol</th>
                      <th style={{ padding: '12px 8px' }}>Type</th>
                      <th style={{ padding: '12px 8px' }}>Qty</th>
                      <th style={{ padding: '12px 8px' }}>Price</th>
                      <th style={{ padding: '12px 8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice().reverse().slice(0, 10).map((order, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 8px', color: '#64748b' }}>{order.timestamp?.seconds ? new Date(order.timestamp.seconds * 1000).toLocaleTimeString() : 'Just now'}</td>
                        <td style={{ padding: '12px 8px' }}>{order.symbol}</td>
                        <td style={{ padding: '12px 8px' }} className={order.type === 'BUY' ? 'text-green' : 'text-red'}>{order.type}</td>
                        <td style={{ padding: '12px 8px' }}>{order.quantity}</td>
                        <td style={{ padding: '12px 8px' }}>₹{order.price?.toFixed(2)}</td>
                        <td style={{ padding: '12px 8px' }}><span className="status-badge">{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="leaderboard-container">
              <h2>Top Traders</h2>
              <div className="leaderboard-list">
                {leaderboard.map((leader, idx) => (
                  <div key={leader.id} className="leaderboard-card">
                    <div className="rank">#{idx + 1}</div>
                    <div className="user-info">
                      <div className="avatar">{leader.displayName?.charAt(0).toUpperCase()}</div>
                      <div className="name">{leader.displayName}</div>
                    </div>
                    <div className="score">
                      <div className="balance">₹{leader.balance?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                      <div className={`mtm ${leader.mtm >= 0 ? 'text-green' : 'text-red'}`}>
                        {leader.mtm >= 0 ? '+' : ''}₹{leader.mtm?.toFixed(2)} MTM
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONNECTION SETTINGS */}
          {activeTab === 'settings' && (
            <div className="settings-container">
              <h2>Backend Connection Settings</h2>
              <p style={{ color: '#94a3b8', marginBottom: 20 }}>
                If you are running the Node.js WebSocket proxy on Render, paste your Render web service URL below to sync real-time market ticks.
              </p>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Render Web Service URL</label>
                <input 
                  type="text" 
                  value={tempBackendUrl} 
                  onChange={e => setTempBackendUrl(e.target.value)} 
                  placeholder="https://earn-with-us.onrender.com" 
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>
              <button 
                className="btn-primary" 
                onClick={() => updateBackendUrl(tempBackendUrl)}
              >
                Save & Connect Backend
              </button>
              <div style={{ marginTop: 24, fontSize: '0.85rem', color: '#64748b' }}>
                Currently connected to: <code style={{ color: '#3b82f6', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>{backendUrl}</code>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ORDER ENTRY MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !orderMsg && setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Post a Trade</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleOrderSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Symbol</label>
                  <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}>
                    {symbols.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={orderType} onChange={e => setOrderType(e.target.value)}>
                    <option value="BUY">BUY (Bullish)</option>
                    <option value="SELL">SELL (Bearish)</option>
                  </select>
                </div>
              </div>
              
              <div className="live-price-indicator">
                Current Market Price: <strong>₹{marketData[selectedSymbol]?.price?.toFixed(2) || '---'}</strong>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="1" value={orderQuantity} onChange={e => setOrderQuantity(e.target.value)} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Price (Optional)</label>
                  <input type="number" step="0.05" value={orderTarget} onChange={e => setOrderTarget(e.target.value)} placeholder="e.g. 1500" />
                </div>
                <div className="form-group">
                  <label>Stop Loss (Optional)</label>
                  <input type="number" step="0.05" value={orderStopLoss} onChange={e => setOrderStopLoss(e.target.value)} placeholder="e.g. 1400" />
                </div>
              </div>

              <div className="form-group">
                <label>Trade Rationale / Comments (Optional)</label>
                <textarea 
                  rows="3" 
                  value={orderRationale} 
                  onChange={e => setOrderRationale(e.target.value)}
                  placeholder="Why are you taking this trade?"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                  Share to Community Feed
                </label>
              </div>

              {orderMsg && (
                <div className={`form-msg ${orderMsg.toLowerCase().includes('success') ? 'text-green' : 'text-red'}`}>
                  {orderMsg}
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className={`btn-submit ${orderType === 'BUY' ? 'bg-green' : 'bg-red'}`}>
                  Execute {orderType} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CAPITAL MODAL */}
      {isResetModalOpen && (
        <div className="modal-overlay" onClick={() => !resetMsg && setIsResetModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Virtual Capital</h3>
              <button className="close-btn" onClick={() => setIsResetModalOpen(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Resetting your capital will update your virtual margin balance. Note that this will also close any of your current open positions.
              </p>
              
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                {[50000, 100000, 500000, 1000000].map(amt => (
                  <button 
                    key={amt} 
                    className="btn-secondary" 
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }} 
                    onClick={() => handleResetCapitalSubmit(amt)}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>Or Enter Custom Amount (₹)</label>
                <input 
                  type="number" 
                  value={customCapitalAmount} 
                  onChange={e => setCustomCapitalAmount(e.target.value)} 
                  placeholder="e.g. 25000" 
                />
              </div>

              {resetMsg && (
                <div className={`form-msg ${resetMsg.toLowerCase().includes('success') ? 'text-green' : 'text-red'}`}>
                  {resetMsg}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleResetCapitalSubmit(customCapitalAmount)}
                >
                  Reset Margin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
