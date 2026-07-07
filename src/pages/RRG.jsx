import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, Play, Pause, RotateCcw, Info, Check, ArrowRight, ShieldAlert,
  Sliders, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw, Layers,
  ZoomIn, ZoomOut, Eye, HelpCircle, X, ChevronRight, BarChart2, TrendingUp
} from 'lucide-react';
import { niftySectors } from '../data/niftySectors';
import { weeklyRrgData, dailyRrgData } from '../data/historicalRrgData';

export default function RRG() {
  // Navigation: 'tracker' | 'backtester'
  const [activeTab, setActiveTab] = useState('tracker');
  
  // Timeframe selection: 'weekly' | 'daily'
  const [timeframe, setTimeframe] = useState('weekly');

  const historicalRrgData = useMemo(() => {
    return timeframe === 'weekly' ? weeklyRrgData : dailyRrgData;
  }, [timeframe]);

  // --- MARKET SENTIMENT DATA STATE ---
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);

  // Fetch Market Live FII/DII Sentiment
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname.startsWith('192.168.') ||
                        window.location.hostname.startsWith('10.');
    const API_BASE = isLocalhost ? 'http://localhost:3001' : 'https://earnwithus.onrender.com';
    const fetchSentiment = () => {
      fetch(`${API_BASE}/api/market/fii-dii`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSentimentData(data);
          }
          setSentimentLoading(false);
        })
        .catch(err => {
          console.error("Error fetching sentiment in RRG:", err);
          setSentimentLoading(false);
        });
    };
    fetchSentiment();
    const interval = setInterval(fetchSentiment, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- TRACKER STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineStep, setTimelineStep] = useState(104); // latest index (0 to 104)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step

  // Reset timeline Step when timeframe changes
  useEffect(() => {
    setTimelineStep(104);
  }, [timeframe]);
  
  // Drilldown: null (sector level) or sector object (stock level)
  const [drillDownSector, setDrillDownSector] = useState(null);
  
  // Selected symbols to plot
  const [selectedSectors, setSelectedSectors] = useState(['NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO', 'NIFTY FMCG', 'NIFTY METAL']);
  const [selectedConstituents, setSelectedConstituents] = useState([]);
  
  // Focused item to show in constituents/details card
  const [focusedSector, setFocusedSector] = useState(null);
  const [focusedStock, setFocusedStock] = useState(null);

  // Visualization settings
  const [tailLength, setTailLength] = useState(4); // 1 to 12 weeks
  const [showTails, setShowTails] = useState(true);
  const [zoomLevel, setZoomLevel] = useState('normal'); // 'normal' (96-104) | 'zoomed' (98-102)

  // Quadrant filter checkmarks
  const [quadrantFilters, setQuadrantFilters] = useState({
    Leading: true,
    Weakening: true,
    Lagging: true,
    Improving: true
  });

  // --- BACKTESTER STATE ---
  const [entryTrigger, setEntryTrigger] = useState('improving_leading');
  const [exitTrigger, setExitTrigger] = useState('enters_lagging');
  const [useSlTp, setUseSlTp] = useState(true);
  const [stopLossPct, setStopLossPct] = useState(2.0);
  const [takeProfitPct, setTakeProfitPct] = useState(6.0);
  const [backtestPeriod, setBacktestPeriod] = useState('1y');
  const [universeType, setUniverseType] = useState('sectors'); // 'sectors' | 'all_stocks' | 'custom_sectors'
  const [customSectorsToBacktest, setCustomSectorsToBacktest] = useState(['NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO']);
  const [startingCapital, setStartingCapital] = useState(1000000);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);
  
  // Interactive trade analysis modal/popup state
  const [visualizedTrade, setVisualizedTrade] = useState(null);
  const [hoveredEquityPoint, setHoveredEquityPoint] = useState(null);

  // Set default focused sector once historical data is loaded
  useEffect(() => {
    if (historicalRrgData.sectors.length > 0 && !focusedSector) {
      setFocusedSector(historicalRrgData.sectors[0]);
    }
  }, [focusedSector]);

  // Set default selected constituents when drilldown sector changes
  useEffect(() => {
    if (drillDownSector) {
      const stockSymbols = drillDownSector.constituents.map(c => c.symbol);
      setSelectedConstituents(stockSymbols);
      if (drillDownSector.constituents.length > 0) {
        setFocusedStock(drillDownSector.constituents[0]);
      }
    } else {
      setFocusedStock(null);
    }
  }, [drillDownSector]);

  // Playback loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineStep((prev) => {
          if (prev >= 104) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const toggleSectorSelection = (symbol) => {
    if (selectedSectors.includes(symbol)) {
      if (selectedSectors.length > 1) {
        setSelectedSectors(prev => prev.filter(s => s !== symbol));
      }
    } else {
      if (selectedSectors.length < 10) {
        setSelectedSectors(prev => [...prev, symbol]);
      } else {
        alert("You can plot up to 10 sectors simultaneously.");
      }
    }
  };

  const toggleConstituentSelection = (symbol) => {
    if (selectedConstituents.includes(symbol)) {
      if (selectedConstituents.length > 1) {
        setSelectedConstituents(prev => prev.filter(c => c !== symbol));
      }
    } else {
      setSelectedConstituents(prev => [...prev, symbol]);
    }
  };

  // Get active coordinates from the historical data
  const getCoordinates = (symbol, step) => {
    const sector = historicalRrgData.sectors.find(s => s.symbol === symbol);
    if (!sector || !sector.rrg[step]) return { x: 100, y: 100 };
    return sector.rrg[step];
  };

  const getStockCoordinates = (stockSymbol, step) => {
    if (!drillDownSector) return { x: 100, y: 100 };
    const stock = drillDownSector.constituents.find(c => c.symbol === stockSymbol);
    if (!stock || !stock.rrg[step]) return { x: 100, y: 100 };
    return stock.rrg[step];
  };

  // Quadrant Helper
  const getQuadrant = (x, y) => {
    if (x >= 100 && y >= 100) return 'Leading';
    if (x >= 100 && y < 100) return 'Weakening';
    if (x < 100 && y < 100) return 'Lagging';
    return 'Improving';
  };

  const getQuadrantColor = (quadrant) => {
    switch(quadrant) {
      case 'Leading': return '#10b981'; // Green
      case 'Weakening': return '#f59e0b'; // Amber
      case 'Lagging': return '#ef4444'; // Red
      case 'Improving': return '#0ea5e9'; // Light Blue
      default: return '#94a3b8';
    }
  };

  // SVG Dimensioning
  const svgSize = 480;
  const padding = 40;
  
  // Coordinate zoom boundaries
  const minVal = zoomLevel === 'normal' ? 96.0 : 98.0;
  const maxVal = zoomLevel === 'normal' ? 104.0 : 102.0;
  const range = maxVal - minVal;

  const getSvgCoords = (x, y) => {
    // Clamp coordinates to fit in graph boundaries
    const clampedX = Math.max(minVal, Math.min(maxVal, x));
    const clampedY = Math.max(minVal, Math.min(maxVal, y));
    
    const svgX = padding + ((clampedX - minVal) * (svgSize - (padding * 2)) / range);
    const svgY = svgSize - padding - ((clampedY - minVal) * (svgSize - (padding * 2)) / range);
    return { x: svgX, y: svgY };
  };

  // --- RUN BACKTEST ENGINE ---
  const runBacktest = () => {
    setIsBacktesting(true);
    
    // Simulate slight lag for realistic dashboard loading effect
    setTimeout(() => {
      // Gather symbols for backtest
      let targetSymbols = [];
      if (universeType === 'sectors') {
        targetSymbols = historicalRrgData.sectors.map(s => s.symbol);
      } else if (universeType === 'custom_sectors') {
        targetSymbols = customSectorsToBacktest;
      } else if (universeType === 'all_stocks') {
        // top constituents of all sectors
        historicalRrgData.sectors.forEach(s => {
          s.constituents.forEach(c => {
            targetSymbols.push(c.symbol);
          });
        });
      }

      // Run backtest computation
      const params = {
        entryTrigger,
        exitTrigger,
        useSlTp,
        stopLossPct,
        takeProfitPct,
        backtestPeriod,
        selectedAssets: targetSymbols,
        startingCapital
      };

      const results = executeBacktestLogic(params);
      setBacktestResults(results);
      setIsBacktesting(false);
    }, 800);
  };

  const executeBacktestLogic = (params) => {
    const {
      entryTrigger,
      exitTrigger,
      useSlTp,
      stopLossPct,
      takeProfitPct,
      backtestPeriod,
      selectedAssets,
      startingCapital
    } = params;

    // 104 total weeks
    let startWeek = 0;
    if (backtestPeriod === '1y') startWeek = 52;
    else if (backtestPeriod === '6m') startWeek = 78;
    else if (backtestPeriod === '3m') startWeek = 91;

    let capital = startingCapital;
    let equityHistory = [];
    let activePositions = []; // { symbol, entryWeek, entryPrice, entryQty, entryQuadrant }
    let trades = []; // completed trades

    // Build fast lookup map for prices and RRG values
    const assetMap = {};
    historicalRrgData.sectors.forEach(sec => {
      if (selectedAssets.includes(sec.symbol)) {
        assetMap[sec.symbol] = {
          name: sec.name,
          symbol: sec.symbol,
          prices: sec.prices,
          rrg: sec.rrg,
          type: 'sector'
        };
      }
      sec.constituents.forEach(c => {
        if (selectedAssets.includes(c.symbol)) {
          assetMap[c.symbol] = {
            name: c.name,
            symbol: c.symbol,
            prices: c.prices,
            rrg: c.rrg,
            type: 'stock',
            parentSector: sec.symbol
          };
        }
      });
    });

    const activeSymbols = Object.keys(assetMap);
    const benchStartPrice = historicalRrgData.benchmark.prices[startWeek];
    const maxPositions = 5;

    for (let w = startWeek; w <= 104; w++) {
      // 1. Revalue open positions
      let positionValue = 0;
      activePositions.forEach(pos => {
        const currentPrice = assetMap[pos.symbol].prices[w];
        positionValue += pos.entryQty * currentPrice;
      });

      const currentPortfolioValue = capital + positionValue;
      equityHistory.push({
        week: w,
        date: historicalRrgData.dateLabels[w],
        strategyEquity: Math.round(currentPortfolioValue),
        benchmarkEquity: Math.round((historicalRrgData.benchmark.prices[w] / benchStartPrice) * startingCapital)
      });

      // 2. Check exits
      const positionsToKeep = [];
      activePositions.forEach(pos => {
        const currentPrice = assetMap[pos.symbol].prices[w];
        const pnlPct = (currentPrice - pos.entryPrice) / pos.entryPrice;
        const currentCoord = assetMap[pos.symbol].rrg[w];
        const prevCoord = assetMap[pos.symbol].rrg[w - 1] || currentCoord;
        
        const currentQuad = getQuadrant(currentCoord.x, currentCoord.y);
        const prevQuad = getQuadrant(prevCoord.x, prevCoord.y);
        
        let shouldExit = false;
        let exitReason = 'Trigger';

        // SL / TP Check
        if (useSlTp) {
          if (pnlPct <= -stopLossPct / 100) {
            shouldExit = true;
            exitReason = 'Stop Loss';
          } else if (pnlPct >= takeProfitPct / 100) {
            shouldExit = true;
            exitReason = 'Take Profit';
          }
        }

        // Quadrant Transition Checks
        if (!shouldExit && w > startWeek) {
          if (exitTrigger === 'enters_lagging' && currentQuad === 'Lagging') {
            shouldExit = true;
          } else if (exitTrigger === 'leading_weakening' && prevQuad === 'Leading' && currentQuad === 'Weakening') {
            shouldExit = true;
          } else if (exitTrigger === 'weakening_lagging' && prevQuad === 'Weakening' && currentQuad === 'Lagging') {
            shouldExit = true;
          } else if (exitTrigger === 'strength_drop' && currentCoord.y < 100 && prevCoord.y >= 100) {
            shouldExit = true;
          }
        }

        // Forced liquidation at final week
        if (w === 104) {
          shouldExit = true;
          exitReason = 'End of Period';
        }

        if (shouldExit) {
          const exitCash = pos.entryQty * currentPrice;
          capital += exitCash;
          trades.push({
            id: trades.length + 1,
            symbol: pos.symbol,
            name: assetMap[pos.symbol].name,
            entryWeek: pos.entryWeek,
            entryDate: historicalRrgData.dateLabels[pos.entryWeek],
            entryPrice: Math.round(pos.entryPrice * 100) / 100,
            entryQuadrant: pos.entryQuadrant,
            exitWeek: w,
            exitDate: historicalRrgData.dateLabels[w],
            exitPrice: Math.round(currentPrice * 100) / 100,
            exitQuadrant: currentQuad,
            pnl: Math.round(pnlPct * 10000) / 100,
            reason: exitReason
          });
        } else {
          positionsToKeep.push(pos);
        }
      });
      activePositions = positionsToKeep;

      // 3. Check entries
      if (w < 104 && activePositions.length < maxPositions) {
        const eligibleAssets = [];
        activeSymbols.forEach(sym => {
          if (activePositions.some(pos => pos.symbol === sym)) return;

          const currentCoord = assetMap[sym].rrg[w];
          const prevCoord = assetMap[sym].rrg[w - 1] || currentCoord;
          
          const currentQuad = getQuadrant(currentCoord.x, currentCoord.y);
          const prevQuad = getQuadrant(prevCoord.x, prevCoord.y);

          let meetsEntry = false;
          if (w > startWeek) {
            if (entryTrigger === 'improving_leading' && prevQuad === 'Improving' && currentQuad === 'Leading') {
              meetsEntry = true;
            } else if (entryTrigger === 'lagging_improving' && prevQuad === 'Lagging' && currentQuad === 'Improving') {
              meetsEntry = true;
            } else if (entryTrigger === 'enters_improving' && prevQuad !== 'Improving' && currentQuad === 'Improving') {
              meetsEntry = true;
            } else if (entryTrigger === 'enters_leading' && prevQuad !== 'Leading' && currentQuad === 'Leading') {
              meetsEntry = true;
            } else if (entryTrigger === 'strength_cross' && currentCoord.y >= 100 && prevCoord.y < 100) {
              meetsEntry = true;
            }
          }

          if (meetsEntry) {
            eligibleAssets.push({ symbol: sym, coord: currentCoord, quadrant: currentQuad });
          }
        });

        // Open positions
        for (const asset of eligibleAssets) {
          if (activePositions.length >= maxPositions) break;
          const targetAllocation = currentPortfolioValue * 0.18; // Allocate 18% per trade
          if (capital >= targetAllocation) {
            const entryPrice = assetMap[asset.symbol].prices[w];
            const entryQty = targetAllocation / entryPrice;
            capital -= targetAllocation;
            
            activePositions.push({
              symbol: asset.symbol,
              entryWeek: w,
              entryPrice: entryPrice,
              entryQty: entryQty,
              entryQuadrant: asset.quadrant
            });
          }
        }
      }
    }

    // 4. Summarize results
    const totalReturn = ((capital - startingCapital) / startingCapital) * 100;
    const finalBenchPrice = historicalRrgData.benchmark.prices[104];
    const benchReturn = ((finalBenchPrice - benchStartPrice) / benchStartPrice) * 100;
    
    const winningTrades = trades.filter(t => t.pnl > 0).length;
    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

    let peak = startingCapital;
    let maxDd = 0;
    equityHistory.forEach(h => {
      if (h.strategyEquity > peak) peak = h.strategyEquity;
      const dd = ((peak - h.strategyEquity) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    });

    // Sharpe Ratio
    const weeklyReturns = [];
    for (let i = 1; i < equityHistory.length; i++) {
      const prev = equityHistory[i-1].strategyEquity;
      const curr = equityHistory[i].strategyEquity;
      weeklyReturns.push((curr - prev) / prev);
    }
    const avgWeeklyReturn = weeklyReturns.length > 0 ? weeklyReturns.reduce((sum, r) => sum + r, 0) / weeklyReturns.length : 0;
    const stdDevWeeklyReturn = weeklyReturns.length > 0 ? Math.sqrt(weeklyReturns.reduce((sum, r) => sum + Math.pow(r - avgWeeklyReturn, 2), 0) / weeklyReturns.length) : 0;
    const sharpeRatio = stdDevWeeklyReturn > 0 ? (avgWeeklyReturn / stdDevWeeklyReturn) * Math.sqrt(52) : 0;

    return {
      equityHistory,
      trades: trades.reverse(), // latest trades first
      metrics: {
        totalReturn: Math.round(totalReturn * 100) / 100,
        benchReturn: Math.round(benchReturn * 100) / 100,
        winRate: Math.round(winRate * 100) / 100,
        maxDrawdown: Math.round(maxDd * 100) / 100,
        sharpeRatio: Math.round(sharpeRatio * 100) / 100,
        totalTrades: trades.length
      },
      params
    };
  };

  // Render SVG Path for Equity Curves
  const getEquityPath = (history, key) => {
    if (!history || history.length === 0) return '';
    const minVal = Math.min(...history.map(h => Math.min(h.strategyEquity, h.benchmarkEquity)));
    const maxVal = Math.max(...history.map(h => Math.max(h.strategyEquity, h.benchmarkEquity)));
    const valRange = maxVal - minVal || 1;
    
    return history.reduce((path, pt, idx) => {
      const x = (idx / (history.length - 1)) * 520 + 40;
      const y = 180 - ((pt[key] - minVal) / valRange) * 140;
      return path + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  };

  const getEquityAreaPath = (history, key) => {
    if (!history || history.length === 0) return '';
    const minVal = Math.min(...history.map(h => Math.min(h.strategyEquity, h.benchmarkEquity)));
    const maxVal = Math.max(...history.map(h => Math.max(h.strategyEquity, h.benchmarkEquity)));
    const valRange = maxVal - minVal || 1;
    
    let path = history.reduce((acc, pt, idx) => {
      const x = (idx / (history.length - 1)) * 520 + 40;
      const y = 180 - ((pt[key] - minVal) / valRange) * 140;
      return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');

    // Close the area
    const startX = 40;
    const endX = 560;
    const bottomY = 180;
    path += ` L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
    return path;
  };

  // Get index on equity curve based on hover X coordinates
  const handleEquityMouseMove = (e) => {
    if (!backtestResults || !backtestResults.equityHistory.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    
    // Scale mapping of X to index
    const chartWidth = rect.width;
    const paddingLeftRatio = 40 / 600;
    const paddingRightRatio = 40 / 600;
    const plotWidth = chartWidth * (1 - paddingLeftRatio - paddingRightRatio);
    const plotX = hoverX - chartWidth * paddingLeftRatio;
    
    if (plotX < 0 || plotX > plotWidth) return;
    
    const pct = plotX / plotWidth;
    const idx = Math.max(0, Math.min(backtestResults.equityHistory.length - 1, Math.round(pct * (backtestResults.equityHistory.length - 1))));
    setHoveredEquityPoint(backtestResults.equityHistory[idx]);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="badge-glow">ROTATIONAL QUANT TOOLS</span>
              <h1 style={{ fontSize: '2.5rem', marginTop: 8, fontWeight: 800 }}>Relative Rotation Graphs (RRG)</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
                Analyze structural relative strength dynamics and run historical rotation strategies.
              </p>
            </div>
            
            {/* Tab Controller */}
            <div style={styles.tabContainer}>
              <button 
                onClick={() => setActiveTab('tracker')}
                style={{
                  ...styles.tabBtn,
                  backgroundColor: activeTab === 'tracker' ? '#10b981' : 'transparent',
                  color: activeTab === 'tracker' ? '#07080d' : '#94a3b8'
                }}
              >
                <Compass size={16} /> Live Tracker
              </button>
              <button 
                onClick={() => setActiveTab('backtester')}
                style={{
                  ...styles.tabBtn,
                  backgroundColor: activeTab === 'backtester' ? '#10b981' : 'transparent',
                  color: activeTab === 'backtester' ? '#07080d' : '#94a3b8'
                }}
              >
                <TrendingUp size={16} /> Backtesting Suite
              </button>
            </div>
          </div>
        </div>

        {/* --- TRACKER VIEW --- */}
        {activeTab === 'tracker' && (
          <div style={styles.layoutGrid}>
            
            {/* Left Graph Column */}
            <div className="glass-card" style={styles.chartCard}>
              
              {/* Toolbar */}
              <div style={styles.toolbar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={15} color="#10b981" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>VISUAL SETTINGS</span>
                </div>
                
                <div style={styles.toolbarControls}>
                  {/* Zoom Selector */}
                  <div style={styles.toolbarGroup}>
                    <span style={styles.toolbarLabel}>Zoom:</span>
                    <button 
                      onClick={() => setZoomLevel('normal')}
                      style={{...styles.toggleBtn, ...(zoomLevel === 'normal' ? styles.toggleBtnActive : {})}}
                    >
                      Standard (96-104)
                    </button>
                    <button 
                      onClick={() => setZoomLevel('zoomed')}
                      style={{...styles.toggleBtn, ...(zoomLevel === 'zoomed' ? styles.toggleBtnActive : {})}}
                    >
                      Detailed (98-102)
                    </button>
                  </div>

                  {/* Timeframe Selector */}
                  <div style={styles.toolbarGroup}>
                    <span style={styles.toolbarLabel}>Timeframe:</span>
                    <button 
                      onClick={() => {
                        setTimeframe('daily');
                        setTailLength(3);
                      }}
                      style={{...styles.toggleBtn, ...(timeframe === 'daily' ? styles.toggleBtnActive : {})}}
                    >
                      Daily
                    </button>
                    <button 
                      onClick={() => {
                        setTimeframe('weekly');
                        setTailLength(4);
                      }}
                      style={{...styles.toggleBtn, ...(timeframe === 'weekly' ? styles.toggleBtnActive : {})}}
                    >
                      Weekly
                    </button>
                  </div>

                  {/* Tail Toggle */}
                  <div style={styles.toolbarGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <input 
                        type="checkbox" 
                        checked={showTails} 
                        onChange={(e) => setShowTails(e.target.checked)}
                        style={{ accentColor: '#10b981' }}
                      />
                      Show Trails
                    </label>
                  </div>
                </div>
              </div>

              {/* RRG Plot Wrapper */}
              <div style={styles.chartWrapper}>
                <svg width="100%" height="100%" viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ backgroundColor: '#0a0b10', borderRadius: '12px' }}>
                  <defs>
                    <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                    </marker>
                    <marker id="arrow-yellow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                    </marker>
                    <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#ef4444" />
                    </marker>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0ea5e9" />
                    </marker>
                  </defs>

                  {/* Quadrant Shading */}
                  <rect x={padding} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(14, 165, 233, 0.08)" /> {/* Improving: Top Left */}
                  <rect x={svgSize/2} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(16, 185, 129, 0.08)" /> {/* Leading: Top Right */}
                  <rect x={padding} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(239, 68, 68, 0.08)" /> {/* Lagging: Bottom Left */}
                  <rect x={svgSize/2} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(245, 158, 11, 0.08)" /> {/* Weakening: Bottom Right */}

                  {/* Central Crosshairs */}
                  <line x1={svgSize / 2} y1={padding} x2={svgSize / 2} y2={svgSize - padding} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={padding} y1={svgSize / 2} x2={svgSize - padding} y2={svgSize / 2} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Quadrant Labels */}
                  <text x={svgSize - padding - 65} y={padding + 22} fill="#10b981" fontSize="10" fontWeight="900" letterSpacing="0.08em">LEADING</text>
                  <text x={svgSize - padding - 85} y={svgSize - padding - 15} fill="#f59e0b" fontSize="10" fontWeight="900" letterSpacing="0.08em">WEAKENING</text>
                  <text x={padding + 16} y={svgSize - padding - 15} fill="#ef4444" fontSize="10" fontWeight="900" letterSpacing="0.08em">LAGGING</text>
                  <text x={padding + 16} y={padding + 22} fill="#0ea5e9" fontSize="10" fontWeight="900" letterSpacing="0.08em">IMPROVING</text>

                  {/* Benchmark Hub Dot at 100, 100 */}
                  <circle cx={getSvgCoords(100, 100).x} cy={getSvgCoords(100, 100).y} r="4" fill="#ffffff" />
                  <text x={getSvgCoords(100, 100).x + 8} y={getSvgCoords(100, 100).y + 3} fill="#ffffff" fontSize="8" fontWeight="700">
                    {drillDownSector ? drillDownSector.symbol : "NIFTY 50"}
                  </text>

                  {/* Plot Nodes and Trails */}
                  {drillDownSector ? (
                    // DRILLED DOWN VIEW: CONSTITUENTS
                    drillDownSector.constituents
                      .filter(stock => selectedConstituents.includes(stock.symbol))
                      .map(stock => {
                        const pt = getStockCoordinates(stock.symbol, timelineStep);
                        const quad = getQuadrant(pt.x, pt.y);
                        if (!quadrantFilters[quad]) return null;

                        const svgPt = getSvgCoords(pt.x, pt.y);
                        const isFocused = focusedStock?.symbol === stock.symbol;
                        const color = getQuadrantColor(quad);
                        const arrowId = quad === 'Leading' ? 'arrow-green' : quad === 'Weakening' ? 'arrow-yellow' : quad === 'Lagging' ? 'arrow-red' : 'arrow-blue';

                        // Build trail path
                        const points = [];
                        if (showTails) {
                          const start = Math.max(0, timelineStep - tailLength);
                          for (let step = start; step <= timelineStep; step++) {
                            const coord = getStockCoordinates(stock.symbol, step);
                            points.push(getSvgCoords(coord.x, coord.y));
                          }
                        }

                        const pathD = points.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                        return (
                          <g key={stock.symbol} style={{ cursor: 'pointer' }} onClick={() => setFocusedStock(stock)}>
                            {/* Trail line */}
                            {showTails && points.length > 1 && (
                              <path d={pathD} fill="none" stroke={color} strokeWidth={isFocused ? 2.2 : 1.2} opacity={isFocused ? 0.9 : 0.55} markerEnd={`url(#${arrowId})`} />
                            )}
                            {/* Marker Node */}
                            <circle cx={svgPt.x} cy={svgPt.y} r={isFocused ? 7 : 5} fill={color} />
                            {isFocused && <circle cx={svgPt.x} cy={svgPt.y} r="14" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />}
                            <text x={svgPt.x + 10} y={svgPt.y + 3} fill={isFocused ? "#ffffff" : "#94a3b8"} fontSize={isFocused ? 9 : 8} fontWeight={isFocused ? 800 : 500}>
                              {stock.symbol}
                            </text>
                          </g>
                        );
                      })
                  ) : (
                    // SECTOR LIST VIEW
                    historicalRrgData.sectors
                      .filter(sec => selectedSectors.includes(sec.symbol))
                      .map(sec => {
                        const pt = getCoordinates(sec.symbol, timelineStep);
                        const quad = getQuadrant(pt.x, pt.y);
                        if (!quadrantFilters[quad]) return null;

                        const svgPt = getSvgCoords(pt.x, pt.y);
                        const isFocused = focusedSector?.symbol === sec.symbol;
                        const color = getQuadrantColor(quad);
                        const arrowId = quad === 'Leading' ? 'arrow-green' : quad === 'Weakening' ? 'arrow-yellow' : quad === 'Lagging' ? 'arrow-red' : 'arrow-blue';

                        // Build trail path
                        const points = [];
                        if (showTails) {
                          const start = Math.max(0, timelineStep - tailLength);
                          for (let step = start; step <= timelineStep; step++) {
                            const coord = getCoordinates(sec.symbol, step);
                            points.push(getSvgCoords(coord.x, coord.y));
                          }
                        }

                        const pathD = points.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                        return (
                          <g key={sec.symbol} style={{ cursor: 'pointer' }} onClick={() => setFocusedSector(sec)}>
                            {/* Trail line */}
                            {showTails && points.length > 1 && (
                              <path d={pathD} fill="none" stroke={color} strokeWidth={isFocused ? 2.5 : 1.5} opacity={isFocused ? 0.95 : 0.6} markerEnd={`url(#${arrowId})`} />
                            )}
                            {/* Marker Node */}
                            <circle cx={svgPt.x} cy={svgPt.y} r={isFocused ? 8 : 6} fill={color} />
                            {isFocused && <circle cx={svgPt.x} cy={svgPt.y} r="16" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />}
                            <text x={svgPt.x + 12} y={svgPt.y + 4} fill={isFocused ? "#ffffff" : "#94a3b8"} fontSize={isFocused ? 10 : 9} fontWeight={isFocused ? 800 : 600}>
                              {sec.symbol}
                            </text>
                          </g>
                        );
                      })
                  )}
                </svg>
              </div>

              {/* Timeline Slider and Playback Controls */}
              <div style={styles.controls}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="rrg-control-btn"
                    title={isPlaying ? "Pause Rotation" : "Play Rotation Animation"}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button 
                    onClick={() => { setIsPlaying(false); setTimelineStep(104); }}
                    className="rrg-control-btn"
                    title="Reset to Current Date"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', gap: 12 }}>
                  <span style={styles.timelineLabel}>{historicalRrgData.dateLabels[0]}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                    <input 
                      type="range"
                      min="0"
                      max="104"
                      value={timelineStep}
                      onChange={(e) => { setIsPlaying(false); setTimelineStep(Number(e.target.value)); }}
                      style={styles.slider}
                    />
                    <div style={{ position: 'absolute', top: -14, left: `${(timelineStep/104)*100}%`, transform: 'translateX(-50%)', backgroundColor: '#10b981', color: '#07080d', fontSize: '0.65rem', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>
                      {historicalRrgData.dateLabels[timelineStep]}
                    </div>
                  </div>
                  <span style={{...styles.timelineLabel, color: '#10b981'}}>Latest</span>
                </div>

                {/* Trail and Speed Selectors */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>
                      TRAIL LENGTH ({tailLength} {timeframe === 'daily' ? 'DAYS' : 'WEEKS'})
                    </span>
                    <input 
                      type="range" 
                      min="1" 
                      max={timeframe === 'daily' ? 10 : 12} 
                      value={tailLength} 
                      onChange={(e) => setTailLength(Number(e.target.value))}
                      style={{ width: 80, accentColor: '#10b981', height: 4 }}
                    />
                    {timeframe === 'daily' && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        <button 
                          onClick={() => setTailLength(3)}
                          style={{
                            backgroundColor: tailLength === 3 ? '#10b981' : 'rgba(255,255,255,0.05)',
                            color: tailLength === 3 ? '#07080d' : '#ffffff',
                            border: 'none',
                            borderRadius: 3,
                            fontSize: '0.55rem',
                            padding: '2px 4px',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          3d
                        </button>
                        <button 
                          onClick={() => setTailLength(5)}
                          style={{
                            backgroundColor: tailLength === 5 ? '#10b981' : 'rgba(255,255,255,0.05)',
                            color: tailLength === 5 ? '#07080d' : '#ffffff',
                            border: 'none',
                            borderRadius: 3,
                            fontSize: '0.55rem',
                            padding: '2px 4px',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          5d
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>PLAYBACK SPEED</span>
                    <select 
                      value={playbackSpeed} 
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      style={styles.speedSelect}
                    >
                      <option value={1500}>Slow</option>
                      <option value={1000}>Normal</option>
                      <option value={500}>Fast</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Information & List Column */}
            <div style={styles.selectorsCol}>
              
              {/* Market Sentiment Widget */}
              <div className="glass-card" style={{ ...styles.card, border: '1px solid rgba(148, 112, 248, 0.15)', backgroundColor: 'rgba(148, 112, 248, 0.01)', display: activeTab === 'tracker' ? 'block' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={14} color="#9470F8" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>MARKET SENTIMENT FEED</span>
                  </div>
                  {sentimentData && (
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                      Live • {sentimentData.date || "Today"}
                    </span>
                  )}
                </div>

                {sentimentLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <RefreshCw className="animate-spin" size={14} color="#9470F8" />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Scraping live index feeds...</span>
                  </div>
                ) : sentimentData ? (
                  <div>
                    {/* Sentiment Meter Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Sentiment Index</span>
                        <span style={{ 
                          fontSize: '1.05rem', 
                          fontWeight: 800, 
                          color: sentimentData.sentimentScore >= 55 ? '#10b981' : sentimentData.sentimentScore <= 45 ? '#ef4444' : '#f59e0b'
                        }}>
                          {sentimentData.sentimentScore}% {sentimentData.sentimentScore >= 70 ? "Extreme Greed" : sentimentData.sentimentScore >= 55 ? "Greed" : sentimentData.sentimentScore >= 45 ? "Neutral" : sentimentData.sentimentScore >= 30 ? "Fear" : "Extreme Fear"}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Nifty 50 PCR</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                          {sentimentData.pcr || '1.18'}
                        </span>
                      </div>
                    </div>

                    {/* Institutional flows cash */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {sentimentData.flows?.slice(0, 2).map((flow, idx) => {
                        const isBuy = flow.netValue >= 0;
                        return (
                          <div key={idx} style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6 }}>
                            <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 600 }}>{flow.segment.replace(' Cash Market', '')} Net Flow</span>
                            <span style={{ 
                              fontSize: '0.85rem', 
                              fontWeight: 800, 
                              color: isBuy ? '#10b981' : '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              marginTop: 2
                            }}>
                              {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              ₹{Math.abs(flow.netValue).toLocaleString()} Cr
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                    <ShieldAlert size={14} color="#ef4444" />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sentiment feed offline. Using offline rotation metrics.</span>
                  </div>
                )}
              </div>

              {/* Asset Selectors Card */}
              <div className="glass-card" style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      {drillDownSector ? `${drillDownSector.name} Stocks` : "Sector Selection"}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>
                      {drillDownSector 
                        ? `Select stocks to compare against benchmark ${drillDownSector.symbol}` 
                        : "Toggle up to 10 Nifty sectors to trace on the graph."}
                    </p>
                  </div>
                  
                  {drillDownSector && (
                    <button 
                      onClick={() => setDrillDownSector(null)}
                      style={styles.backBtn}
                    >
                      ← Back to Sectors
                    </button>
                  )}
                </div>

                {/* Quadrant Quick Filters */}
                <div style={styles.filterBar}>
                  {Object.keys(quadrantFilters).map(quad => (
                    <button
                      key={quad}
                      onClick={() => setQuadrantFilters(prev => ({ ...prev, [quad]: !prev[quad] }))}
                      style={{
                        ...styles.filterBadge,
                        backgroundColor: quadrantFilters[quad] ? `${getQuadrantColor(quad)}15` : 'transparent',
                        borderColor: quadrantFilters[quad] ? getQuadrantColor(quad) : 'rgba(255,255,255,0.06)',
                        color: quadrantFilters[quad] ? getQuadrantColor(quad) : '#64748b'
                      }}
                    >
                      {quad}
                    </button>
                  ))}
                </div>

                {/* Selection List */}
                <div style={styles.selectorsList}>
                  {drillDownSector ? (
                    // Stock constituent listing
                    drillDownSector.constituents.map(stock => {
                      const isChecked = selectedConstituents.includes(stock.symbol);
                      const coord = getStockCoordinates(stock.symbol, timelineStep);
                      const quad = getQuadrant(coord.x, coord.y);
                      const color = getQuadrantColor(quad);
                      const isFocused = focusedStock?.symbol === stock.symbol;

                      return (
                        <div 
                          key={stock.symbol}
                          onClick={() => {
                            toggleConstituentSelection(stock.symbol);
                            setFocusedStock(stock);
                          }}
                          style={{
                            ...styles.selectorItem,
                            borderColor: isFocused ? '#10b981' : isChecked ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                            backgroundColor: isFocused ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.01)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div 
                              style={{
                                ...styles.checkbox,
                                backgroundColor: isChecked ? '#10b981' : 'transparent',
                                borderColor: isChecked ? '#10b981' : '#64748b'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleConstituentSelection(stock.symbol);
                              }}
                            >
                              {isChecked && <Check size={10} color="#07080d" strokeWidth={4} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{stock.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{stock.symbol} ({stock.weight})</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                              <div style={{ fontWeight: 600 }}>₹{stock.prices[timelineStep].toLocaleString()}</div>
                              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                X: {coord.x.toFixed(1)} | Y: {coord.y.toFixed(1)}
                              </div>
                            </div>
                            <span style={{...styles.quadrantBadge, color, backgroundColor: `${color}15` }}>
                              {quad}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Sector Index listing
                    historicalRrgData.sectors.map(sec => {
                      const isChecked = selectedSectors.includes(sec.symbol);
                      const coord = getCoordinates(sec.symbol, timelineStep);
                      const quad = getQuadrant(coord.x, coord.y);
                      const color = getQuadrantColor(quad);
                      const isFocused = focusedSector?.symbol === sec.symbol;

                      return (
                        <div 
                          key={sec.symbol}
                          onClick={() => {
                            toggleSectorSelection(sec.symbol);
                            setFocusedSector(sec);
                          }}
                          style={{
                            ...styles.selectorItem,
                            borderColor: isFocused ? '#10b981' : isChecked ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                            backgroundColor: isFocused ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.01)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div 
                              style={{
                                ...styles.checkbox,
                                backgroundColor: isChecked ? '#10b981' : 'transparent',
                                borderColor: isChecked ? '#10b981' : '#64748b'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectorSelection(sec.symbol);
                              }}
                            >
                              {isChecked && <Check size={10} color="#07080d" strokeWidth={4} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sec.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sec.symbol}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                              <div style={{ fontWeight: 600 }}>₹{Math.round(sec.prices[timelineStep]).toLocaleString()}</div>
                              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                X: {coord.x.toFixed(1)} | Y: {coord.y.toFixed(1)}
                              </div>
                            </div>
                            <span style={{...styles.quadrantBadge, color, backgroundColor: `${color}15` }}>
                              {quad}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Details & Outlook Card */}
              {drillDownSector ? (
                focusedStock && (
                  <div className="glass-card animate-fade-in" style={styles.detailsCard}>
                    <div style={styles.detailsHeader}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 800 }}>{focusedStock.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>Stock Ticker: {focusedStock.symbol}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{focusedStock.prices[timelineStep].toLocaleString()}</div>
                        <div style={{ color: focusedStock.prices[timelineStep] >= focusedStock.prices[Math.max(0, timelineStep-1)] ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginTop: 2 }}>
                          {focusedStock.prices[timelineStep] >= focusedStock.prices[Math.max(0, timelineStep-1)] ? '▲ Upward' : '▼ Downward'}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <Compass size={14} color="#10b981" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rotational Outlook</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {focusedStock.symbol} is rotating in the {getQuadrant(getStockCoordinates(focusedStock.symbol, timelineStep).x, getStockCoordinates(focusedStock.symbol, timelineStep).y)} quadrant. Momentum (X-axis) is at {getStockCoordinates(focusedStock.symbol, timelineStep).x.toFixed(2)} and Relative Strength (Y-axis) is at {getStockCoordinates(focusedStock.symbol, timelineStep).y.toFixed(2)} compared to its benchmark {drillDownSector.symbol}.
                      </p>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>Weight In {drillDownSector.symbol}</div>
                      <div style={styles.weightsBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Portfolio Weight</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>{focusedStock.weight}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                focusedSector && (
                  <div className="glass-card animate-fade-in" style={styles.detailsCard}>
                    <div style={styles.detailsHeader}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 800 }}>{focusedSector.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>Sector Index: {focusedSector.symbol}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{Math.round(focusedSector.prices[timelineStep]).toLocaleString()}</div>
                        <button 
                          onClick={() => setDrillDownSector(focusedSector)}
                          style={styles.drillBtn}
                        >
                          Drill Down Stocks <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <Compass size={14} color="#10b981" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Outlook</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{focusedSector.outlook}</p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Top Sector Constituents</div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Index Weight</span>
                      </div>
                      <div style={styles.weightsList}>
                        {focusedSector.constituents.map((item, idx) => (
                          <div 
                            key={idx} 
                            style={{
                              ...styles.weightItem,
                              borderBottom: idx === focusedSector.constituents.length - 1 ? 'none' : styles.weightItem.borderBottom,
                              paddingBottom: idx === focusedSector.constituents.length - 1 ? 0 : styles.weightItem.paddingBottom
                            }}
                          >
                            <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{item.name}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>{item.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}

              <div style={styles.infoCard}>
                <Info size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                  Relative Rotation Graphs (RRG) map securities by Relative Strength (Y-axis) and Momentum (X-axis) against a benchmark. Tap any sector on the graph to inspect constituents, or drill down to compare individual stocks against their sector benchmark.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* --- BACKTESTER VIEW --- */}
        {activeTab === 'backtester' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Strategy Builder Controls and Dashboard Grid */}
            <div style={styles.backtestMainGrid}>
              
              {/* Left Column: Configuration Form */}
              <div className="glass-card" style={{ padding: '24px', backgroundColor: '#0d0f17', border: '1px solid rgba(255,255,255,0.04)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>Strategy Parameters</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 20 }}>Configure your RRG trading model below</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Entry Signal */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Entry Quadrant Trigger</label>
                    <select 
                      value={entryTrigger} 
                      onChange={(e) => setEntryTrigger(e.target.value)}
                      style={styles.formInput}
                    >
                      <option value="improving_leading">Improving → Leading (Standard Crossover)</option>
                      <option value="lagging_improving">Lagging → Improving (Early Momentum)</option>
                      <option value="enters_improving">Enters Improving Quadrant</option>
                      <option value="enters_leading">Enters Leading Quadrant</option>
                      <option value="strength_cross">RS-Ratio Crosses Above 100</option>
                    </select>
                  </div>

                  {/* Exit Signal */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Exit Quadrant Trigger</label>
                    <select 
                      value={exitTrigger} 
                      onChange={(e) => setExitTrigger(e.target.value)}
                      style={styles.formInput}
                    >
                      <option value="enters_lagging">Enters Lagging Quadrant (Cut Losses)</option>
                      <option value="leading_weakening">Leading → Weakening (Protect Gains)</option>
                      <option value="weakening_lagging">Weakening → Lagging</option>
                      <option value="strength_drop">RS-Ratio Drops Below 100</option>
                    </select>
                  </div>

                  {/* Risk Management (SL / TP) */}
                  <div style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer', marginBottom: 12 }}>
                      <input 
                        type="checkbox" 
                        checked={useSlTp} 
                        onChange={(e) => setUseSlTp(e.target.checked)}
                        style={{ accentColor: '#10b981' }}
                      />
                      Enable Stop Loss & Take Profit
                    </label>
                    
                    {useSlTp && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Stop Loss (%)</label>
                          <input 
                            type="number" 
                            value={stopLossPct}
                            onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 0)}
                            style={styles.formInputNumber} 
                            step="0.5"
                            min="0.5"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Take Profit (%)</label>
                          <input 
                            type="number" 
                            value={takeProfitPct}
                            onChange={(e) => setTakeProfitPct(parseFloat(e.target.value) || 0)}
                            style={styles.formInputNumber} 
                            step="0.5"
                            min="1.0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Backtest Universe Scope */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Asset Selection Universe</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                      <label style={styles.radioLabel}>
                        <input 
                          type="radio" 
                          name="universe" 
                          value="sectors" 
                          checked={universeType === 'sectors'} 
                          onChange={() => setUniverseType('sectors')}
                          style={{ accentColor: '#10b981' }}
                        />
                        All 12 Sector Indices (Sector Rotation)
                      </label>
                      <label style={styles.radioLabel}>
                        <input 
                          type="radio" 
                          name="universe" 
                          value="all_stocks" 
                          checked={universeType === 'all_stocks'} 
                          onChange={() => setUniverseType('all_stocks')}
                          style={{ accentColor: '#10b981' }}
                        />
                        All Large Cap Constituents (60+ Stocks)
                      </label>
                      <label style={styles.radioLabel}>
                        <input 
                          type="radio" 
                          name="universe" 
                          value="custom_sectors" 
                          checked={universeType === 'custom_sectors'} 
                          onChange={() => setUniverseType('custom_sectors')}
                          style={{ accentColor: '#10b981' }}
                        />
                        Custom Sector Group
                      </label>
                    </div>

                    {universeType === 'custom_sectors' && (
                      <div style={styles.checkboxGroup}>
                        {historicalRrgData.sectors.map(s => {
                          const isChecked = customSectorsToBacktest.includes(s.symbol);
                          return (
                            <label key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer' }}>
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setCustomSectorsToBacktest(prev => prev.filter(item => item !== s.symbol));
                                  } else {
                                    setCustomSectorsToBacktest(prev => [...prev, s.symbol]);
                                  }
                                }}
                                style={{ accentColor: '#10b981' }}
                              />
                              {s.symbol}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Period & Capital */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Historical Period</label>
                      <select 
                        value={backtestPeriod} 
                        onChange={(e) => setBacktestPeriod(e.target.value)}
                        style={styles.formInput}
                      >
                        <option value="3m">Last 3 Months (13 Wks)</option>
                        <option value="6m">Last 6 Months (26 Wks)</option>
                        <option value="1y">Last 1 Year (52 Wks)</option>
                        <option value="2y">Last 2 Years (104 Wks)</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Starting Capital</label>
                      <input 
                        type="number" 
                        value={startingCapital}
                        onChange={(e) => setStartingCapital(Number(e.target.value) || 100000)}
                        style={styles.formInput} 
                        step="100000"
                      />
                    </div>
                  </div>

                  {/* Run Button */}
                  <button 
                    onClick={runBacktest}
                    disabled={isBacktesting}
                    style={{
                      ...styles.runBtn,
                      opacity: isBacktesting ? 0.7 : 1,
                      cursor: isBacktesting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isBacktesting ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} /> Computing Rotations...
                      </>
                    ) : (
                      <>
                        <Play size={16} fill="currentColor" /> Run Rotational Backtest
                      </>
                    )}
                  </button>
                  
                </div>
              </div>

              {/* Right Column: Performance Results Dashboard */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {backtestResults ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
                    
                    {/* Performance Cards */}
                    <div style={styles.metricsGrid}>
                      
                      <div className="glass-card" style={styles.metricCard}>
                        <span style={styles.metricTitle}>Strategy Return</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: backtestResults.metrics.totalReturn >= 0 ? '#10b981' : '#ef4444' }}>
                            {backtestResults.metrics.totalReturn >= 0 ? '+' : ''}{backtestResults.metrics.totalReturn}%
                          </span>
                        </div>
                        <span style={styles.metricSubtitle}>Benchmark: {backtestResults.metrics.benchReturn >= 0 ? '+' : ''}{backtestResults.metrics.benchReturn}%</span>
                      </div>

                      <div className="glass-card" style={styles.metricCard}>
                        <span style={styles.metricTitle}>Alpha Generated</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: (backtestResults.metrics.totalReturn - backtestResults.metrics.benchReturn) >= 0 ? '#10b981' : '#ef4444' }}>
                            {Math.round((backtestResults.metrics.totalReturn - backtestResults.metrics.benchReturn) * 100) / 100}%
                          </span>
                        </div>
                        <span style={styles.metricSubtitle}>Outperformance Vs Index</span>
                      </div>

                      <div className="glass-card" style={styles.metricCard}>
                        <span style={styles.metricTitle}>Win Rate & Trades</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
                            {backtestResults.metrics.winRate}%
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({backtestResults.metrics.totalTrades} Trades)</span>
                        </div>
                        <span style={styles.metricSubtitle}>Profitable closures</span>
                      </div>

                      <div className="glass-card" style={styles.metricCard}>
                        <span style={styles.metricTitle}>Risk Metrics</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f59e0b' }}>
                            -{backtestResults.metrics.maxDrawdown}%
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sharpe: {backtestResults.metrics.sharpeRatio}</span>
                        </div>
                        <span style={styles.metricSubtitle}>Max Drawdown peak-to-trough</span>
                      </div>

                    </div>

                    {/* Equity Curve SVG Chart */}
                    <div className="glass-card" style={{ padding: '20px', backgroundColor: '#0d0f17', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <BarChart2 size={16} color="#10b981" />
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>EQUITY GROWTH COMPARISON</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Strategy Portfolio
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#475569', display: 'inline-block' }} /> Benchmark Index
                          </span>
                        </div>
                      </div>

                      {/* Interactive Equity Graph */}
                      <div style={{ width: '100%', height: '190px' }} onMouseMove={handleEquityMouseMove} onMouseLeave={() => setHoveredEquityPoint(null)}>
                        <svg viewBox="0 0 600 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                          
                          {/* Grid Lines */}
                          <line x1="40" y1="40" x2="560" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="110" x2="560" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="180" x2="560" y2="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                          
                          {/* Y-axis Labels */}
                          <text x="30" y="44" fill="#64748b" fontSize="8" textAnchor="end">Max</text>
                          <text x="30" y="114" fill="#64748b" fontSize="8" textAnchor="end">Mid</text>
                          <text x="30" y="184" fill="#64748b" fontSize="8" textAnchor="end">Base</text>

                          {/* Benchmark Area / Line */}
                          <path 
                            d={getEquityPath(backtestResults.equityHistory, 'benchmarkEquity')} 
                            fill="none" 
                            stroke="#475569" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 2" 
                          />

                          {/* Strategy Equity Area Gradient */}
                          <defs>
                            <linearGradient id="stratArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path 
                            d={getEquityAreaPath(backtestResults.equityHistory, 'strategyEquity')} 
                            fill="url(#stratArea)" 
                          />

                          {/* Strategy Line */}
                          <path 
                            d={getEquityPath(backtestResults.equityHistory, 'strategyEquity')} 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="2.5" 
                          />

                          {/* Hover Vertical Guide Line */}
                          {hoveredEquityPoint && (
                            <line 
                              x1={40 + (backtestResults.equityHistory.indexOf(hoveredEquityPoint) / (backtestResults.equityHistory.length - 1)) * 520} 
                              y1="20" 
                              x2={40 + (backtestResults.equityHistory.indexOf(hoveredEquityPoint) / (backtestResults.equityHistory.length - 1)) * 520} 
                              y2="180" 
                              stroke="rgba(16,185,129,0.3)" 
                              strokeWidth="1" 
                            />
                          )}
                        </svg>
                      </div>

                      {/* Hover Tooltip Overlay */}
                      {hoveredEquityPoint && (
                        <div style={styles.chartTooltip}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                            {hoveredEquityPoint.date} (Wk {hoveredEquityPoint.week})
                          </div>
                          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                            <div>
                              <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'block' }}>Strategy</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>₹{hoveredEquityPoint.strategyEquity.toLocaleString()}</span>
                            </div>
                            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 12 }}>
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block' }}>Benchmark</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8' }}>₹{hoveredEquityPoint.benchmarkEquity.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="glass-card" style={styles.emptyState}>
                    <BarChart2 size={40} color="rgba(255,255,255,0.06)" style={{ marginBottom: 12 }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>No Backtest Results Yet</h4>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', maxWidth: 280, textAlign: 'center', marginTop: 4 }}>
                      Select entry/exit triggers and click "Run Rotational Backtest" to generate performance diagnostics.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Backtest Trades Log */}
            {backtestResults && (
              <div className="glass-card animate-fade-in" style={{ padding: '24px', backgroundColor: '#0d0f17', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Rotational Trade Logs</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>Click any trade row to visualize the quadrant rotation trail during the holding period</p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Asset</th>
                        <th style={styles.th}>Entry Date</th>
                        <th style={styles.th}>Entry Quadrant</th>
                        <th style={styles.th}>Entry Price</th>
                        <th style={styles.th}>Exit Date</th>
                        <th style={styles.th}>Exit Quadrant</th>
                        <th style={styles.th}>Exit Price</th>
                        <th style={styles.th}>PnL (%)</th>
                        <th style={styles.th}>Exit Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.trades.map(trade => {
                        const isWin = trade.pnl > 0;
                        const entryColor = getQuadrantColor(trade.entryQuadrant);
                        const exitColor = getQuadrantColor(trade.exitQuadrant);
                        
                        return (
                          <tr 
                            key={trade.id} 
                            className="rrg-table-row"
                            onClick={() => setVisualizedTrade(trade)}
                            title="Click to view rotation trajectory"
                          >
                            <td style={{...styles.td, fontWeight: 700, color: '#ffffff'}}>{trade.symbol}</td>
                            <td style={styles.td}>{trade.entryDate}</td>
                            <td style={styles.td}>
                              <span style={{...styles.quadrantBadge, color: entryColor, backgroundColor: `${entryColor}15` }}>
                                {trade.entryQuadrant}
                              </span>
                            </td>
                            <td style={styles.td}>₹{trade.entryPrice}</td>
                            <td style={styles.td}>{trade.exitDate}</td>
                            <td style={styles.td}>
                              <span style={{...styles.quadrantBadge, color: exitColor, backgroundColor: `${exitColor}15` }}>
                                {trade.exitQuadrant}
                              </span>
                            </td>
                            <td style={styles.td}>₹{trade.exitPrice}</td>
                            <td style={{...styles.td, fontWeight: 700, color: isWin ? '#10b981' : '#ef4444'}}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {isWin ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {isWin ? '+' : ''}{trade.pnl}%
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: 4,
                                backgroundColor: trade.reason === 'Stop Loss' ? 'rgba(239,68,68,0.08)' : trade.reason === 'Take Profit' ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                                color: trade.reason === 'Stop Loss' ? '#ef4444' : trade.reason === 'Take Profit' ? '#10b981' : '#94a3b8'
                              }}>
                                {trade.reason}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Trade Trail Visualizer Modal */}
            {visualizedTrade && (
              <div style={styles.modalOverlay} onClick={() => setVisualizedTrade(null)}>
                <div className="glass-card animate-fade-in" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, marginBottom: 16 }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 800 }}>Trade Rotation Analyzer</h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        Asset: {visualizedTrade.symbol} | Duration: Wk {visualizedTrade.entryWeek} to Wk {visualizedTrade.exitWeek} ({visualizedTrade.exitWeek - visualizedTrade.entryWeek} weeks)
                      </p>
                    </div>
                    <button style={styles.closeBtn} onClick={() => setVisualizedTrade(null)}>
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'center' }}>
                    {/* Visual Trail Grid */}
                    <div style={{ width: '100%', maxWidth: '300px', aspectRatio: '1', margin: '0 auto', backgroundColor: '#0a0b10', borderRadius: '8px', padding: '12px' }}>
                      <svg width="100%" height="100%" viewBox={`0 0 ${svgSize} ${svgSize}`}>
                        {/* Quadrant Shading */}
                        <rect x={padding} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(14, 165, 233, 0.05)" />
                        <rect x={svgSize/2} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(16, 185, 129, 0.05)" />
                        <rect x={padding} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(239, 68, 68, 0.05)" />
                        <rect x={svgSize/2} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(245, 158, 11, 0.05)" />

                        <line x1={svgSize / 2} y1={padding} x2={svgSize / 2} y2={svgSize - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        <line x1={padding} y1={svgSize / 2} x2={svgSize - padding} y2={svgSize / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                        {/* Extract asset data */}
                        {(() => {
                          const assetSymbol = visualizedTrade.symbol;
                          // Find sector or stock coordinates
                          let assetPrices = [];
                          let assetRrg = [];
                          
                          const sec = historicalRrgData.sectors.find(s => s.symbol === assetSymbol);
                          if (sec) {
                            assetPrices = sec.prices;
                            assetRrg = sec.rrg;
                          } else {
                            historicalRrgData.sectors.forEach(s => {
                              const c = s.constituents.find(st => st.symbol === assetSymbol);
                              if (c) {
                                assetPrices = c.prices;
                                assetRrg = c.rrg;
                              }
                            });
                          }

                          if (!assetRrg || assetRrg.length === 0) return null;

                          // Plot exact trail during holding period
                          const trailPoints = [];
                          for (let step = visualizedTrade.entryWeek; step <= visualizedTrade.exitWeek; step++) {
                            if (assetRrg[step]) {
                              trailPoints.push(getSvgCoords(assetRrg[step].x, assetRrg[step].y));
                            }
                          }

                          const pathD = trailPoints.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                          const startPt = trailPoints[0];
                          const endPt = trailPoints[trailPoints.length - 1];

                          return (
                            <g>
                              {/* Path */}
                              {trailPoints.length > 1 && (
                                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
                              )}
                              {/* Start marker */}
                              {startPt && (
                                <g>
                                  <circle cx={startPt.x} cy={startPt.y} r="5" fill="#0ea5e9" />
                                  <text x={startPt.x + 8} y={startPt.y - 6} fill="#0ea5e9" fontSize="9" fontWeight="800">ENTRY</text>
                                </g>
                              )}
                              {/* End marker */}
                              {endPt && (
                                <g>
                                  <circle cx={endPt.x} cy={endPt.y} r="5" fill="#ef4444" />
                                  <text x={endPt.x + 8} y={endPt.y + 12} fill="#ef4444" fontSize="9" fontWeight="800">EXIT</text>
                                </g>
                              )}
                            </g>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Stats List */}
                    <div>
                      <h5 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginBottom: 12 }}>Trade Parameters & Returns</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={styles.tradeModalStat}>
                          <span style={styles.tradeModalLabel}>Entry Coordinates</span>
                          <span style={styles.tradeModalVal}>
                            ({visualizedTrade.entryQuadrant})
                          </span>
                        </div>
                        <div style={styles.tradeModalStat}>
                          <span style={styles.tradeModalLabel}>Exit Coordinates</span>
                          <span style={styles.tradeModalVal}>
                            ({visualizedTrade.exitQuadrant})
                          </span>
                        </div>
                        <div style={styles.tradeModalStat}>
                          <span style={styles.tradeModalLabel}>Entry Price</span>
                          <span style={styles.tradeModalVal}>₹{visualizedTrade.entryPrice}</span>
                        </div>
                        <div style={styles.tradeModalStat}>
                          <span style={styles.tradeModalLabel}>Exit Price</span>
                          <span style={styles.tradeModalVal}>₹{visualizedTrade.exitPrice}</span>
                        </div>
                        <div style={styles.tradeModalStat}>
                          <span style={styles.tradeModalLabel}>Holding Period</span>
                          <span style={styles.tradeModalVal}>{visualizedTrade.exitWeek - visualizedTrade.entryWeek} Weeks</span>
                        </div>
                        <div style={{...styles.tradeModalStat, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, marginTop: 4 }}>
                          <span style={{...styles.tradeModalLabel, fontWeight: 700, color: '#ffffff'}}>Total Trade return</span>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: visualizedTrade.pnl >= 0 ? '#10b981' : '#ef4444'
                          }}>
                            {visualizedTrade.pnl >= 0 ? '+' : ''}{visualizedTrade.pnl}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 0 64px 0',
    backgroundColor: '#07080d',
    minHeight: '100vh',
    color: '#ffffff'
  },
  header: {
    marginBottom: '32px'
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '32px',
    alignItems: 'start'
  },
  chartCard: {
    padding: '24px',
    backgroundColor: '#0d0f17',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '12px'
  },
  toolbarControls: {
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  },
  toolbarGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  toolbarLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    color: '#94a3b8',
    padding: '4px 10px',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: '#10b981',
    color: '#10b981'
  },
  chartWrapper: {
    width: '100%',
    aspectRatio: '1',
    maxWidth: '430px',
    margin: '0 auto',
    position: 'relative'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.03)',
    flexWrap: 'wrap'
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    color: '#ffffff',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  slider: {
    flexGrow: 1,
    accentColor: '#10b981',
    cursor: 'pointer',
    height: '6px',
    borderRadius: '3px'
  },
  timelineLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 700
  },
  speedSelect: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '3px 6px',
    cursor: 'pointer',
    outline: 'none'
  },
  selectorsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    padding: '20px',
    backgroundColor: '#0d0f17'
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    color: '#10b981',
    padding: '5px 10px',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  filterBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    paddingBottom: '12px'
  },
  filterBadge: {
    border: '1px solid',
    borderRadius: '20px',
    padding: '4px 10px',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    transition: 'all 0.15s ease'
  },
  selectorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '290px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  selectorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  checkbox: {
    width: '14px',
    height: '14px',
    border: '1px solid',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  quadrantBadge: {
    fontSize: '0.65rem',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  detailsCard: {
    padding: '20px',
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(16, 185, 129, 0.15)'
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: 10,
    marginBottom: 12
  },
  drillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.1)',
    border: '1px solid #10b981',
    borderRadius: '6px',
    color: '#10b981',
    padding: '4px 8px',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 6,
    transition: 'all 0.15s ease'
  },
  weightsBox: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.03)',
    padding: '6px 12px'
  },
  weightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.03)',
    padding: '10px 12px',
    maxHeight: '140px',
    overflowY: 'auto'
  },
  weightItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '5px',
    borderBottom: '1px solid rgba(255,255,255,0.02)'
  },
  infoCard: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '12px 14px'
  },

  // Backtester styles
  backtestMainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: '24px',
    alignItems: 'start'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  formLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#ffffff'
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    color: '#ffffff',
    padding: '8px 12px',
    fontSize: '0.8rem',
    outline: 'none',
    cursor: 'pointer'
  },
  formInputNumber: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    color: '#ffffff',
    padding: '6px 10px',
    fontSize: '0.8rem',
    outline: 'none',
    width: '100%'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.75rem',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginTop: 8,
    padding: '8px',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: '6px',
    maxHeight: '110px',
    overflowY: 'auto',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  runBtn: {
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '6px',
    color: '#07080d',
    padding: '10px 16px',
    fontSize: '0.85rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.15s ease',
    marginTop: 12
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  metricCard: {
    padding: '16px',
    backgroundColor: '#0d0f17',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  metricTitle: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  metricSubtitle: {
    fontSize: '0.65rem',
    color: '#64748b',
    marginTop: 4
  },
  chartTooltip: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(7, 8, 13, 0.95)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '6px',
    padding: '8px 12px',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
  },
  emptyState: {
    height: '100%',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#0d0f17',
    border: '1px dashed rgba(255,255,255,0.06)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.8rem'
  },
  th: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '0.65rem',
    letterSpacing: '0.05em'
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.03)'
  },
  // trHover removed, handled by CSS class .rrg-table-row

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    padding: '24px',
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '540px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s ease'
  },
  tradeModalStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '8px'
  },
  tradeModalLabel: {
    fontSize: '0.8rem',
    color: '#64748b'
  },
  tradeModalVal: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#ffffff'
  }
};
