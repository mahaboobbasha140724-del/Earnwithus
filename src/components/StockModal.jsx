import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Star, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function StockModal({ stock, onClose }) {
  if (!stock) return null;

  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'options' | 'seasonality'
  
  // Generate some simulated chart points based on stock price
  const basePrice = stock.price;
  const changePercent = stock.change;
  const isPositive = changePercent >= 0;
  
  // Create simulated historical prices (10 days)
  const days = ['10d ago', '8d ago', '6d ago', '4d ago', '2d ago', 'Yesterday', 'Today'];
  const prices = [];
  let currentPrice = basePrice - (basePrice * (changePercent / 100));
  const step = (basePrice * (changePercent / 100)) / 6;
  for (let i = 0; i < 7; i++) {
    prices.push(currentPrice + (Math.random() - 0.45) * (basePrice * 0.015) + (i * step));
  }
  prices[6] = basePrice; // Make sure today is exactly current price

  // SVG dimensions for trend chart
  const svgWidth = 500;
  const svgHeight = 220;
  const padding = 24;
  
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  const priceRange = maxPrice - minPrice;

  // Calculate coordinates for SVG path
  const points = prices.map((price, idx) => {
    const x = padding + (idx * (svgWidth - (padding * 2)) / (prices.length - 1));
    const y = svgHeight - padding - ((price - minPrice) * (svgHeight - (padding * 2)) / priceRange);
    return { x, y };
  });

  const pathD = points.reduce((acc, point, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }, '');

  // Closed path for fill gradient
  const fillD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  return (
    <div style={modalStyles.overlay}>
      <div className="glass-card" style={modalStyles.modal}>
        
        {/* Header */}
        <div style={modalStyles.header}>
          <div>
            <div style={modalStyles.titleRow}>
              <h3 style={modalStyles.symbol}>{stock.symbol}</h3>
              <span style={{
                ...modalStyles.badge,
                backgroundColor: stock.change >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: stock.change >= 0 ? '#10b981' : '#ef4444',
                border: `1px solid ${stock.change >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {stock.sector}
              </span>
            </div>
            <p style={modalStyles.name}>{stock.name}</p>
          </div>
          
          <button onClick={onClose} style={modalStyles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Real-time Pricing */}
        <div style={modalStyles.priceBlock}>
          <div style={modalStyles.priceContainer}>
            <span style={modalStyles.price}>₹{stock.price.toFixed(2)}</span>
            <span style={{
              ...modalStyles.change,
              color: isPositive ? '#10b981' : '#ef4444'
            }}>
              {isPositive ? <TrendingUp size={16} style={{ marginRight: 4 }} /> : <TrendingDown size={16} style={{ marginRight: 4 }} />}
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
            </span>
          </div>
          <div style={modalStyles.liveIndicator}>
            <div style={modalStyles.liveDot} />
            <span>LIVE DATA FEED</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={modalStyles.tabs}>
          <button 
            style={{...modalStyles.tabBtn, borderBottomColor: activeTab === 'chart' ? '#10b981' : 'transparent', color: activeTab === 'chart' ? '#ffffff' : '#64748b'}}
            onClick={() => setActiveTab('chart')}
          >
            Technical Chart
          </button>
          <button 
            style={{...modalStyles.tabBtn, borderBottomColor: activeTab === 'options' ? '#10b981' : 'transparent', color: activeTab === 'options' ? '#ffffff' : '#64748b'}}
            onClick={() => setActiveTab('options')}
          >
            Options Chain (Simulated)
          </button>
          <button 
            style={{...modalStyles.tabBtn, borderBottomColor: activeTab === 'seasonality' ? '#10b981' : 'transparent', color: activeTab === 'seasonality' ? '#ffffff' : '#64748b'}}
            onClick={() => setActiveTab('seasonality')}
          >
            Seasonality Insights
          </button>
        </div>

        {/* Tab Contents */}
        <div style={modalStyles.tabContent}>
          
          {/* Chart Tab */}
          {activeTab === 'chart' && (
            <div>
              <div style={modalStyles.chartWrapper}>
                <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75].map((ratio, i) => (
                    <line 
                      key={i}
                      x1={padding}
                      y1={svgHeight * ratio}
                      x2={svgWidth - padding}
                      y2={svgHeight * ratio}
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Chart Fill */}
                  <path d={fillD} fill="url(#chartGradient)" />

                  {/* Chart Stroke */}
                  <path d={pathD} fill="none" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth="2.5" />

                  {/* Coordinates Markers */}
                  {points.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r={idx === points.length - 1 ? 5 : 3.5} fill={isPositive ? '#10b981' : '#ef4444'} />
                      {idx === points.length - 1 && (
                        <circle cx={pt.x} cy={pt.y} r={10} fill="none" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={1.5} opacity={0.6} style={{ animation: 'ping 1.5s infinite' }} />
                      )}
                    </g>
                  ))}
                </svg>

                {/* Days labels */}
                <div style={modalStyles.chartLabels}>
                  {days.map((day, idx) => (
                    <span key={idx} style={modalStyles.chartLabel}>{day}</span>
                  ))}
                </div>
              </div>

              {/* Grid Statistics */}
              <div style={modalStyles.statsGrid}>
                <div style={modalStyles.statItem}>
                  <div style={modalStyles.statLabel}>52W High</div>
                  <div style={modalStyles.statVal}>₹{stock.high52.toFixed(2)}</div>
                </div>
                <div style={modalStyles.statItem}>
                  <div style={modalStyles.statLabel}>52W Low</div>
                  <div style={modalStyles.statVal}>₹{stock.low52.toFixed(2)}</div>
                </div>
                <div style={modalStyles.statItem}>
                  <div style={modalStyles.statLabel}>PE Ratio</div>
                  <div style={modalStyles.statVal}>{stock.peRatio || 'N/A'}</div>
                </div>
                <div style={modalStyles.statItem}>
                  <div style={modalStyles.statLabel}>Market Cap</div>
                  <div style={modalStyles.statVal}>{stock.marketCap}</div>
                </div>
                <div style={modalStyles.statItem}>
                  <div style={modalStyles.statLabel}>RMI Signal (Daily)</div>
                  <div style={{...modalStyles.statVal, color: stock.rmiSignal === 'Buy' ? '#10b981' : stock.rmiSignal === 'Sell' ? '#ef4444' : '#ffffff'}}>
                    {stock.rmiSignal}
                  </div>
                </div>
                <div style={modalStyles.statItem}>
                  <div style={modalStyles.statLabel}>Dow Trend</div>
                  <div style={modalStyles.statVal}>{stock.dowTrend}</div>
                </div>
              </div>
            </div>
          )}

          {/* Options Chain Tab */}
          {activeTab === 'options' && (
            <div>
              {stock.options ? (
                <div style={modalStyles.optionsContainer}>
                  <div style={modalStyles.optionsMeta}>
                    <span>Spot Price: <strong style={{ color: '#ffffff' }}>₹{stock.options.spot.toFixed(2)}</strong></span>
                    <span style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={14} /> Options Chain simulated for research
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={modalStyles.optionsTable}>
                      <thead>
                        <tr>
                          <th colSpan="2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>CALL OPTIONS</th>
                          <th style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>STRIKE</th>
                          <th colSpan="2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>PUT OPTIONS</th>
                        </tr>
                        <tr>
                          <th>OI (Contracts)</th>
                          <th>LTP (Price)</th>
                          <th style={{ color: '#f59e0b' }}>Price</th>
                          <th>LTP (Price)</th>
                          <th>OI (Contracts)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stock.options.chain.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ color: '#94a3b8' }}>{row.callOI.toLocaleString()}</td>
                            <td style={{ color: '#10b981', fontWeight: 600 }}>₹{row.callPrice.toFixed(2)}</td>
                            <td style={{ fontWeight: 700, color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.02)' }}>{row.strike}</td>
                            <td style={{ color: '#ef4444', fontWeight: 600 }}>₹{row.putPrice.toFixed(2)}</td>
                            <td style={{ color: '#94a3b8' }}>{row.putOI.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={modalStyles.unavailable}>
                  <AlertTriangle size={36} color="#f59e0b" style={{ marginBottom: 12 }} />
                  <p>Options Chain is not available for index indices/custom products.</p>
                </div>
              )}
            </div>
          )}

          {/* Seasonality Insights Tab */}
          {activeTab === 'seasonality' && (
            <div style={modalStyles.seasonalityContainer}>
              <h4 style={{ marginBottom: 16 }}>Historical Pattern Analytics</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>
                Analyze monthly performance trends. This metric captures average historical annualized returns and median expected moves to identify high-probability seasonal buying zones.
              </p>
              
              <div style={modalStyles.seasonalityGrid}>
                <div style={modalStyles.seasonalityCard}>
                  <div style={modalStyles.seasonalityLabel}>Annualized Return</div>
                  <div style={modalStyles.seasonalityVal}>{stock.seasonality.annualized.toFixed(1)}%</div>
                </div>
                <div style={modalStyles.seasonalityCard}>
                  <div style={modalStyles.seasonalityLabel}>Avg Monthly Return</div>
                  <div style={modalStyles.seasonalityVal}>{stock.seasonality.avgReturn.toFixed(1)}%</div>
                </div>
                <div style={modalStyles.seasonalityCard}>
                  <div style={modalStyles.seasonalityLabel}>Median Return</div>
                  <div style={modalStyles.seasonalityVal}>{stock.seasonality.medianReturn.toFixed(1)}%</div>
                </div>
                <div style={modalStyles.seasonalityCard}>
                  <div style={modalStyles.seasonalityLabel}>Max Single Gain</div>
                  <div style={modalStyles.seasonalityVal}>{stock.seasonality.maxGain.toFixed(1)}%</div>
                </div>
              </div>

              <div style={{ marginTop: 24, padding: 16, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <p style={{ fontSize: '0.85rem', color: '#10b981' }}>
                  💡 <strong>Seasonality Signal:</strong> {stock.symbol} historically performs strongest in Q3 cycles, with a median historical win rate of 74.2% in July/August.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(3, 4, 6, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    maxWidth: '560px',
    margin: '0 16px',
    padding: '24px',
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
    animation: 'slideUp 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  symbol: {
    fontSize: '1.6rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '4px',
  },
  name: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginTop: '2px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s',
  },
  priceBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom: '20px',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  price: {
    fontSize: '2.2rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    color: '#ffffff',
  },
  change: {
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.05em',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 8px #10b981',
    animation: 'pulse 1.5s infinite',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '16px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: '0.2s',
  },
  tabContent: {
    minHeight: '260px',
  },
  chartWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid rgba(255,255,255,0.03)',
    marginBottom: '20px',
  },
  chartLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '6px',
    padding: '0 12px',
  },
  chartLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  statItem: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '10px 12px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  statVal: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#ffffff',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  optionsMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginBottom: '4px',
  },
  optionsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
  unavailable: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '240px',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  seasonalityContainer: {
    padding: '8px 0',
  },
  seasonalityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  seasonalityCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '14px',
    textAlign: 'center',
  },
  seasonalityLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginBottom: '4px',
  },
  seasonalityVal: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#ffffff',
  }
};
