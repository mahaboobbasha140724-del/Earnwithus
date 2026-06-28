import React, { useState, useEffect } from 'react';
import { Compass, Play, Pause, RotateCcw, Info, Check, ArrowRight, ShieldAlert } from 'lucide-react';
import { niftySectors } from '../data/niftySectors';

export default function RRG() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineStep, setTimelineStep] = useState(4); // 0 (oldest) to 4 (current)
  const [selectedSectors, setSelectedSectors] = useState(['NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO', 'NIFTY FMCG', 'NIFTY METAL']);
  const [activeSector, setActiveSector] = useState(niftySectors[0]); // Default to first sector

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

  const toggleSectorSelection = (sym) => {
    if (selectedSectors.includes(sym)) {
      if (selectedSectors.length > 1) {
        setSelectedSectors(prev => prev.filter(s => s !== sym));
      }
    } else {
      if (selectedSectors.length < 8) {
        setSelectedSectors(prev => [...prev, sym]);
      } else {
        alert("You can plot up to 8 sectors simultaneously.");
      }
    }
  };

  // Get active coordinates for a sector at the selected timeline step
  const getCoordinates = (sector) => {
    if (!sector.rrg) return { x: 100, y: 100 };
    
    // Timeline maps:
    // 0: prevX[3], prevY[3] (oldest)
    // 1: prevX[2], prevY[2]
    // 2: prevX[1], prevY[1]
    // 3: prevX[0], prevY[0]
    // 4: current x, y
    if (timelineStep === 4) return { x: sector.rrg.x, y: sector.rrg.y };
    const revIdx = 3 - timelineStep;
    return { x: sector.rrg.prevX[revIdx], y: sector.rrg.prevY[revIdx] };
  };

  // SVG dimensions for RRG grid plotting
  const svgSize = 460;
  const padding = 40;
  
  // RRG ranges (X goes from 95 to 105, Y from 95 to 105)
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
            <span className="badge-glow">INDEX ROTATION TRACKER</span>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>Relative Rotation Graph (RRG)</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
              Monitor Nifty sector rotations against the Nifty 50 benchmark. Spot sectors transitioning between Leading, Weakening, Lagging, and Improving quadrants.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div style={rrgStyles.layoutGrid}>
          
          {/* 1. Interactive RRG Scatter Plot Column */}
          <div className="glass-card" style={rrgStyles.chartCard}>
            <div style={rrgStyles.chartWrapper}>
              
              <svg width="100%" height="100%" viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ backgroundColor: '#0a0b10', borderRadius: '12px' }}>
                <defs>
                  <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                  </marker>
                  <marker id="arrow-yellow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#ef4444" />
                  </marker>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#0ea5e9" />
                  </marker>
                </defs>

                {/* Quadrant Backgrounds */}
                <rect x={padding} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(14, 165, 233, 0.1)" /> {/* Improving: Top Left */}
                <rect x={svgSize/2} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(16, 185, 129, 0.1)" /> {/* Leading: Top Right */}
                <rect x={padding} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(239, 68, 68, 0.1)" /> {/* Lagging: Bottom Left */}
                <rect x={svgSize/2} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(245, 158, 11, 0.1)" /> {/* Weakening: Bottom Right */}

                {/* Quadrants dividers */}
                <line x1={svgSize / 2} y1={padding} x2={svgSize / 2} y2={svgSize - padding} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1={padding} y1={svgSize / 2} x2={svgSize - padding} y2={svgSize / 2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                
                {/* Quadrant Text Labels */}
                <text x={svgSize - padding - 60} y={padding + 24} fill="#10b981" fontSize="11" fontWeight="800" letterSpacing="0.05em">LEADING</text>
                <text x={svgSize - padding - 75} y={svgSize - padding - 16} fill="#f59e0b" fontSize="11" fontWeight="800" letterSpacing="0.05em">WEAKENING</text>
                <text x={padding + 16} y={svgSize - padding - 16} fill="#ef4444" fontSize="11" fontWeight="800" letterSpacing="0.05em">LAGGING</text>
                <text x={padding + 16} y={padding + 24} fill="#0ea5e9" fontSize="11" fontWeight="800" letterSpacing="0.05em">IMPROVING</text>

                {/* Plot Trails and Dots */}
                {niftySectors
                  .filter(sector => selectedSectors.includes(sector.symbol))
                  .map(sector => {
                    const activePt = getCoordinates(sector);
                    const activeSvg = getSvgCoords(activePt.x, activePt.y);

                    // Build trail coordinates path
                    const points = [];
                    for (let step = 0; step <= timelineStep; step++) {
                      if (step === 4) {
                        points.push(getSvgCoords(sector.rrg.x, sector.rrg.y));
                      } else {
                        points.push(getSvgCoords(sector.rrg.prevX[3 - step], sector.rrg.prevY[3 - step]));
                      }
                    }

                    const pathD = points.reduce((acc, pt, idx) => {
                      return acc + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
                    }, '');

                    const color = activePt.x >= 100 && activePt.y >= 100 ? '#10b981' :
                                  activePt.x >= 100 && activePt.y < 100 ? '#f59e0b' :
                                  activePt.x < 100 && activePt.y < 100 ? '#ef4444' : '#0ea5e9';

                    const arrowId = activePt.x >= 100 && activePt.y >= 100 ? 'arrow-green' :
                                    activePt.x >= 100 && activePt.y < 100 ? 'arrow-yellow' :
                                    activePt.x < 100 && activePt.y < 100 ? 'arrow-red' : 'arrow-blue';

                    const isFocused = activeSector?.symbol === sector.symbol;

                    return (
                      <g 
                        key={sector.symbol} 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => setActiveSector(sector)}
                      >
                        {/* Trail Line */}
                        {points.length > 1 && (
                          <path 
                            d={pathD} 
                            fill="none" 
                            stroke={color} 
                            strokeWidth={isFocused ? 2.5 : 1.5} 
                            opacity={isFocused ? 0.95 : 0.8}
                            markerEnd={`url(#${arrowId})`}
                          />
                        )}
                        
                        {/* Current Location Point */}
                        <circle cx={activeSvg.x} cy={activeSvg.y} r={isFocused ? "8" : "6"} fill={color} />
                        <circle cx={activeSvg.x} cy={activeSvg.y} r={isFocused ? "16" : "12"} fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
                        
                        {/* Label text */}
                        <text 
                          x={activeSvg.x + 12} 
                          y={activeSvg.y + 4} 
                          fill={isFocused ? "#ffffff" : "#94a3b8"} 
                          fontSize={isFocused ? "10" : "9"} 
                          fontWeight={isFocused ? "800" : "600"}
                        >
                          {sector.symbol}
                        </text>
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
                <span style={rrgStyles.timelineLabel}>4 Weeks Ago</span>
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

          {/* 2. Selector and Sector Details Checklist Column */}
          <div style={rrgStyles.selectorsCol}>
            
            {/* Sector Selector List Card */}
            <div className="glass-card" style={rrgStyles.card}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Select Sectors</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>
                Select up to 8 Nifty Sector indices to visualize rotational momentum.
              </p>

              <div style={rrgStyles.selectorsList}>
                {niftySectors.map(sector => {
                  const isChecked = selectedSectors.includes(sector.symbol);
                  const coords = getCoordinates(sector);
                  const quadrant = coords.x >= 100 && coords.y >= 100 ? 'Leading' :
                                   coords.x >= 100 && coords.y < 100 ? 'Weakening' :
                                   coords.x < 100 && coords.y < 100 ? 'Lagging' : 'Improving';
                                   
                  const color = quadrant === 'Leading' ? '#10b981' :
                                quadrant === 'Weakening' ? '#f59e0b' :
                                quadrant === 'Lagging' ? '#ef4444' : '#0ea5e9';

                  const isFocused = activeSector?.symbol === sector.symbol;

                  return (
                    <div 
                      key={sector.symbol}
                      onClick={() => {
                        toggleSectorSelection(sector.symbol);
                        setActiveSector(sector);
                      }}
                      style={{
                        ...rrgStyles.selectorItem,
                        borderColor: isFocused 
                          ? '#10b981' 
                          : isChecked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                        backgroundColor: isFocused 
                          ? 'rgba(16,185,129,0.05)' 
                          : isChecked ? 'rgba(16,185,129,0.01)' : 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div 
                          style={{
                            ...rrgStyles.checkbox,
                            backgroundColor: isChecked ? '#10b981' : 'transparent',
                            borderColor: isChecked ? '#10b981' : '#64748b'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectorSelection(sector.symbol);
                          }}
                        >
                          {isChecked && <Check size={10} color="#07080d" strokeWidth={4} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sector.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sector.symbol}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                          <div style={{ fontWeight: 600 }}>₹{sector.price.toLocaleString()}</div>
                          <div style={{ color: sector.change >= 0 ? '#10b981' : '#ef4444', fontSize: '0.7rem' }}>
                            {sector.change >= 0 ? '+' : ''}{sector.change}%
                          </div>
                        </div>
                        <span style={{...rrgStyles.quadrantBadge, color: color, backgroundColor: `${color}15` }}>
                          {quadrant}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Sector Constituents & Details Panel */}
            {activeSector && (
              <div className="glass-card animate-fade-in" style={rrgStyles.detailsCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>{activeSector.name} constituents</h3>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>Ticker: {activeSector.symbol}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{activeSector.price.toLocaleString()}</div>
                    <div style={{ color: activeSector.change >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginTop: 2 }}>
                      {activeSector.change >= 0 ? '+' : ''}{activeSector.change}%
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <Compass size={14} color="#10b981" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Outlook</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{activeSector.outlook}</p>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>Top Heavyweight Weights</div>
                  <div style={rrgStyles.weightsList}>
                    {activeSector.constituents.map((item, idx) => (
                      <div key={idx} style={rrgStyles.weightItem}>
                        <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{item.name}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>{item.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={rrgStyles.infoCard}>
              <Info size={16} color="#10b981" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                RRG analysis measures relative strength (RS-Ratio Y axis) and momentum (RS-Momentum X axis) against Nifty 50. Leading sectors move clockwise to weakening, lagging, improving, and back to leading. Click any sector node on the graph to inspect constituents and technical outlooks.
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
    maxHeight: '260px',
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
  detailsCard: {
    padding: '24px',
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(16, 185, 129, 0.15)',
  },
  weightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.03)',
    padding: '12px',
  },
  weightItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '6px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    ':last-child': {
      paddingBottom: 0,
      borderBottom: 'none',
    }
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
