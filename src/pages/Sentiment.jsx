import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, TrendingDown, Info, ShieldAlert, Award } from 'lucide-react';

export default function Sentiment() {
  const [flowData, setFlowData] = useState([
    { segment: "FII Cash Market", netValue: -1240.50, action: "Net Seller" },
    { segment: "DII Cash Market", netValue: 2150.80, action: "Net Buyer" },
    { segment: "FII Index Futures", netValue: 480.20, action: "Net Buyer" },
    { segment: "FII Index Options", netValue: -850.30, action: "Net Seller" },
    { segment: "FII Stock Futures", netValue: 920.40, action: "Net Buyer" }
  ]);
  const [pcr, setPcr] = useState(1.18);
  const [sentimentScore, setSentimentScore] = useState(68);
  const [date, setDate] = useState("Post-Market Hours");
  const [updatedAt, setUpdatedAt] = useState("Just now");
  const [source, setSource] = useState("Local Cache");
  const [nifty, setNifty] = useState(24056);
  const [niftyChange, setNiftyChange] = useState(0.14);
  const [banknifty, setBanknifty] = useState(58177.05);
  const [bankniftyChange, setBankniftyChange] = useState(0.05);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    
    const fetchSentiment = () => {
      fetch(`${API_BASE}/api/market/fii-dii`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            if (resData.flows) setFlowData(resData.flows);
            if (resData.pcr) setPcr(resData.pcr);
            if (resData.sentimentScore) setSentimentScore(resData.sentimentScore);
            if (resData.date) setDate(resData.date);
            if (resData.updatedAt) setUpdatedAt(resData.updatedAt);
            if (resData.source) setSource(resData.source);
            if (resData.nifty) setNifty(resData.nifty);
            if (resData.niftyChange !== undefined) setNiftyChange(resData.niftyChange);
            if (resData.banknifty) setBanknifty(resData.banknifty);
            if (resData.bankniftyChange !== undefined) setBankniftyChange(resData.bankniftyChange);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching sentiment data:", err);
          setLoading(false);
        });
    };

    setLoading(true);
    fetchSentiment();
    const interval = setInterval(fetchSentiment, 15000); // Real-time updates: poll every 15s
    return () => clearInterval(interval);
  }, []);

  // Custom mock sector sentiment levels
  const sectorSentiment = [
    { sector: "Financial Services", bullishPct: 84, trend: "Highly Bullish" },
    { sector: "Energy", bullishPct: 72, trend: "Bullish" },
    { sector: "Consumer Goods", bullishPct: 55, trend: "Neutral" },
    { sector: "Information Technology", bullishPct: 38, trend: "Bearish" }
  ];

  // Helper to calculate needle tip (length = 70)
  const getNeedleCoords = (value, minVal = 0, maxVal = 100) => {
    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const pct = ((clamped - minVal) / (maxVal - minVal)) * 100;
    const angle = 180 - (pct / 100) * 180;
    const rad = (angle * Math.PI) / 180;
    const x2 = 100 + 70 * Math.cos(rad);
    const y2 = 100 - 70 * Math.sin(rad);
    return { x2, y2 };
  };

  // Helper to calculate arc path for filled gauge
  const getArcPath = (value, minVal = 0, maxVal = 100, radius = 80) => {
    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const pct = ((clamped - minVal) / (maxVal - minVal)) * 100;
    const angle = 180 - (pct / 100) * 180;
    const rad = (angle * Math.PI) / 180;
    const xp = 100 + radius * Math.cos(rad);
    const yp = 100 - radius * Math.sin(rad);
    if (pct <= 1) return `M 20 100 A ${radius} ${radius} 0 0 1 21 100`;
    return `M 20 100 A ${radius} ${radius} 0 0 1 ${xp.toFixed(1)} ${yp.toFixed(1)}`;
  };

  const fgNeedle = getNeedleCoords(sentimentScore, 0, 100);
  const fgArc = getArcPath(sentimentScore, 0, 100);

  const pcrNeedle = getNeedleCoords(pcr, 0.4, 1.6);
  const pcrArc = getArcPath(pcr, 0.4, 1.6);

  // Interpretation helpers
  const getFgInterpretation = (score) => {
    if (score >= 70) return { text: `${score} - Extreme Greed`, color: '#10b981' };
    if (score >= 55) return { text: `${score} - Greed`, color: '#10b981' };
    if (score >= 45) return { text: `${score} - Neutral`, color: '#f59e0b' };
    if (score >= 30) return { text: `${score} - Fear`, color: '#ef4444' };
    return { text: `${score} - Extreme Fear`, color: '#ef4444' };
  };

  const getPcrInterpretation = (pcrVal) => {
    if (pcrVal >= 1.25) return { text: `${pcrVal} - Highly Bullish`, color: '#10b981' };
    if (pcrVal >= 1.0) return { text: `${pcrVal} - Bullish`, color: '#0ea5e9' };
    if (pcrVal >= 0.85) return { text: `${pcrVal} - Neutral`, color: '#f59e0b' };
    return { text: `${pcrVal} - Bearish`, color: '#ef4444' };
  };

  const fgInterpret = getFgInterpretation(sentimentScore);
  const pcrInterpret = getPcrInterpretation(pcr);

  return (
    <div style={sentimentStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={sentimentStyles.header}>
          <div>
            <span className="badge-glow">MARKET PSYCHOLOGY</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>Market Sentiment Indicators</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
              Understand underlying market emotions by tracking institutional Net Flows, Put-Call ratios, and Volatility indexes.
            </p>
          </div>
        </div>

        {/* Spot Indices Summary from Sensibull */}
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', backgroundColor: '#0d0f17', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Sensibull Feed Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: loading ? '#f59e0b' : '#10b981' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                {loading ? 'Refreshing feeds...' : `Live Feed: ${source}`}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(Date: {date})</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>NIFTY SPOT</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                {nifty.toLocaleString()}
                <span style={{ fontSize: '0.8rem', color: niftyChange >= 0 ? '#10b981' : '#ef4444', marginLeft: '6px' }}>
                  {niftyChange >= 0 ? '+' : ''}{niftyChange}%
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>BANKNIFTY SPOT</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                {banknifty.toLocaleString()}
                <span style={{ fontSize: '0.8rem', color: bankniftyChange >= 0 ? '#10b981' : '#ef4444', marginLeft: '6px' }}>
                  {bankniftyChange >= 0 ? '+' : ''}{bankniftyChange}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Dials Grid */}
        <div style={sentimentStyles.dialsGrid}>
          
          {/* Dial 1: Fear & Greed */}
          <div className="glass-card" style={sentimentStyles.dialCard}>
            <div style={sentimentStyles.dialTitle}>Fear & Greed Index</div>
            <div style={sentimentStyles.dialWrapper}>
              <svg width="180" height="100" viewBox="0 0 200 110">
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
                <path d={fgArc} fill="none" stroke="url(#fearGreedGrad)" strokeWidth="16" strokeLinecap="round" />
                <defs>
                  <linearGradient id="fearGreedGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="8" fill="#ffffff" />
                <line x1="100" y1="100" x2={fgNeedle.x2} y2={fgNeedle.y2} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{...sentimentStyles.dialVal, color: fgInterpret.color}}>{fgInterpret.text}</div>
            <p style={sentimentStyles.dialDesc}>
              {sentimentScore >= 60 
                ? "Buyers are dominating, signaling strong momentum build-ups."
                : sentimentScore >= 45 
                ? "Market sentiment is balanced with equal buyer/seller tension."
                : "Sellers are dominant, suggesting heavy defensive hedging is active."}
            </p>
          </div>

          {/* Dial 2: PCR */}
          <div className="glass-card" style={sentimentStyles.dialCard}>
            <div style={sentimentStyles.dialTitle}>Put-Call Ratio (PCR)</div>
            <div style={sentimentStyles.dialWrapper}>
              <svg width="180" height="100" viewBox="0 0 200 110">
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
                <path d={pcrArc} fill="none" stroke="#0ea5e9" strokeWidth="16" strokeLinecap="round" />
                <circle cx="100" cy="100" r="8" fill="#ffffff" />
                <line x1="100" y1="100" x2={pcrNeedle.x2} y2={pcrNeedle.y2} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{...sentimentStyles.dialVal, color: pcrInterpret.color}}>{pcrInterpret.text}</div>
            <p style={sentimentStyles.dialDesc}>
              {pcr >= 1.0 
                ? "Higher put open interest suggests solid structural support levels."
                : "Higher call open interest suggests heavy overhead resistance."}
            </p>
          </div>

          {/* Dial 3: Volatility VIX */}
          <div className="glass-card" style={sentimentStyles.dialCard}>
            <div style={sentimentStyles.dialTitle}>Volatility Index (India VIX)</div>
            <div style={sentimentStyles.dialWrapper}>
              <svg width="180" height="100" viewBox="0 0 200 110">
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
                <path d="M20 100 A80 80 0 0 1 70 42" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeLinecap="round" />
                <circle cx="100" cy="100" r="8" fill="#ffffff" />
                <line x1="100" y1="100" x2="68" y2="45" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{...sentimentStyles.dialVal, color: '#8b5cf6'}}>12.45 - Calm</div>
            <p style={sentimentStyles.dialDesc}>Low volatility levels indicate stable consolidated uptrends.</p>
          </div>

        </div>

        {/* 2. Institutional Flows & Sector Breakdown */}
        <div style={sentimentStyles.detailsGrid}>
          
          {/* Institutional Net Flows Table */}
          <div className="glass-card" style={{ padding: '24px 0', backgroundColor: '#0d0f17' }}>
            <h3 style={{ fontSize: '1.25rem', padding: '0 24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>FII & DII Daily Net Flows</span>
              <span className="badge-gold" style={{ fontSize: '0.65rem', textTransform: 'none' }}>Updated: {updatedAt}</span>
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={sentimentStyles.table}>
                <thead>
                  <tr style={sentimentStyles.thRow}>
                    <th>MARKET SEGMENT</th>
                    <th>NET VALUE (INR)</th>
                    <th>INTERPRETATION</th>
                  </tr>
                </thead>
                <tbody>
                  {flowData.map((row, i) => {
                    const isPositive = row.netValue >= 0;
                    return (
                      <tr key={i} style={sentimentStyles.tr}>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{row.segment}</td>
                        <td style={{
                          fontWeight: 700,
                          color: isPositive ? '#10b981' : '#ef4444'
                        }}>
                          {isPositive ? '+' : ''}{row.netValue.toLocaleString()} Cr
                        </td>
                        <td>
                          <span style={{
                            ...sentimentStyles.actionBadge,
                            color: isPositive ? '#10b981' : '#ef4444',
                            backgroundColor: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
                          }}>
                            {row.action}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sector Sentiment Breakdown */}
          <div className="glass-card" style={sentimentStyles.sectorCard}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Sector-wise Bullish Ratio</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 24 }}>
              Percentage of component stocks displaying bullish momentum signals in daily timeframes.
            </p>
            
            <div style={sentimentStyles.barContainer}>
              {sectorSentiment.map((row, i) => {
                const color = row.bullishPct >= 70 ? '#10b981' : 
                              row.bullishPct >= 50 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={i} style={sentimentStyles.barItem}>
                    <div style={sentimentStyles.barMeta}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{row.sector}</span>
                      <span style={{ fontWeight: 700, color: color }}>{row.bullishPct}% ({row.trend})</span>
                    </div>
                    <div style={sentimentStyles.barTrack}>
                      <div style={{
                        ...sentimentStyles.barProgress,
                        width: `${row.bullishPct}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}33`
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#64748b' }}>
          <Info size={14} color="#10b981" style={{ flexShrink: 0 }} />
          <span>FII/DII cash and derivatives data is sourced directly from Sensibull open index feeds. General stock and index pricing data is updated using free public feeds (NSE, Yahoo Finance) with 15-minute delays.</span>
        </div>

      </div>
    </div>
  );
}

const sentimentStyles = {
  container: {
    padding: '40px 0 64px 0',
  },
  header: {
    marginBottom: '36px',
  },
  dialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  dialCard: {
    padding: '24px',
    backgroundColor: '#0d0f17',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  dialTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dialWrapper: {
    margin: '24px 0 12px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
  },
  dialVal: {
    fontSize: '1.4rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    marginBottom: '8px',
  },
  dialDesc: {
    fontSize: '0.8rem',
    color: '#64748b',
    lineHeight: '1.4',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '32px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  thRow: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'left',
    backgroundColor: 'rgba(255,255,255,0.02)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    'th': {
      padding: '12px 24px',
    }
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    'td': {
      padding: '14px 24px',
    }
  },
  actionBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  sectorCard: {
    padding: '24px',
    backgroundColor: '#0d0f17',
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  barMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  barTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barProgress: {
    height: '100%',
    borderRadius: '4px',
  }
};
