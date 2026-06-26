import React, { useState, useEffect } from 'react';
import { Compass, Play, Pause, RotateCcw, Info, Check } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';

export default function RRG({ setSelectedStockForModal }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineStep, setTimelineStep] = useState(4); // 0 (oldest) to 4 (current)
  const [selectedStocks, setSelectedStocks] = useState(['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'ITC']);

  // Auto animation loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineStep((prev) => {
          if (prev >= 4) {
            return 0; // Loop back
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleStockSelection = (sym) => {
    if (selectedStocks.includes(sym)) {
      if (selectedStocks.length > 1) {
        setSelectedStocks(prev => prev.filter(s => s !== sym));
      }
    } else {
      setSelectedStocks(prev => [...prev, sym]);
    }
  };

  // Get active coordinates for a stock at the selected timeline step
  const getCoordinates = (stock) => {
    if (!stock.rrg) return { x: 100, y: 100 };
    
    // Timeline maps:
    // 0: prevX[3], prevY[3] (oldest)
    // 1: prevX[2], prevY[2]
    // 2: prevX[1], prevY[1]
    // 3: prevX[0], prevY[0]
    // 4: current x, y
    if (timelineStep === 4) return { x: stock.rrg.x, y: stock.rrg.y };
    const revIdx = 3 - timelineStep;
    return { x: stock.rrg.prevX[revIdx], y: stock.rrg.prevY[revIdx] };
  };

  // SVG dimensions for RRG grid plotting
  const svgSize = 460;
  const padding = 40;
  
  // RRG ranges (let's assume X goes from 95 to 105, Y from 95 to 105)
  const minVal = 96.0;
  const maxVal = 104.0;
  const range = maxVal - minVal;

  const getSvgCoords = (x, y) => {
    const svgX = padding + ((x - minVal) * (svgSize - (padding * 2)) / range);
    const svgY = svgSize - padding - ((y - minVal) * (svgSize - (padding * 2)) / range);
    return { x: svgX, y: svgY };
  };

  return (
    <div style={rrgStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={rrgStyles.header}>
          <div>
            <span className="badge-glow">ROTATIONAL MOMENTUM</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>Relative Rotation Graph (RRG)</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
              Spot sector rotations early. Observe stock sectors rotate between Leading, Weakening, Lagging, and Improving quadrants.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div style={rrgStyles.layoutGrid}>
          
          {/* 1. Interactive RRG Scatter Plot Column */}
          <div className="glass-card" style={rrgStyles.chartCard}>
            <div style={rrgStyles.chartWrapper}>
              
              <svg width="100%" height="100%" viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ backgroundColor: '#0a0b10', borderRadius: '12px' }}>
                {/* Quadrants dividers */}
                <line x1={svgSize / 2} y1={padding} x2={svgSize / 2} y2={svgSize - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                <line x1={padding} y1={svgSize / 2} x2={svgSize - padding} y2={svgSize / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                
                {/* Quadrant Text Labels */}
                <text x={svgSize - padding - 60} y={padding + 24} fill="#10b981" fontSize="11" fontWeight="800" letterSpacing="0.05em">LEADING</text>
                <text x={svgSize - padding - 75} y={svgSize - padding - 16} fill="#f59e0b" fontSize="11" fontWeight="800" letterSpacing="0.05em">WEAKENING</text>
                <text x={padding + 16} y={svgSize - padding - 16} fill="#ef4444" fontSize="11" fontWeight="800" letterSpacing="0.05em">LAGGING</text>
                <text x={padding + 16} y={padding + 24} fill="#0ea5e9" fontSize="11" fontWeight="800" letterSpacing="0.05em">IMPROVING</text>

                {/* Plot Trails and Dots */}
                {mockStocks
                  .filter(stock => selectedStocks.includes(stock.symbol))
                  .map(stock => {
                    const activePt = getCoordinates(stock);
                    const activeSvg = getSvgCoords(activePt.x, activePt.y);

                    // Build trail coordinates path
                    const points = [];
                    // add historical points
                    for (let step = 0; step <= timelineStep; step++) {
                      if (step === 4) {
                        points.push(getSvgCoords(stock.rrg.x, stock.rrg.y));
                      } else {
                        points.push(getSvgCoords(stock.rrg.prevX[3 - step], stock.rrg.prevY[3 - step]));
                      }
                    }

                    const pathD = points.reduce((acc, pt, idx) => {
                      return acc + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
                    }, '');

                    const color = activePt.x >= 100 && activePt.y >= 100 ? '#10b981' :
                                  activePt.x >= 100 && activePt.y < 100 ? '#f59e0b' :
                                  activePt.x < 100 && activePt.y < 100 ? '#ef4444' : '#0ea5e9';

                    return (
                      <g key={stock.symbol} style={{ cursor: 'pointer' }} onClick={() => setSelectedStockForModal(stock)}>
                        {/* Trail Line */}
                        {points.length > 1 && (
                          <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.65" />
                        )}
                        
                        {/* Current Location Point */}
                        <circle cx={activeSvg.x} cy={activeSvg.y} r="6" fill={color} />
                        <circle cx={activeSvg.x} cy={activeSvg.y} r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
                        
                        {/* Label text */}
                        <text x={activeSvg.x + 10} y={activeSvg.y + 4} fill="#ffffff" fontSize="9" fontWeight="700">{stock.symbol}</text>
                      </g>
                    );
                  })
                }
              </svg>

            </div>

            {/* Timeline Controls */}
            <div style={rrgStyles.controls}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={rrgStyles.controlBtn}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button 
                  onClick={() => { setIsPlaying(false); setTimelineStep(4); }}
                  style={rrgStyles.controlBtn}
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', gap: 12 }}>
                <span style={rrgStyles.timelineLabel}>4 Periods Ago</span>
                <input 
                  type="range"
                  min="0"
                  max="4"
                  value={timelineStep}
                  onChange={(e) => { setIsPlaying(false); setTimelineStep(Number(e.target.value)); }}
                  style={rrgStyles.slider}
                />
                <span style={rrgStyles.timelineLabel}>Current</span>
              </div>
            </div>
          </div>

          {/* 2. Stock Checklist Column */}
          <div style={rrgStyles.selectorsCol}>
            <div className="glass-card" style={rrgStyles.card}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Plot Tickers</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>
                Select up to 8 stock symbols to visualize and cross-examine rotational trends.
              </p>

              <div style={rrgStyles.selectorsList}>
                {mockStocks
                  .filter(s => s.rrg)
                  .map(stock => {
                    const isChecked = selectedStocks.includes(stock.symbol);
                    const coords = getCoordinates(stock);
                    const quadrant = coords.x >= 100 && coords.y >= 100 ? 'Leading' :
                                     coords.x >= 100 && coords.y < 100 ? 'Weakening' :
                                     coords.x < 100 && coords.y < 100 ? 'Lagging' : 'Improving';
                                     
                    const color = quadrant === 'Leading' ? '#10b981' :
                                  quadrant === 'Weakening' ? '#f59e0b' :
                                  quadrant === 'Lagging' ? '#ef4444' : '#0ea5e9';

                    return (
                      <div 
                        key={stock.symbol}
                        onClick={() => toggleStockSelection(stock.symbol)}
                        style={{
                          ...rrgStyles.selectorItem,
                          borderColor: isChecked ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.04)',
                          backgroundColor: isChecked ? 'rgba(16,185,129,0.02)' : 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            ...rrgStyles.checkbox,
                            backgroundColor: isChecked ? '#10b981' : 'transparent',
                            borderColor: isChecked ? '#10b981' : '#64748b'
                          }}>
                            {isChecked && <Check size={10} color="#07080d" strokeWidth={4} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{stock.symbol}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{stock.sector}</div>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <span style={{...rrgStyles.quadrantBadge, color: color, backgroundColor: `${color}15` }}>
                            {quadrant}
                          </span>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            <div style={rrgStyles.infoCard}>
              <Info size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                RRG analysis measures relative strength (RS-Ratio on vertical Y axis) and momentum (RS-Momentum on horizontal X axis). Leading stocks move clockwise toward weakening, then lagging, improving, and back to leading.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const rrgStyles = {
  container: {
    padding: '40px 0 64px 0',
  },
  header: {
    marginBottom: '36px',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '32px',
  },
  chartCard: {
    padding: '24px',
    backgroundColor: '#0d0f17',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  chartWrapper: {
    width: '100%',
    aspectRatio: '1',
    maxWidth: '440px',
    margin: '0 auto',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.04)',
    flexWrap: 'wrap',
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: '0.15s ease',
    ':hover': {
      backgroundColor: '#10b981',
      color: '#07080d',
    }
  },
  slider: {
    flexGrow: 1,
    accentColor: '#10b981',
    cursor: 'pointer',
  },
  timelineLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
  },
  selectorsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    padding: '24px',
    backgroundColor: '#0d0f17',
  },
  selectorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '340px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  selectorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: '0.15s ease',
  },
  checkbox: {
    width: '14px',
    height: '14px',
    border: '1px solid',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.15s ease',
  },
  quadrantBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  infoCard: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    padding: '16px',
  }
};
