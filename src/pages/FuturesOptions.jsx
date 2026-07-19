import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, ChevronRight, Activity, TrendingUp, TrendingDown, Layers, Search, RefreshCw, BarChart2, Filter } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';
import { usePaperTrade } from '../context/PaperTradeContext';

export default function FuturesOptions({ setSelectedStockForModal }) {
  const { marketData, getOptionChain, backendUrl } = usePaperTrade();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'oi_cycle' | 'option_chain'
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY50');
  const [cycleFilter, setCycleFilter] = useState('ALL'); // 'ALL' | 'LONG_BUILDUP' | 'SHORT_BUILDUP' | 'SHORT_COVERING' | 'LONG_UNWINDING'
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [liveFII, setLiveFII] = useState({
    nifty: 24056.00,
    niftyChange: 0.14,
    banknifty: 58177.05,
    bankniftyChange: 0.05,
    pcr: 1.06
  });

  useEffect(() => {
    if (!backendUrl) return;
    const fetchFO = () => {
      fetch(`${backendUrl}/api/market/fii-dii`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setLiveFII({
              nifty: Number(resData.nifty || 24056.00),
              niftyChange: (resData.niftyChange !== undefined && resData.niftyChange !== null) ? Number(resData.niftyChange) : 0.14,
              banknifty: Number(resData.banknifty || 58177.05),
              bankniftyChange: (resData.bankniftyChange !== undefined && resData.bankniftyChange !== null) ? Number(resData.bankniftyChange) : 0.05,
              pcr: (resData.pcr !== undefined && resData.pcr !== null) ? Number(resData.pcr) : 1.06
            });
          }
        })
        .catch(err => {
          console.error("Failed to fetch live F&O details:", err);
        });
    };

    fetchFO();
    const interval = setInterval(fetchFO, 15000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Compute Futures data for all stocks
  const futuresData = mockStocks.map(stock => {
    const live = marketData[stock.symbol];
    const spot = live ? live.price : stock.price;
    const change = live ? (live.change !== undefined ? live.change : stock.change) : stock.change;
    
    // Future price estimation (spot + premium/discount basis)
    const basisFactor = (stock.symbol.charCodeAt(0) % 5) * 0.15;
    const futurePrice = Number((spot * (1 + basisFactor / 100)).toFixed(2));
    const basis = Number((futurePrice - spot).toFixed(2));
    
    // Simulated OI Change %
    const rawOiChg = ((stock.symbol.charCodeAt(1) || 65) % 11) - 5 + (change > 0 ? 1.5 : -1.5);
    const oiChange = Number(rawOiChg.toFixed(2));
    const oiQty = Math.floor(spot * 450 + (stock.symbol.charCodeAt(0) * 1200));

    // Determine Cycle:
    // Long Buildup: Price UP, OI UP
    // Short Buildup: Price DOWN, OI UP
    // Short Covering: Price UP, OI DOWN
    // Long Unwinding: Price DOWN, OI DOWN
    let cycle = 'LONG_BUILDUP';
    let cycleLabel = 'Long Build-up';
    let cycleColor = '#10b981';
    let cycleBg = 'rgba(16, 185, 129, 0.12)';

    if (change >= 0 && oiChange >= 0) {
      cycle = 'LONG_BUILDUP';
      cycleLabel = 'Long Build-up';
      cycleColor = '#10b981';
      cycleBg = 'rgba(16, 185, 129, 0.15)';
    } else if (change < 0 && oiChange >= 0) {
      cycle = 'SHORT_BUILDUP';
      cycleLabel = 'Short Build-up';
      cycleColor = '#ef4444';
      cycleBg = 'rgba(239, 68, 68, 0.15)';
    } else if (change >= 0 && oiChange < 0) {
      cycle = 'SHORT_COVERING';
      cycleLabel = 'Short Covering';
      cycleColor = '#3b82f6';
      cycleBg = 'rgba(59, 130, 246, 0.15)';
    } else {
      cycle = 'LONG_UNWINDING';
      cycleLabel = 'Long Unwinding';
      cycleColor = '#f59e0b';
      cycleBg = 'rgba(245, 158, 11, 0.15)';
    }

    return {
      ...stock,
      spot,
      change,
      futurePrice,
      basis,
      oiChange,
      oiQty,
      cycle,
      cycleLabel,
      cycleColor,
      cycleBg
    };
  });

  // Cycle Counts
  const counts = {
    ALL: futuresData.length,
    LONG_BUILDUP: futuresData.filter(d => d.cycle === 'LONG_BUILDUP').length,
    SHORT_BUILDUP: futuresData.filter(d => d.cycle === 'SHORT_BUILDUP').length,
    SHORT_COVERING: futuresData.filter(d => d.cycle === 'SHORT_COVERING').length,
    LONG_UNWINDING: futuresData.filter(d => d.cycle === 'LONG_UNWINDING').length,
  };

  // Filtered Futures list
  const filteredFutures = futuresData.filter(item => {
    const matchesCycle = cycleFilter === 'ALL' || item.cycle === cycleFilter;
    const matchesSector = sectorFilter === 'ALL' || item.sector === sectorFilter;
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCycle && matchesSector && matchesSearch;
  });

  const activeStock = futuresData.find(s => s.symbol === selectedSymbol) || futuresData[0];
  const dynamicChain = getOptionChain(selectedSymbol, activeStock.spot);
  const totalCallOI = dynamicChain.reduce((acc, row) => acc + row.callOI, 0);
  const totalPutOI = dynamicChain.reduce((acc, row) => acc + row.putOI, 0);
  const maxOI = Math.max(totalCallOI, totalPutOI) || 1;

  // Sectors list
  const sectors = ['ALL', ...new Set(mockStocks.map(s => s.sector))];

  return (
    <div style={foStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={foStyles.header}>
          <div>
            <span className="badge-glow">REAL-TIME DERIVATIVES ANALYTICS</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>Futures Dashboard & F&O Build-Up Cycle</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
              Track derivative open interest (OI) build-ups, futures basis, intraday trends, and option distributions.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={foStyles.tabGroup}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{
                ...foStyles.navTab,
                backgroundColor: activeTab === 'dashboard' ? 'var(--color-primary)' : 'var(--bg-card)',
                color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <Activity size={16} /> Futures Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('oi_cycle')}
              style={{
                ...foStyles.navTab,
                backgroundColor: activeTab === 'oi_cycle' ? 'var(--color-primary)' : 'var(--bg-card)',
                color: activeTab === 'oi_cycle' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <Layers size={16} /> OI Build-up Cycle
            </button>
            <button 
              onClick={() => setActiveTab('option_chain')}
              style={{
                ...foStyles.navTab,
                backgroundColor: activeTab === 'option_chain' ? 'var(--color-primary)' : 'var(--bg-card)',
                color: activeTab === 'option_chain' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <BarChart2 size={16} /> Option Chain
            </button>
          </div>
        </div>

        {/* Live Indices Futures Overview Cards */}
        {(() => {
          const niftyChg = Number(liveFII.niftyChange ?? 0.14);
          const bankChg = Number(liveFII.bankniftyChange ?? 0.05);
          const pcrVal = Number(liveFII.pcr ?? 1.06);
          const niftyPrice = Number(liveFII.nifty || 24056);
          const bankPrice = Number(liveFII.banknifty || 58177);

          return (
            <div style={foStyles.metaGrid}>
              <div className="glass-card" style={foStyles.metaCard}>
                <div style={foStyles.metaTitle}>NIFTY FUTURES</div>
                <div style={foStyles.metaPrice}>₹{niftyPrice.toLocaleString()}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: niftyChg >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {niftyChg >= 0 ? '+' : ''}{niftyChg.toFixed(2)}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Basis: +18.5 pts</span>
                </div>
              </div>

              <div className="glass-card" style={foStyles.metaCard}>
                <div style={foStyles.metaTitle}>BANKNIFTY FUTURES</div>
                <div style={foStyles.metaPrice}>₹{bankPrice.toLocaleString()}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: bankChg >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {bankChg >= 0 ? '+' : ''}{bankChg.toFixed(2)}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Basis: +42.0 pts</span>
                </div>
              </div>

              <div className="glass-card" style={foStyles.metaCard}>
                <div style={foStyles.metaTitle}>MARKET PCR (OI)</div>
                <div style={foStyles.metaPrice}>{pcrVal.toFixed(2)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 700 }}>
                    {pcrVal >= 1.0 ? 'Bullish Dominance' : 'Bearish Dominance'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Long Buildup</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 1: FUTURES DASHBOARD MAIN VIEW */}
        {(activeTab === 'dashboard' || activeTab === 'oi_cycle') && (
          <>
            {/* Build-Up Cycle Filter Pills */}
            <div style={foStyles.cycleFilterRow}>
              <button
                onClick={() => setCycleFilter('ALL')}
                style={{
                  ...foStyles.cyclePill,
                  backgroundColor: cycleFilter === 'ALL' ? 'var(--color-primary)' : 'var(--bg-card)',
                  color: cycleFilter === 'ALL' ? '#ffffff' : 'var(--text-primary)',
                  borderColor: 'var(--border-light)'
                }}
              >
                All F&O ({counts.ALL})
              </button>
              <button
                onClick={() => setCycleFilter('LONG_BUILDUP')}
                style={{
                  ...foStyles.cyclePill,
                  backgroundColor: cycleFilter === 'LONG_BUILDUP' ? '#10b981' : 'var(--bg-card)',
                  color: cycleFilter === 'LONG_BUILDUP' ? '#ffffff' : '#10b981',
                  borderColor: '#10b981'
                }}
              >
                🟢 Long Build-up ({counts.LONG_BUILDUP})
              </button>
              <button
                onClick={() => setCycleFilter('SHORT_BUILDUP')}
                style={{
                  ...foStyles.cyclePill,
                  backgroundColor: cycleFilter === 'SHORT_BUILDUP' ? '#ef4444' : 'var(--bg-card)',
                  color: cycleFilter === 'SHORT_BUILDUP' ? '#ffffff' : '#ef4444',
                  borderColor: '#ef4444'
                }}
              >
                🔴 Short Build-up ({counts.SHORT_BUILDUP})
              </button>
              <button
                onClick={() => setCycleFilter('SHORT_COVERING')}
                style={{
                  ...foStyles.cyclePill,
                  backgroundColor: cycleFilter === 'SHORT_COVERING' ? '#3b82f6' : 'var(--bg-card)',
                  color: cycleFilter === 'SHORT_COVERING' ? '#ffffff' : '#3b82f6',
                  borderColor: '#3b82f6'
                }}
              >
                🔵 Short Covering ({counts.SHORT_COVERING})
              </button>
              <button
                onClick={() => setCycleFilter('LONG_UNWINDING')}
                style={{
                  ...foStyles.cyclePill,
                  backgroundColor: cycleFilter === 'LONG_UNWINDING' ? '#f59e0b' : 'var(--bg-card)',
                  color: cycleFilter === 'LONG_UNWINDING' ? '#ffffff' : '#f59e0b',
                  borderColor: '#f59e0b'
                }}
              >
                🟠 Long Unwinding ({counts.LONG_UNWINDING})
              </button>
            </div>

            {/* Controls Bar: Search & Sector Filters */}
            <div style={foStyles.controlsBar}>
              <div style={foStyles.searchWrapper}>
                <Search size={16} style={{ color: 'var(--text-muted)', marginLeft: 12 }} />
                <input
                  type="text"
                  placeholder="Filter stock futures (e.g. RELIANCE, INFYS)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={foStyles.searchInput}
                />
              </div>

              <div style={foStyles.sectorFilterBox}>
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sector:</span>
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  style={foStyles.selectInput}
                >
                  {sectors.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Futures Stocks Data Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={foStyles.table}>
                  <thead>
                    <tr style={foStyles.thRow}>
                      <th style={{ textAlign: 'left', paddingLeft: '20px' }}>SYMBOL / STOCK</th>
                      <th style={{ textAlign: 'left' }}>SECTOR</th>
                      <th style={{ textAlign: 'right' }}>SPOT PRICE (₹)</th>
                      <th style={{ textAlign: 'right' }}>FUTURE PRICE (₹)</th>
                      <th style={{ textAlign: 'right' }}>BASIS (SPREAD)</th>
                      <th style={{ textAlign: 'right' }}>PRICE CHG %</th>
                      <th style={{ textAlign: 'right' }}>OI CHG %</th>
                      <th style={{ textAlign: 'center' }}>BUILD-UP CYCLE</th>
                      <th style={{ textAlign: 'center', paddingRight: '20px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFutures.length > 0 ? (
                      filteredFutures.map((stock) => (
                        <tr key={stock.symbol} style={foStyles.tr}>
                          <td style={{ textAlign: 'left', paddingLeft: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {stock.symbol}
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{stock.name}</div>
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {stock.sector}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                            ₹{stock.spot.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                            ₹{stock.futurePrice.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: stock.basis >= 0 ? '#10b981' : '#ef4444' }}>
                            {stock.basis >= 0 ? '+' : ''}{stock.basis.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: stock.change >= 0 ? '#10b981' : '#ef4444' }}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: stock.oiChange >= 0 ? '#10b981' : '#ef4444' }}>
                            {stock.oiChange >= 0 ? '+' : ''}{stock.oiChange.toFixed(2)}%
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span 
                              style={{ 
                                fontSize: '0.72rem', 
                                fontWeight: 700, 
                                padding: '4px 10px', 
                                borderRadius: '9999px',
                                backgroundColor: stock.cycleBg,
                                color: stock.cycleColor,
                                border: `1px solid ${stock.cycleColor}44`
                              }}
                            >
                              {stock.cycleLabel}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', paddingRight: '20px' }}>
                            <button
                              onClick={() => {
                                setSelectedSymbol(stock.symbol);
                                setSelectedStockForModal(stock);
                              }}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              Analyze
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No futures data found matching filter query "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: OPTION CHAIN MATRIX & OI DISTRIBUTION */}
        {activeTab === 'option_chain' && (
          <div style={foStyles.layoutGrid}>
            {/* Options Chain Table */}
            <div className="glass-card" style={{ padding: '20px 0' }}>
              <div style={{ padding: '0 20px 16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Option Chain Matrix ({selectedSymbol})</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Live Strikes distribution, Call LTP vs Put LTP & Open Interest
                  </p>
                </div>

                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  style={foStyles.selectInput}
                >
                  {mockStocks.filter(s => s.options).map(s => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={foStyles.table}>
                  <thead>
                    <tr style={foStyles.thRow}>
                      <th colSpan="2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>CALLS</th>
                      <th style={{ backgroundColor: 'var(--bg-card-hover)' }}>STRIKE</th>
                      <th colSpan="2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>PUTS</th>
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
                    {dynamicChain.map((row, idx) => (
                      <tr key={idx} style={foStyles.tr}>
                        <td style={{ color: 'var(--text-secondary)' }}>{row.callOI.toLocaleString()}</td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>₹{row.callPrice.toFixed(2)}</td>
                        <td style={{ fontWeight: 800, color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>{row.strike}</td>
                        <td style={{ color: '#ef4444', fontWeight: 600 }}>₹{row.putPrice.toFixed(2)}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{row.putOI.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Open Interest Distribution Chart */}
            <div className="glass-card" style={foStyles.chartCard}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 6, color: 'var(--text-primary)' }}>OI Distribution Concentration</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 24 }}>
                Comparing aggregate Call contracts vs Put contracts for active expiry.
              </p>

              <div style={foStyles.barContainer}>
                <div style={foStyles.barItem}>
                  <div style={foStyles.barLabels}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Total Call Open Interest</span>
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
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Total Put Open Interest</span>
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
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Option Writers establish market resistance by selling calls and create support by writing puts. A Put-Call Ratio (PCR) above 1.0 indicates put writing dominance, indicating market support.
                </p>
              </div>
            </div>
          </div>
        )}

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
  tabGroup: {
    display: 'flex',
    gap: '8px',
    backgroundColor: 'var(--bg-card)',
    padding: '6px',
    borderRadius: '12px',
    border: '1px solid var(--border-light)'
  },
  navTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  metaCard: {
    padding: '20px',
    backgroundColor: 'var(--bg-card)',
  },
  metaTitle: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  metaPrice: {
    fontSize: '1.8rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  cycleFilterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px'
  },
  cyclePill: {
    padding: '10px 16px',
    borderRadius: '9999px',
    border: '1px solid',
    fontWeight: 700,
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '9999px',
    width: '340px',
    maxWidth: '100%',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    padding: '10px 14px',
    fontSize: '0.85rem',
    width: '100%',
  },
  sectorFilterBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  selectInput: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-primary)',
    padding: '8px 14px',
    borderRadius: '8px',
    outline: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  layoutGrid: {
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
    borderBottom: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-card-hover)',
    fontSize: '0.75rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    'th': {
      padding: '12px 14px',
    }
  },
  thRowSub: {
    borderBottom: '1px solid var(--border-light)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    'th': {
      padding: '10px',
    }
  },
  tr: {
    borderBottom: '1px solid var(--border-light)',
    transition: 'background-color 0.15s ease',
    'td': {
      padding: '12px 14px',
    }
  },
  chartCard: {
    padding: '24px',
    backgroundColor: 'var(--bg-card)',
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
    backgroundColor: 'var(--bg-card-hover)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    border: '1px solid rgba(16, 185, 129, 0.18)',
    borderRadius: '10px',
    padding: '16px',
  }
};
