import React from 'react';
import { PieChart, TrendingUp, TrendingDown, Info, ShieldAlert, Award } from 'lucide-react';

export default function Sentiment() {
  
  // Custom mock data for institutional flows
  const flowData = [
    { segment: "FII Cash Market", netValue: -1240.50, action: "Net Seller" },
    { segment: "DII Cash Market", netValue: 2150.80, action: "Net Buyer" },
    { segment: "FII Index Futures", netValue: 480.20, action: "Net Buyer" },
    { segment: "FII Index Options", netValue: -850.30, action: "Net Seller" },
    { segment: "FII Stock Futures", netValue: 920.40, action: "Net Buyer" }
  ];

  // Custom mock sector sentiment levels
  const sectorSentiment = [
    { sector: "Financial Services", bullishPct: 84, trend: "Highly Bullish" },
    { sector: "Energy", bullishPct: 72, trend: "Bullish" },
    { sector: "Consumer Goods", bullishPct: 55, trend: "Neutral" },
    { sector: "Information Technology", bullishPct: 38, trend: "Bearish" }
  ];

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

        {/* 1. Dials Grid */}
        <div style={sentimentStyles.dialsGrid}>
          
          {/* Dial 1: Fear & Greed */}
          <div className="glass-card" style={sentimentStyles.dialCard}>
            <div style={sentimentStyles.dialTitle}>Fear & Greed Index</div>
            <div style={sentimentStyles.dialWrapper}>
              <svg width="180" height="100" viewBox="0 0 200 110">
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
                <path d="M20 100 A80 80 0 0 1 145 40" fill="none" stroke="url(#fearGreedGrad)" strokeWidth="16" strokeLinecap="round" />
                <defs>
                  <linearGradient id="fearGreedGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="8" fill="#ffffff" />
                <line x1="100" y1="100" x2="135" y2="45" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{...sentimentStyles.dialVal, color: '#10b981'}}>68 - Greed</div>
            <p style={sentimentStyles.dialDesc}>Buyers are dominating, signaling strong momentum build-ups.</p>
          </div>

          {/* Dial 2: PCR */}
          <div className="glass-card" style={sentimentStyles.dialCard}>
            <div style={sentimentStyles.dialTitle}>Put-Call Ratio (PCR)</div>
            <div style={sentimentStyles.dialWrapper}>
              <svg width="180" height="100" viewBox="0 0 200 110">
                <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
                <path d="M20 100 A80 80 0 0 1 125 32" fill="none" stroke="#0ea5e9" strokeWidth="16" strokeLinecap="round" />
                <circle cx="100" cy="100" r="8" fill="#ffffff" />
                <line x1="100" y1="100" x2="118" y2="35" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{...sentimentStyles.dialVal, color: '#0ea5e9'}}>1.18 - Bullish</div>
            <p style={sentimentStyles.dialDesc}>Higher puts concentration suggests solid support structures.</p>
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
              <span className="badge-gold" style={{ fontSize: '0.65rem', textTransform: 'none' }}>Data Feed: Sensibull</span>
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
                          {isPositive ? '+' : ''}{row.netValue.toFixed(2)} Cr
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
          <span>FII/DII cash and derivatives data is sourced from Sensibull open index feeds. General stock and index pricing data is updated using free public feeds (NSE, Yahoo Finance) with 15-minute delays.</span>
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
// Add support for sub-nest table tags selector
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .header-main nav a:hover { color: #ffffff !important; }
    .search-item-hover:hover { background-color: rgba(255,255,255,0.04) !important; }
    .table-row-hover:hover { background-color: rgba(255,255,255,0.02) !important; }
    .heatmap-box-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.4); }
  `;
  document.head.appendChild(styleEl);
}
