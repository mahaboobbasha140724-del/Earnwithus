import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, ChevronRight, Activity, TrendingUp, HelpCircle } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';

export default function FuturesOptions({ setSelectedStockForModal }) {
  // Filter stocks that have options chain data
  const optionsStocks = mockStocks.filter(s => s.options);
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY50');

  const [liveFII, setLiveFII] = useState({
    nifty: 24056.00,
    niftyChange: 0.14,
    banknifty: 58177.05,
    bankniftyChange: 0.05,
    pcr: 1.06
  });

  useEffect(() => {
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    
    const fetchFO = () => {
      fetch(`${API_BASE}/api/market/fii-dii`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setLiveFII({
              nifty: resData.nifty || 24056.00,
              niftyChange: resData.niftyChange !== undefined ? resData.niftyChange : 0.14,
              banknifty: resData.banknifty || 58177.05,
              bankniftyChange: resData.bankniftyChange !== undefined ? resData.bankniftyChange : 0.05,
              pcr: resData.pcr || 1.06
            });
          }
        })
        .catch(err => {
          console.error("Failed to fetch live F&O details:", err);
        });
    };

    fetchFO();
    const interval = setInterval(fetchFO, 15000); // Real-time updates: poll every 15s
    return () => clearInterval(interval);
  }, []);

  const activeStock = optionsStocks.find(s => s.symbol === selectedSymbol) || optionsStocks[0];
  const { chain } = activeStock.options;

  const isNifty = selectedSymbol === 'NIFTY50';
  const liveSpot = isNifty ? liveFII.nifty : liveFII.banknifty;
  const liveChange = isNifty ? liveFII.niftyChange : liveFII.bankniftyChange;
  const livePCR = isNifty ? liveFII.pcr : 1.12; // Bank Nifty PCR fallback or calculation

  // Calculate total Call vs Put OI for analytics chart
  const totalCallOI = chain.reduce((acc, row) => acc + row.callOI, 0);
  const totalPutOI = chain.reduce((acc, row) => acc + row.putOI, 0);
  const maxOI = Math.max(totalCallOI, totalPutOI);

  return (
    <div style={foStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={foStyles.header}>
          <div>
            <span className="badge-glow">DERIVATIVES RESEARCH</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>Futures & Options (F&O) Analytics</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
              Track derivative open interest (OI) build-ups, rollovers, and options chain distributions in real-time.
            </p>
          </div>

          {/* Stock Selector */}
          <div style={foStyles.selectorBox}>
            <label style={foStyles.selectorLabel}>Select Ticker:</label>
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              style={foStyles.select}
            >
              {optionsStocks.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.symbol} ({s.sector})</option>
              ))}
            </select>
          </div>
        </div>

        {/* F&O Analytics Summary Cards */}
        <div style={foStyles.metaGrid}>
          <div className="glass-card" style={foStyles.metaCard}>
            <div style={foStyles.metaTitle}>Spot Price</div>
            <div style={foStyles.metaPrice}>₹{liveSpot.toLocaleString()}</div>
            <span style={{ fontSize: '0.75rem', color: liveChange >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
              {liveChange >= 0 ? '+' : ''}{liveChange.toFixed(2)}% Today
            </span>
          </div>

          <div className="glass-card" style={foStyles.metaCard}>
            <div style={foStyles.metaTitle}>PCR (Open Interest)</div>
            <div style={foStyles.metaValue}>{livePCR.toFixed(2)}</div>
            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 700 }}>
              {livePCR >= 1.0 ? 'Bullish Sentiment' : 'Bearish Sentiment'}
            </span>
          </div>

          <div className="glass-card" style={foStyles.metaCard}>
            <div style={foStyles.metaTitle}>OI Buildup Interpretation</div>
            <div style={{...foStyles.metaValue, color: '#10b981'}}>Long Build Up</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Open interest rising with spot price</span>
          </div>
        </div>

        {/* Option Chain & Charts */}
        <div style={foStyles.layoutGrid}>
          
          {/* Options Chain Table */}
          <div className="glass-card" style={{ padding: '20px 0', backgroundColor: '#0d0f17' }}>
            <div style={{ padding: '0 20px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Option Chain Matrix</h3>
              <button 
                className="badge-glow" 
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedStockForModal(activeStock)}
              >
                Analyze Trends
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={foStyles.table}>
                <thead>
                  <tr style={foStyles.thRow}>
                    <th colSpan="2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.04)', color: '#10b981' }}>CALLS</th>
                    <th style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>STRIKE</th>
                    <th colSpan="2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.04)', color: '#ef4444' }}>PUTS</th>
                  </tr>
                  <tr style={foStyles.thRowSub}>
                    <th>OI (QTY)</th>
                    <th>LTP (₹)</th>
                    <th style={{ color: '#f59e0b' }}>Strike Price</th>
                    <th>LTP (₹)</th>
                    <th>OI (QTY)</th>
                  </tr>
                </thead>
                <tbody>
                  {chain.map((row, idx) => (
                    <tr key={idx} style={foStyles.tr}>
                      <td style={{ color: '#94a3b8' }}>{row.callOI.toLocaleString()}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>₹{row.callPrice.toFixed(2)}</td>
                      <td style={{ fontWeight: 800, color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.01)' }}>{row.strike}</td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>₹{row.putPrice.toFixed(2)}</td>
                      <td style={{ color: '#94a3b8' }}>{row.putOI.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Open Interest Distribution Chart */}
          <div className="glass-card" style={foStyles.chartCard}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>OI Distribution Concentration</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 24 }}>
              Comparing total aggregate call contracts vs put contracts for the active expiry cycle.
            </p>

            <div style={foStyles.barContainer}>
              <div style={foStyles.barItem}>
                <div style={foStyles.barLabels}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Total Call Open Interest</span>
                  <span style={{ fontWeight: 700, color: '#ef4444' }}>{totalCallOI.toLocaleString()} Contracts</span>
                </div>
                <div style={foStyles.barTrack}>
                  <div style={{
                    ...foStyles.barProgress,
                    backgroundColor: '#ef4444',
                    width: `${(totalCallOI / maxOI) * 100}%`
                  }} />
                </div>
              </div>

              <div style={foStyles.barItem}>
                <div style={foStyles.barLabels}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Total Put Open Interest</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{totalPutOI.toLocaleString()} Contracts</span>
                </div>
                <div style={foStyles.barTrack}>
                  <div style={{
                    ...foStyles.barProgress,
                    backgroundColor: '#10b981',
                    width: `${(totalPutOI / maxOI) * 100}%`
                  }} />
                </div>
              </div>
            </div>

            <div style={foStyles.tipsCard}>
              <Info size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Option Writers (Institutions) typically sell calls to establish resistance, and write puts to form supports. A Put-Call Ratio (PCR) above 1.0 indicates put writing dominance, suggesting market supports are stronger than immediate resistances.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const foStyles = {
  container: {
    padding: '40px 0 64px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '24px',
    marginBottom: '32px',
  },
  selectorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  selectorLabel: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#94a3b8',
  },
  select: {
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    outline: 'none',
    fontWeight: 600,
    cursor: 'pointer',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  metaCard: {
    padding: '20px',
    backgroundColor: '#0d0f17',
    textAlign: 'center',
  },
  metaTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  metaPrice: {
    fontSize: '1.8rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    color: '#ffffff',
    marginBottom: '4px',
  },
  metaValue: {
    fontSize: '1.8rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    color: '#ffffff',
    marginBottom: '4px',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '32px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
  thRow: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    fontSize: '0.75rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    'th': {
      padding: '10px',
    }
  },
  thRowSub: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#64748b',
    'th': {
      padding: '10px',
    }
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    'td': {
      padding: '12px 10px',
    }
  },
  chartCard: {
    padding: '24px',
    backgroundColor: '#0d0f17',
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '20px',
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  barLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  barTrack: {
    width: '100%',
    height: '10px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  barProgress: {
    height: '100%',
    borderRadius: '6px',
  },
  tipsCard: {
    marginTop: '32px',
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.12)',
    borderRadius: '8px',
    padding: '16px',
  }
};
