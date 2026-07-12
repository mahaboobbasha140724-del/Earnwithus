import React, { useState } from 'react';
import { Grid, Filter, Info, Eye } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';
import { niftySectors } from '../data/niftySectors';
import { usePaperTrade } from '../context/PaperTradeContext';

export default function Heatmaps({ setSelectedStockForModal }) {
  const { marketData } = usePaperTrade();
  const [activeSectorFilter, setActiveSectorFilter] = useState('all'); // 'all' | 'Energy' | 'IT' | 'Financials' | 'Consumer'

  // Filter stocks
  const getSectorStocks = () => {
    if (activeSectorFilter === 'all') {
      return niftySectors.map(s => {
        let live = null;
        if (s.symbol === 'NIFTY BANK') {
          live = marketData['BANKNIFTY'];
        } else {
          live = marketData[s.symbol];
        }

        if (live) {
          return {
            ...s,
            price: live.price,
            change: live.change !== undefined ? live.change : (live.close > 0 ? Number((((live.price - live.close) / live.close) * 100).toFixed(2)) : s.change),
            high52: s.price * 1.08,
            low52: s.price * 0.92,
            peRatio: 22.5,
            marketCap: "N/A",
            rmiSignal: "Buy",
            dowTrend: "Higher High",
            seasonality: { avgReturn: 2.1, medianReturn: 1.8, annualized: 11.5, maxGain: 8.2 },
            sector: 'Sector Index'
          };
        }

        return {
          ...s,
          high52: s.price * 1.08,
          low52: s.price * 0.92,
          peRatio: 22.5,
          marketCap: "N/A",
          rmiSignal: "Buy",
          dowTrend: "Higher High",
          seasonality: { avgReturn: 2.1, medianReturn: 1.8, annualized: 11.5, maxGain: 8.2 },
          sector: 'Sector Index'
        };
      });
    }

    const mergedStocks = mockStocks.map(s => {
      const live = marketData[s.symbol];
      if (live) {
        return {
          ...s,
          price: live.price,
          change: live.change !== undefined ? live.change : (live.close > 0 ? Number((((live.price - live.close) / live.close) * 100).toFixed(2)) : s.change),
          volume: live.volume || s.volume
        };
      }
      return s;
    });

    let result = mergedStocks.filter(s => s.sector !== 'Indices'); // Exclude Nifty/BankNifty indices
    if (activeSectorFilter === 'Energy') return result.filter(s => s.sector === 'Energy');
    if (activeSectorFilter === 'IT') return result.filter(s => s.sector === 'Information Technology');
    if (activeSectorFilter === 'Financials') return result.filter(s => s.sector === 'Financial Services');
    if (activeSectorFilter === 'Consumer') return result.filter(s => s.sector === 'Consumer Goods');
    if (activeSectorFilter === 'Auto') return result.filter(s => s.sector === 'Automobile');
    if (activeSectorFilter === 'Metal') return result.filter(s => s.sector === 'Metals');
    if (activeSectorFilter === 'Pharma') return result.filter(s => s.sector === 'Pharmaceuticals');
    return result;
  };

  const currentStocks = getSectorStocks();

  // Helper to calculate color gradient based on stock change percentage
  const getHeatmapColor = (change) => {
    if (change >= 2.0) return '#047857'; // Deep emerald
    if (change >= 1.0) return '#10b981'; // Emerald
    if (change >= 0.0) return '#a7f3d0'; // Light emerald/mint (needs dark text)
    if (change > -1.0) return '#fca5a5'; // Light red/pink (needs dark text)
    return '#dc2626'; // Red
  };

  const getTextColor = (change) => {
    if (change >= 0.0 && change < 1.0) return '#065f46'; // Dark green text for light mint box
    if (change > -1.0 && change < 0.0) return '#991b1b'; // Dark red text for pink box
    return '#ffffff';
  };

  return (
    <div style={heatmapStyles.container} className="animate-fade-in">
      <div className="page-wrapper">

        {/* Page Header */}
        <div style={heatmapStyles.header}>
          <div>
            <span className="badge-glow">MARKET VISUALIZER</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>Sector Performance Heatmaps</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
              Color-coded stock heatmaps simplify market analysis for better trading decisions. Click blocks to open detailed stock analytics.
            </p>
          </div>

          {/* Sector Filters */}
          <div style={heatmapStyles.filterBar}>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'all' ? '#10b981' : 'transparent', color: activeSectorFilter === 'all' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('all')}
            >
              All Sectors
            </button>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'IT' ? '#10b981' : 'transparent', color: activeSectorFilter === 'IT' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('IT')}
            >
              IT Sectors
            </button>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'Energy' ? '#10b981' : 'transparent', color: activeSectorFilter === 'Energy' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('Energy')}
            >
              Energy Sectors
            </button>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'Financials' ? '#10b981' : 'transparent', color: activeSectorFilter === 'Financials' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('Financials')}
            >
              Financial Services
            </button>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'Consumer' ? '#10b981' : 'transparent', color: activeSectorFilter === 'Consumer' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('Consumer')}
            >
              Consumer Goods
            </button>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'Auto' ? '#10b981' : 'transparent', color: activeSectorFilter === 'Auto' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('Auto')}
            >
              Automobile
            </button>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'Metal' ? '#10b981' : 'transparent', color: activeSectorFilter === 'Metal' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('Metal')}
            >
              Metals
            </button>
            <button 
              style={{...heatmapStyles.filterBtn, backgroundColor: activeSectorFilter === 'Pharma' ? '#10b981' : 'transparent', color: activeSectorFilter === 'Pharma' ? '#07080d' : '#94a3b8'}}
              onClick={() => setActiveSectorFilter('Pharma')}
            >
              Pharma Sectors
            </button>
          </div>
        </div>

        {/* Color Legend */}
        <div style={heatmapStyles.legend}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Performance Scale:</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{...heatmapStyles.legendBox, backgroundColor: '#dc2626'}} />
            <span style={heatmapStyles.legendText}>&lt; -1.0%</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{...heatmapStyles.legendBox, backgroundColor: '#fca5a5'}} />
            <span style={heatmapStyles.legendText}>-1% to 0%</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{...heatmapStyles.legendBox, backgroundColor: '#a7f3d0'}} />
            <span style={heatmapStyles.legendText}>0% to +1%</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{...heatmapStyles.legendBox, backgroundColor: '#10b981'}} />
            <span style={heatmapStyles.legendText}>+1% to +2%</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{...heatmapStyles.legendBox, backgroundColor: '#047857'}} />
            <span style={heatmapStyles.legendText}>&gt; +2%</span>
          </div>
        </div>

        {activeSectorFilter !== 'all' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Filtering by <strong>{activeSectorFilter === 'IT' ? 'Information Technology' : activeSectorFilter === 'Energy' ? 'Energy' : activeSectorFilter === 'Financials' ? 'Financial Services' : activeSectorFilter === 'Consumer' ? 'Consumer Goods' : activeSectorFilter === 'Auto' ? 'Automobile' : activeSectorFilter === 'Metal' ? 'Metals' : activeSectorFilter === 'Pharma' ? 'Pharmaceuticals' : activeSectorFilter}</strong>
            </span>
            <button 
              onClick={() => setActiveSectorFilter('all')}
              style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Heatmap Grid Panel */}
        <div className="glass-card" style={heatmapStyles.gridPanel}>
          
          <div style={heatmapStyles.boxContainer}>
            {currentStocks.map((stock) => {
              const bg = getHeatmapColor(stock.change);
              const fg = getTextColor(stock.change);
              
              return (
                <div 
                  key={stock.symbol}
                  onClick={() => setSelectedStockForModal(stock)}
                  style={{
                    ...heatmapStyles.heatmapBox,
                    backgroundColor: bg,
                    color: fg
                  }}
                  className="heatmap-box-hover"
                >
                  <div style={heatmapStyles.boxHeader}>
                    <span style={heatmapStyles.symbol}>{stock.symbol}</span>
                    <Eye size={12} opacity={0.6} />
                  </div>
                  <div style={heatmapStyles.boxBody}>
                    <div style={heatmapStyles.price}>₹{stock.price.toFixed(2)}</div>
                    <div style={heatmapStyles.change}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                  </div>
                  <div style={heatmapStyles.boxFooter}>
                    {stock.sector}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Info Box */}
        <div style={heatmapStyles.infoCard}>
          <Info size={18} color="#10b981" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
            💡 <strong>Visual Trading Tip:</strong> Green grids signify buying strength (accumulation), while red grids showcase profit-booking (distribution). When multiple IT/Finance stocks cluster in deep green, it shows strong sector rotation.
          </p>
        </div>

      </div>
    </div>
  );
}

const heatmapStyles = {
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
  filterBar: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: '0.15s ease',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  legendBox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
  },
  legendText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  gridPanel: {
    padding: '24px',
    backgroundColor: '#0d0f17',
    minHeight: '380px',
  },
  boxContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
  },
  heatmapBox: {
    borderRadius: '10px',
    padding: '16px',
    height: '130px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  boxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    fontWeight: 800,
    fontSize: '1rem',
    letterSpacing: '-0.02em',
  },
  boxBody: {
    margin: '8px 0',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
  },
  change: {
    fontSize: '0.85rem',
    fontWeight: 600,
    marginTop: '2px',
  },
  boxFooter: {
    fontSize: '0.65rem',
    fontWeight: 600,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  infoCard: {
    marginTop: '24px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '8px',
    padding: '16px',
  }
};
