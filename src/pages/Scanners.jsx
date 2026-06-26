import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronRight, Activity, Filter, Info } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';

export default function Scanners({ setSelectedStockForModal }) {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'price' | 'volume' | 'technical' | 'candlestick' | 'rmi' | 'dow' | 'seasonality'
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [filteredStocks, setFilteredStocks] = useState([]);

  // Sub-filters mapping
  const subFilters = {
    all: [{ id: 'all', label: 'All Indicators' }],
    price: [
      { id: 'all', label: 'All Price Moves' },
      { id: 'new52h', label: 'New 52W High' },
      { id: 'new52l', label: 'New 52W Low' },
      { id: 'gapup', label: 'Gap Ups' }
    ],
    volume: [
      { id: 'all', label: 'All Volume Scans' },
      { id: 'highVol', label: 'High Volume Gainers' },
      { id: 'highDel', label: 'High Delivery %' }
    ],
    technical: [
      { id: 'all', label: 'All Technicals' },
      { id: 'rsiBull', label: 'RSI Bullish (>60)' },
      { id: 'rsiBear', label: 'RSI Bearish (<45)' },
      { id: 'macdBull', label: 'MACD Bullish' }
    ],
    candlestick: [
      { id: 'all', label: 'All Patterns' },
      { id: 'bullRev', label: 'Bullish Reversal' },
      { id: 'bearRev', label: 'Bearish Reversal' }
    ],
    rmi: [
      { id: 'all', label: 'All RMI Signs' },
      { id: 'rmiBuy', label: 'RMI Buy Signals' },
      { id: 'rmiSell', label: 'RMI Sell Signals' }
    ],
    dow: [
      { id: 'all', label: 'All Trends' },
      { id: 'hh', label: 'Higher Highs' },
      { id: 'll', label: 'Lower Lows' }
    ],
    seasonality: [
      { id: 'all', label: 'All Seasons' },
      { id: 'highAnn', label: 'High Annualized (>15%)' }
    ]
  };

  // Run filters
  useEffect(() => {
    let result = [...mockStocks];

    // Filter by Category
    if (activeCategory !== 'all') {
      if (activeCategory === 'price') {
        if (activeSubFilter === 'new52h') result = result.filter(s => s.near52High);
        else if (activeSubFilter === 'new52l') result = result.filter(s => s.near52Low);
        else if (activeSubFilter === 'gapup') result = result.filter(s => s.gapUp);
      }
      else if (activeCategory === 'volume') {
        if (activeSubFilter === 'highVol') result = result.filter(s => s.volume > 5000000);
        else if (activeSubFilter === 'highDel') result = result.filter(s => s.deliveryPercent > 65);
        else result = result.filter(s => s.volume > 3000000);
      }
      else if (activeCategory === 'technical') {
        if (activeSubFilter === 'rsiBull') result = result.filter(s => s.rsi >= 60);
        else if (activeSubFilter === 'rsiBear') result = result.filter(s => s.rsi < 45);
        else if (activeSubFilter === 'macdBull') result = result.filter(s => s.macd.includes('Bullish'));
      }
      else if (activeCategory === 'candlestick') {
        if (activeSubFilter === 'bullRev') result = result.filter(s => s.candlestick.includes('Bullish') || s.candlestick === 'Hammer');
        else if (activeSubFilter === 'bearRev') result = result.filter(s => s.candlestick.includes('Bearish'));
      }
      else if (activeCategory === 'rmi') {
        if (activeSubFilter === 'rmiBuy') result = result.filter(s => s.rmiSignal === 'Buy');
        else if (activeSubFilter === 'rmiSell') result = result.filter(s => s.rmiSignal === 'Sell');
      }
      else if (activeCategory === 'dow') {
        if (activeSubFilter === 'hh') result = result.filter(s => s.dowTrend === 'Higher High');
        else if (activeSubFilter === 'll') result = result.filter(s => s.dowTrend === 'Lower Low');
      }
      else if (activeCategory === 'seasonality') {
        if (activeSubFilter === 'highAnn') result = result.filter(s => s.seasonality.annualized > 15);
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.symbol.toLowerCase().includes(q) || 
        s.name.toLowerCase().includes(q)
      );
    }

    // Sort Results
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle nested values
      if (sortField === 'annualized') {
        valA = a.seasonality.annualized;
        valB = b.seasonality.annualized;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? valA - valB 
          : valB - valA;
      }
    });

    setFilteredStocks(result);
  }, [activeCategory, activeSubFilter, searchQuery, sortField, sortDirection]);

  // Handle category shift (resets sub-filter)
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveSubFilter('all');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div style={scannerStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={scannerStyles.header}>
          <div>
            <span className="badge-glow">PRO ANALYTICS SUITE</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>Earn With Us Stock Scanners</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
              Scan, filter, and pick winning stocks in seconds with advanced mathematical screening triggers.
            </p>
          </div>

          <div style={scannerStyles.searchContainer}>
            <Search size={18} style={scannerStyles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by ticker or company name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={scannerStyles.searchInput}
            />
          </div>
        </div>

        {/* Sidebar + Table Grid */}
        <div style={scannerStyles.grid}>
          
          {/* Filters Column */}
          <div style={scannerStyles.filtersCol}>
            <div className="glass-card" style={scannerStyles.card}>
              <div style={scannerStyles.filterHeading}>
                <SlidersHorizontal size={16} color="#10b981" />
                <span>Scanner Categories</span>
              </div>
              
              <div style={scannerStyles.categoryList}>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'all' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'all' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('all')}
                >
                  All Scanners
                </button>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'price' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'price' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('price')}
                >
                  Price Scanners
                </button>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'volume' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'volume' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('volume')}
                >
                  Volumes & Delivery
                </button>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'technical' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'technical' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('technical')}
                >
                  Technical Indicators
                </button>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'candlestick' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'candlestick' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('candlestick')}
                >
                  Candlestick Patterns
                </button>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'rmi' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'rmi' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('rmi')}
                >
                  RMI Buy/Sell
                </button>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'dow' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'dow' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('dow')}
                >
                  Dow Trend Scans
                </button>
                <button 
                  style={{...scannerStyles.categoryBtn, color: activeCategory === 'seasonality' ? '#10b981' : '#94a3b8', backgroundColor: activeCategory === 'seasonality' ? 'rgba(16,185,129,0.06)' : 'transparent'}}
                  onClick={() => handleCategoryChange('seasonality')}
                >
                  Seasonality
                </button>
              </div>
            </div>
          </div>

          {/* Table Column */}
          <div style={scannerStyles.tableCol}>
            
            {/* Sub-Filters Tabs Bar */}
            <div style={scannerStyles.subTabs}>
              {subFilters[activeCategory]?.map((tab) => (
                <button 
                  key={tab.id}
                  style={{
                    ...scannerStyles.subTabBtn,
                    backgroundColor: activeSubFilter === tab.id ? '#1e293b' : 'rgba(255,255,255,0.02)',
                    borderColor: activeSubFilter === tab.id ? '#10b981' : 'rgba(255,255,255,0.06)',
                    color: activeSubFilter === tab.id ? '#ffffff' : '#94a3b8'
                  }}
                  onClick={() => setActiveSubFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Results Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={scannerStyles.table}>
                  <thead>
                    <tr style={scannerStyles.tableHeaderRow}>
                      <th style={scannerStyles.th} onClick={() => handleSort('symbol')}>
                        SYMBOL <ArrowUpDown size={12} style={scannerStyles.sortIcon} />
                      </th>
                      <th style={{...scannerStyles.th, textAlign: 'left'}} onClick={() => handleSort('name')}>
                        COMPANY NAME <ArrowUpDown size={12} style={scannerStyles.sortIcon} />
                      </th>
                      <th style={scannerStyles.th} onClick={() => handleSort('price')}>
                        PRICE <ArrowUpDown size={12} style={scannerStyles.sortIcon} />
                      </th>
                      <th style={scannerStyles.th} onClick={() => handleSort('change')}>
                        CHANGE % <ArrowUpDown size={12} style={scannerStyles.sortIcon} />
                      </th>
                      <th style={scannerStyles.th} onClick={() => handleSort('volume')}>
                        VOLUME <ArrowUpDown size={12} style={scannerStyles.sortIcon} />
                      </th>
                      {activeCategory === 'technical' && (
                        <th style={scannerStyles.th} onClick={() => handleSort('rsi')}>
                          RSI <ArrowUpDown size={12} style={scannerStyles.sortIcon} />
                        </th>
                      )}
                      {activeCategory === 'seasonality' && (
                        <th style={scannerStyles.th} onClick={() => handleSort('annualized')}>
                          ANNUALIZED <ArrowUpDown size={12} style={scannerStyles.sortIcon} />
                        </th>
                      )}
                      <th style={scannerStyles.th}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((stock) => (
                        <tr 
                          key={stock.symbol} 
                          style={scannerStyles.tr}
                          className="table-row-hover"
                          onClick={() => setSelectedStockForModal(stock)}
                        >
                          <td style={{...scannerStyles.td, fontWeight: 700, color: '#ffffff'}}>{stock.symbol}</td>
                          <td style={{...scannerStyles.td, textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem'}}>{stock.name}</td>
                          <td style={{...scannerStyles.td, fontWeight: 600}}>₹{stock.price.toFixed(2)}</td>
                          <td style={{
                            ...scannerStyles.td, 
                            fontWeight: 700,
                            color: stock.change >= 0 ? '#10b981' : '#ef4444'
                          }}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </td>
                          <td style={{...scannerStyles.td, color: '#94a3b8'}}>{stock.volume.toLocaleString()}</td>
                          
                          {activeCategory === 'technical' && (
                            <td style={{...scannerStyles.td, fontWeight: 600, color: stock.rsi >= 60 ? '#10b981' : stock.rsi < 45 ? '#ef4444' : '#ffffff'}}>
                              {stock.rsi.toFixed(1)}
                            </td>
                          )}
                          {activeCategory === 'seasonality' && (
                            <td style={{...scannerStyles.td, fontWeight: 600, color: '#f59e0b'}}>
                              {stock.seasonality.annualized.toFixed(1)}%
                            </td>
                          )}

                          <td style={scannerStyles.td}>
                            <button 
                              className="badge-glow" 
                              style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStockForModal(stock);
                              }}
                            >
                              Details <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={scannerStyles.emptyTd}>
                          No stocks found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={scannerStyles.disclaimer}>
              <Info size={14} style={{ marginRight: 6 }} />
              <span>Earnings releases, dividend payouts, and promoter trades are captured dynamically. Mock analytics data feed is simulated at 5-minute ticks.</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

const scannerStyles = {
  container: {
    padding: '40px 0 64px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '24px',
    marginBottom: '40px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '12px 18px',
    width: '100%',
    maxWidth: '360px',
  },
  searchIcon: {
    color: '#64748b',
    marginRight: '10px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '0.9rem',
    width: '100%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '32px',
  },
  filtersCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    padding: '24px 16px',
    backgroundColor: '#0d0f17',
  },
  filterHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  categoryBtn: {
    background: 'none',
    border: 'none',
    textAlign: 'left',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: '0.15s ease',
    width: '100%',
  },
  tableCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  subTabs: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  subTabBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: '0.15s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#0d0f17',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  th: {
    padding: '16px 20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    textAlign: 'center',
  },
  sortIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: '4px',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: '0.15s ease',
  },
  td: {
    padding: '16px 20px',
    fontSize: '0.9rem',
    color: '#e2e8f0',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  emptyTd: {
    padding: '40px',
    color: '#64748b',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  disclaimer: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#64748b',
    lineHeight: '1.4',
    padding: '0 8px',
  }
};
