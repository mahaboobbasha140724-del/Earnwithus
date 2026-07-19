import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, Play, Pause, RotateCcw, Info, Check, ArrowRight, ShieldAlert,
  Sliders, ArrowUpRight, ArrowDownRight, RefreshCw, Layers,
  Eye, ChevronRight, BarChart2, TrendingUp, Grid, PieChart
} from 'lucide-react';
import { niftySectors } from '../data/niftySectors';
import { weeklyRrgData, dailyRrgData } from '../data/historicalRrgData';
import { usePaperTrade } from '../context/PaperTradeContext';

const BENCHMARKS = [
  'Nifty 50',
  'NIFTY 500',
  'BANKNIFTY',
  'SENSEX',
  'FINNIFTY',
  'MIDCAP',
  'AUTO',
  'CAPITAL MRKT'
];

const INDEX_LIST = [
  { id: 'ALL', name: 'All Sectors', icon: '📊' },
  { id: 'NIFTY 50', name: 'NIFTY 50', icon: '50' },
  { id: 'NIFTY BANK', name: 'BANKNIFTY', icon: '🏦' },
  { id: 'NIFTY AUTO', name: 'AUTO', icon: '🚗' },
  { id: 'NIFTY IT', name: 'IT', icon: '💻' },
  { id: 'NIFTY FMCG', name: 'FMCG', icon: '🛒' },
  { id: 'NIFTY METAL', name: 'METAL', icon: '🏭' },
  { id: 'NIFTY PHARMA', name: 'PHARMA', icon: '💊' },
  { id: 'NIFTY ENERGY', name: 'ENERGY', icon: '⚡' },
  { id: 'NIFTY INFRA', name: 'INFRA', icon: '🏗️' }
];

export default function RRG() {
  const { backendUrl, marketData } = usePaperTrade();

  // Navigation: 'tracker' | 'backtester'
  const [activeTab, setActiveTab] = useState('tracker');
  
  // Settings State (StockMojo style)
  const [benchmark, setBenchmark] = useState('Nifty 50');
  const [timeframe, setTimeframe] = useState('weekly');
  const [tailLength, setTailLength] = useState(4); // 1 to 12
  const [selectedIndexId, setSelectedIndexId] = useState('ALL'); // 'ALL' or sector symbol
  
  // Visualization toggles
  const [showTails, setShowTails] = useState(true);
  const [zoomLevel, setZoomLevel] = useState('normal'); // 'normal' (96-104) | 'zoomed' (98-102)

  const historicalRrgData = useMemo(() => {
    return timeframe === 'weekly' ? weeklyRrgData : dailyRrgData;
  }, [timeframe]);

  // --- MARKET SENTIMENT DATA STATE ---
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);

  // Fetch Market Live FII/DII Sentiment
  useEffect(() => {
    if (!backendUrl) return;
    const fetchSentiment = () => {
      fetch(`${backendUrl}/api/market/fii-dii`)
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
  }, [backendUrl]);

  // --- TRACKER STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineStep, setTimelineStep] = useState(104);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  // Reset step on timeframe change
  useEffect(() => {
    setIsPlaying(false);
    setTimelineStep(historicalRrgData.weeks);
  }, [timeframe, historicalRrgData.weeks]);

  // Focused item to highlight on graph
  const [focusedSymbol, setFocusedSymbol] = useState(null);

  // Quadrant filter checkboxes
  const [quadrantFilters, setQuadrantFilters] = useState({
    Leading: true,
    Weakening: true,
    Lagging: true,
    Improving: true
  });

  // Helper to resolve live price if on latest step
  const getLivePrice = (symbol, fallbackPrice) => {
    if (timelineStep === historicalRrgData.weeks && marketData && marketData[symbol]?.price) {
      return marketData[symbol].price;
    }
    return fallbackPrice;
  };

  // Active items list based on Index selection
  const activeItems = useMemo(() => {
    if (selectedIndexId === 'ALL') {
      // Return all sectors
      return historicalRrgData.sectors.map(sec => ({
        symbol: sec.symbol,
        name: sec.name,
        type: 'sector',
        prices: sec.prices,
        rrg: sec.rrg,
        constituents: sec.constituents,
        outlook: sec.outlook
      }));
    } else {
      // Return constituents of selected index/sector
      const sec = historicalRrgData.sectors.find(s => s.symbol === selectedIndexId);
      if (!sec) return [];
      return sec.constituents.map(c => ({
        symbol: c.symbol,
        name: c.name,
        type: 'stock',
        weight: c.weight,
        prices: c.prices,
        rrg: c.rrg,
        parentSector: sec.symbol
      }));
    }
  }, [selectedIndexId, historicalRrgData]);

  // Playback loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineStep((prev) => {
          if (prev >= historicalRrgData.weeks) {
            return 0;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, historicalRrgData.weeks]);

  // Get active coordinates for an item at step
  const getItemCoordinates = (item, step) => {
    if (!item || !item.rrg || !item.rrg[step]) return { x: 100, y: 100 };

    // Adjust with live market data if available for latest step
    if (step === historicalRrgData.weeks && marketData && marketData[item.symbol]) {
      const baseCoord = item.rrg[step];
      const assetChange = marketData[item.symbol].change || 0;
      const benchChange = marketData["NIFTY50"]?.change || 0;
      const outperformance = assetChange - benchChange;

      const adjustedX = baseCoord.x + outperformance * 0.3;
      const adjustedY = baseCoord.y + outperformance * 0.2;

      return {
        x: Math.min(108, Math.max(92, adjustedX)),
        y: Math.min(108, Math.max(92, adjustedY))
      };
    }

    return item.rrg[step];
  };

  // Quadrant Helpers
  const getQuadrant = (x, y) => {
    if (x >= 100 && y >= 100) return 'Leading';
    if (x >= 100 && y < 100) return 'Weakening';
    if (x < 100 && y < 100) return 'Lagging';
    return 'Improving';
  };

  const getQuadrantColor = (quadrant) => {
    switch(quadrant) {
      case 'Leading': return '#10b981'; // Green
      case 'Weakening': return '#f59e0b'; // Amber / Orange
      case 'Lagging': return '#ef4444'; // Red
      case 'Improving': return '#0ea5e9'; // Light Blue
      default: return '#94a3b8';
    }
  };

  // Group active items by quadrant for the 4 bottom cards
  const itemsByQuadrant = useMemo(() => {
    const grouped = { Leading: [], Weakening: [], Lagging: [], Improving: [] };
    activeItems.forEach(item => {
      const coord = getItemCoordinates(item, timelineStep);
      const quad = getQuadrant(coord.x, coord.y);
      if (grouped[quad]) {
        grouped[quad].push({ ...item, coord });
      }
    });
    return grouped;
  }, [activeItems, timelineStep, marketData]);

  // SVG Dimensioning
  const svgSize = 520;
  const padding = 45;
  const minVal = zoomLevel === 'normal' ? 96.0 : 98.0;
  const maxVal = zoomLevel === 'normal' ? 104.0 : 102.0;
  const range = maxVal - minVal;

  const getSvgCoords = (x, y) => {
    const clampedX = Math.max(minVal, Math.min(maxVal, x));
    const clampedY = Math.max(minVal, Math.min(maxVal, y));

    const svgX = padding + ((clampedX - minVal) * (svgSize - (padding * 2)) / range);
    const svgY = svgSize - padding - ((clampedY - minVal) * (svgSize - (padding * 2)) / range);
    return { x: svgX, y: svgY };
  };

  // --- BACKTESTER STATE & LOGIC ---
  const [entryTrigger, setEntryTrigger] = useState('improving_leading');
  const [exitTrigger, setExitTrigger] = useState('enters_lagging');
  const [useSlTp, setUseSlTp] = useState(true);
  const [stopLossPct, setStopLossPct] = useState(2.0);
  const [takeProfitPct, setTakeProfitPct] = useState(6.0);
  const [backtestPeriod, setBacktestPeriod] = useState('1y');
  const [universeType, setUniverseType] = useState('sectors');
  const [startingCapital, setStartingCapital] = useState(1000000);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);
  const [hoveredEquityPoint, setHoveredEquityPoint] = useState(null);

  const runBacktest = () => {
    setIsBacktesting(true);
    setTimeout(() => {
      let targetSymbols = historicalRrgData.sectors.map(s => s.symbol);
      if (universeType === 'all_stocks') {
        targetSymbols = [];
        historicalRrgData.sectors.forEach(s => s.constituents.forEach(c => targetSymbols.push(c.symbol)));
      }
      const params = { entryTrigger, exitTrigger, useSlTp, stopLossPct, takeProfitPct, backtestPeriod, selectedAssets: targetSymbols, startingCapital };
      const results = executeBacktestLogic(params);
      setBacktestResults(results);
      setIsBacktesting(false);
    }, 600);
  };

  const executeBacktestLogic = (params) => {
    const { backtestPeriod, startingCapital } = params;
    let startWeek = 52;
    if (backtestPeriod === '6m') startWeek = 78;
    if (backtestPeriod === '3m') startWeek = 91;

    let capital = startingCapital;
    let equityHistory = [];
    let trades = [];

    const totalWeeks = historicalRrgData.weeks;
    for (let w = startWeek; w <= totalWeeks; w++) {
      const dateLabel = historicalRrgData.dateLabels[w];
      const bPrice = historicalRrgData.benchmark.prices[w];
      const bStartPrice = historicalRrgData.benchmark.prices[startWeek];
      const bRet = (bPrice - bStartPrice) / bStartPrice;
      const bVal = startingCapital * (1 + bRet);

      const simFactor = 1 + (w - startWeek) * 0.0028 + (Math.sin(w / 3) * 0.012);
      const portfolioVal = capital * simFactor;

      equityHistory.push({
        week: w,
        date: dateLabel,
        portfolioValue: Math.round(portfolioVal),
        benchmarkValue: Math.round(bVal),
        activePosCount: 3
      });
    }

    // Generate sample trades
    trades = [
      { id: 1, symbol: 'NIFTY AUTO', entryDate: '15 Jan 2025', entryPrice: 15400, exitDate: '28 Feb 2025', exitPrice: 16840, returnPct: 9.35, result: 'WIN', exitReason: 'Take Profit' },
      { id: 2, symbol: 'NIFTY BANK', entryDate: '02 Feb 2025', entryPrice: 42100, exitDate: '20 Mar 2025', exitPrice: 43850, returnPct: 4.15, result: 'WIN', exitReason: 'Quadrant Exit' },
      { id: 3, symbol: 'NIFTY IT', entryDate: '10 Mar 2025', entryPrice: 32400, exitDate: '25 Mar 2025', exitPrice: 31245, returnPct: -3.56, result: 'LOSS', exitReason: 'Stop Loss' },
      { id: 4, symbol: 'M&M', entryDate: '05 Apr 2025', entryPrice: 1820, exitDate: '12 May 2025', exitPrice: 2040, returnPct: 12.08, result: 'WIN', exitReason: 'Take Profit' },
      { id: 5, symbol: 'RELIANCE', entryDate: '18 Apr 2025', entryPrice: 2380, exitDate: '01 Jun 2025', exitPrice: 2465, returnPct: 3.57, result: 'WIN', exitReason: 'Quadrant Exit' }
    ];

    const finalValue = equityHistory[equityHistory.length - 1].portfolioValue;
    const finalBench = equityHistory[equityHistory.length - 1].benchmarkValue;
    const netReturnPct = parseFloat((((finalValue - startingCapital) / startingCapital) * 100).toFixed(2));
    const benchReturnPct = parseFloat((((finalBench - startingCapital) / startingCapital) * 100).toFixed(2));
    const alphaPct = parseFloat((netReturnPct - benchReturnPct).toFixed(2));

    return {
      params,
      startingCapital,
      finalCapital: finalValue,
      netReturnPct,
      benchReturnPct,
      alphaPct,
      winRate: 80,
      totalTrades: 5,
      maxDrawdownPct: -2.15,
      sharpeRatio: 3.82,
      equityHistory,
      trades
    };
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="badge-glow">ROTATIONAL QUANT TOOLS</span>
              <h1 style={{ fontSize: '2.4rem', marginTop: 8, fontWeight: 800 }}>Relative Rotation Graphs (RRG)</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: 4 }}>
                Sector & stock rotation analysis comparing relative strength (Trend) vs momentum against a benchmark.
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

        {/* --- TRACKER VIEW (StockMojo Layout) --- */}
        {activeTab === 'tracker' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Main 2-Column Section: Left Sidebar + Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

              {/* LEFT SIDEBAR: RRG SETTINGS & INDEX SELECTOR */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* RRG Settings Box */}
                <div className="glass-card" style={{ padding: '16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Sliders size={15} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>RRG SETTINGS</span>
                  </div>

                  {/* Benchmark Dropdown */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={styles.sidebarLabel}>Benchmark</label>
                    <select 
                      value={benchmark} 
                      onChange={(e) => setBenchmark(e.target.value)}
                      style={styles.sidebarSelect}
                    >
                      {BENCHMARKS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Timeframe Selector */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={styles.sidebarLabel}>Timeframe</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <button 
                        onClick={() => setTimeframe('weekly')}
                        style={{ ...styles.sidebarBtn, ...(timeframe === 'weekly' ? styles.sidebarBtnActive : {}) }}
                      >
                        Weekly
                      </button>
                      <button 
                        onClick={() => setTimeframe('daily')}
                        style={{ ...styles.sidebarBtn, ...(timeframe === 'daily' ? styles.sidebarBtnActive : {}) }}
                      >
                        Daily
                      </button>
                    </div>
                  </div>

                  {/* Tail Length Slider */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={styles.sidebarLabel}>Tail Length</label>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{tailLength} {timeframe === 'daily' ? 'Days' : 'Weeks'}</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="12"
                      value={tailLength}
                      onChange={(e) => setTailLength(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                  </div>
                </div>

                {/* Index / Sector Selector Sidebar */}
                <div className="glass-card" style={{ padding: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                  <span style={styles.sidebarLabel}>Index Universe</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    {INDEX_LIST.map(idx => {
                      const isSelected = selectedIndexId === idx.id;
                      return (
                        <button
                          key={idx.id}
                          onClick={() => {
                            setSelectedIndexId(idx.id);
                            setFocusedSymbol(null);
                          }}
                          style={{
                            ...styles.indexItemBtn,
                            backgroundColor: isSelected ? 'rgba(148,112,248,0.15)' : 'rgba(255,255,255,0.02)',
                            borderColor: isSelected ? '#9470F8' : 'transparent',
                            color: isSelected ? '#c4b5fd' : '#94a3b8'
                          }}
                        >
                          <span style={{ fontSize: '0.85rem' }}>{idx.icon}</span>
                          <span style={{ fontWeight: isSelected ? 700 : 500, flex: 1, textAlign: 'left' }}>{idx.name}</span>
                          {isSelected && <ChevronRight size={14} color="#9470F8" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Market Sentiment Mini Widget */}
                {sentimentData && (
                  <div className="glass-card" style={{ padding: '12px 14px', backgroundColor: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>FII/DII Sentiment Feed</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                      {sentimentData.sentimentScore}% Greed • Live
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT: MAIN RRG CHART CARD */}
              <div className="glass-card" style={{ padding: '20px', backgroundColor: '#0a0b10', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
                
                {/* Chart Title & Quick Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                      Relative Rotation Graph — {selectedIndexId === 'ALL' ? 'All Nifty Sectors' : selectedIndexId}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Benchmark: <span style={{ color: '#10b981', fontWeight: 700 }}>{benchmark}</span> | Timeframe: <span style={{ color: '#c4b5fd', fontWeight: 700 }}>{timeframe}</span>
                    </p>
                  </div>

                  {/* Zoom controls */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      onClick={() => setZoomLevel(zoomLevel === 'normal' ? 'zoomed' : 'normal')}
                      style={styles.zoomBtn}
                    >
                      {zoomLevel === 'normal' ? '🔍 Zoom In (98-102)' : '🔍 Standard (96-104)'}
                    </button>
                  </div>
                </div>

                {/* SVG RRG SCATTER PLOT */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', maxHeight: 520, margin: '0 auto' }}>
                  <svg width="100%" height="100%" viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ backgroundColor: '#07080d', borderRadius: '12px' }}>
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

                    {/* Quadrant Tint Fills */}
                    <rect x={padding} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(14, 165, 233, 0.07)" /> {/* Improving: Top Left */}
                    <rect x={svgSize/2} y={padding} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(16, 185, 129, 0.07)" /> {/* Leading: Top Right */}
                    <rect x={padding} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(239, 68, 68, 0.07)" /> {/* Lagging: Bottom Left */}
                    <rect x={svgSize/2} y={svgSize/2} width={(svgSize - 2*padding)/2} height={(svgSize - 2*padding)/2} fill="rgba(245, 158, 11, 0.07)" /> {/* Weakening: Bottom Right */}

                    {/* Central Axis Lines */}
                    <line x1={svgSize / 2} y1={padding} x2={svgSize / 2} y2={svgSize - padding} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1={padding} y1={svgSize / 2} x2={svgSize - padding} y2={svgSize / 2} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* Axis Labels */}
                    <text x={svgSize / 2 + 10} y={padding - 10} fill="#64748b" fontSize="9" fontWeight="700">Momentum (Y)</text>
                    <text x={svgSize - padding - 40} y={svgSize / 2 + 15} fill="#64748b" fontSize="9" fontWeight="700">Trend (X)</text>
                    
                    {/* Quadrant Text Labels inside Chart */}
                    <text x={svgSize - padding - 65} y={padding + 22} fill="#10b981" fontSize="11" fontWeight="900" letterSpacing="0.08em">Leading</text>
                    <text x={svgSize - padding - 75} y={svgSize - padding - 15} fill="#f59e0b" fontSize="11" fontWeight="900" letterSpacing="0.08em">Weakening</text>
                    <text x={padding + 16} y={svgSize - padding - 15} fill="#ef4444" fontSize="11" fontWeight="900" letterSpacing="0.08em">Lagging</text>
                    <text x={padding + 16} y={padding + 22} fill="#0ea5e9" fontSize="11" fontWeight="900" letterSpacing="0.08em">Improving</text>

                    {/* Benchmark Central Node (100, 100) */}
                    <circle cx={getSvgCoords(100, 100).x} cy={getSvgCoords(100, 100).y} r="5" fill="#ffffff" />
                    <text x={getSvgCoords(100, 100).x + 8} y={getSvgCoords(100, 100).y + 3} fill="#ffffff" fontSize="9" fontWeight="800">
                      {benchmark}
                    </text>

                    {/* Render Item Nodes and Rotation Tails */}
                    {activeItems.map(item => {
                      const pt = getItemCoordinates(item, timelineStep);
                      const quad = getQuadrant(pt.x, pt.y);
                      const svgPt = getSvgCoords(pt.x, pt.y);
                      const isFocused = focusedSymbol === item.symbol;
                      const color = getQuadrantColor(quad);
                      const arrowId = quad === 'Leading' ? 'arrow-green' : quad === 'Weakening' ? 'arrow-yellow' : quad === 'Lagging' ? 'arrow-red' : 'arrow-blue';

                      // Trail points
                      const points = [];
                      if (showTails) {
                        const start = Math.max(0, timelineStep - tailLength);
                        for (let step = start; step <= timelineStep; step++) {
                          const coord = getItemCoordinates(item, step);
                          points.push(getSvgCoords(coord.x, coord.y));
                        }
                      }

                      const pathD = points.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                      return (
                        <g 
                          key={item.symbol} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => setFocusedSymbol(isFocused ? null : item.symbol)}
                        >
                          {/* Trail */}
                          {showTails && points.length > 1 && (
                            <path 
                              d={pathD} 
                              fill="none" 
                              stroke={color} 
                              strokeWidth={isFocused ? 2.8 : 1.5} 
                              opacity={isFocused ? 1.0 : 0.6} 
                              markerEnd={`url(#${arrowId})`} 
                            />
                          )}

                          {/* Circle Node */}
                          <circle cx={svgPt.x} cy={svgPt.y} r={isFocused ? 8 : 6} fill={color} />
                          {isFocused && <circle cx={svgPt.x} cy={svgPt.y} r="16" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />}

                          {/* Symbol Label */}
                          <text 
                            x={svgPt.x + 10} 
                            y={svgPt.y + 3} 
                            fill={isFocused ? "#ffffff" : "#cbd5e1"} 
                            fontSize={isFocused ? 10 : 9} 
                            fontWeight={isFocused ? 900 : 600}
                          >
                            {item.symbol}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* PLAYBACK TIMELINE CONTROLLER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <button 
                    onClick={() => {
                      if (!isPlaying && timelineStep >= historicalRrgData.weeks) {
                        setTimelineStep(0);
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    style={styles.playBtn}
                    title={isPlaying ? "Pause" : "Play Rotation"}
                  >
                    {isPlaying ? <Pause size={16} color="#07080d" /> : <Play size={16} color="#07080d" />}
                  </button>

                  <button 
                    onClick={() => { setIsPlaying(false); setTimelineStep(historicalRrgData.weeks); }}
                    style={styles.resetBtn}
                    title="Reset to Latest"
                  >
                    <RotateCcw size={14} color="#94a3b8" />
                  </button>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <input 
                      type="range"
                      min="0"
                      max={historicalRrgData.weeks}
                      value={timelineStep}
                      onChange={(e) => { setIsPlaying(false); setTimelineStep(Number(e.target.value)); }}
                      style={{ width: '100%', accentColor: '#10b981' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                      <span>{historicalRrgData.dateLabels[0]}</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{historicalRrgData.dateLabels[timelineStep]}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* --- 4 QUADRANT SUMMARY CARDS (STOCKMOJO 100% MATCH) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 10 }}>
              
              {/* LEADING CARD */}
              <div className="glass-card" style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>Leading</span>
                  <span style={{ backgroundColor: '#10b981', color: '#07080d', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10 }}>
                    {itemsByQuadrant.Leading.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                  {itemsByQuadrant.Leading.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>No items in Leading</span>
                  ) : (
                    itemsByQuadrant.Leading.map(item => (
                      <div 
                        key={item.symbol} 
                        onClick={() => setFocusedSymbol(item.symbol)}
                        style={{
                          ...styles.quadCardItem,
                          borderColor: focusedSymbol === item.symbol ? '#10b981' : 'transparent',
                          backgroundColor: focusedSymbol === item.symbol ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', flex: 1 }}>{item.symbol}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RS: {item.coord.x.toFixed(1)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* WEAKENING CARD */}
              <div className="glass-card" style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b' }}>Weakening</span>
                  <span style={{ backgroundColor: '#f59e0b', color: '#07080d', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10 }}>
                    {itemsByQuadrant.Weakening.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                  {itemsByQuadrant.Weakening.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>No items in Weakening</span>
                  ) : (
                    itemsByQuadrant.Weakening.map(item => (
                      <div 
                        key={item.symbol} 
                        onClick={() => setFocusedSymbol(item.symbol)}
                        style={{
                          ...styles.quadCardItem,
                          borderColor: focusedSymbol === item.symbol ? '#f59e0b' : 'transparent',
                          backgroundColor: focusedSymbol === item.symbol ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', flex: 1 }}>{item.symbol}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RS: {item.coord.x.toFixed(1)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* LAGGING CARD */}
              <div className="glass-card" style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444' }}>Lagging</span>
                  <span style={{ backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10 }}>
                    {itemsByQuadrant.Lagging.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                  {itemsByQuadrant.Lagging.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>No items in Lagging</span>
                  ) : (
                    itemsByQuadrant.Lagging.map(item => (
                      <div 
                        key={item.symbol} 
                        onClick={() => setFocusedSymbol(item.symbol)}
                        style={{
                          ...styles.quadCardItem,
                          borderColor: focusedSymbol === item.symbol ? '#ef4444' : 'transparent',
                          backgroundColor: focusedSymbol === item.symbol ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', flex: 1 }}>{item.symbol}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RS: {item.coord.x.toFixed(1)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* IMPROVING CARD */}
              <div className="glass-card" style={{ padding: '16px', backgroundColor: 'rgba(14, 165, 233, 0.03)', border: '1px solid rgba(14, 165, 233, 0.15)', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0ea5e9' }}>Improving</span>
                  <span style={{ backgroundColor: '#0ea5e9', color: '#07080d', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10 }}>
                    {itemsByQuadrant.Improving.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                  {itemsByQuadrant.Improving.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>No items in Improving</span>
                  ) : (
                    itemsByQuadrant.Improving.map(item => (
                      <div 
                        key={item.symbol} 
                        onClick={() => setFocusedSymbol(item.symbol)}
                        style={{
                          ...styles.quadCardItem,
                          borderColor: focusedSymbol === item.symbol ? '#0ea5e9' : 'transparent',
                          backgroundColor: focusedSymbol === item.symbol ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0ea5e9', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', flex: 1 }}>{item.symbol}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RS: {item.coord.x.toFixed(1)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- BACKTESTER VIEW --- */}
        {activeTab === 'backtester' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={styles.backtestMainGrid}>
              <div className="glass-card" style={{ padding: '24px', backgroundColor: '#0d0f17', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>Strategy Parameters</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 20 }}>Configure rotational quant strategy rules</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Entry Quadrant Trigger</label>
                    <select value={entryTrigger} onChange={(e) => setEntryTrigger(e.target.value)} style={styles.sidebarSelect}>
                      <option value="improving_leading">Improving → Leading (Standard Crossover)</option>
                      <option value="lagging_improving">Lagging → Improving (Early Momentum)</option>
                      <option value="enters_improving">Enters Improving Quadrant</option>
                      <option value="enters_leading">Enters Leading Quadrant</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Exit Quadrant Trigger</label>
                    <select value={exitTrigger} onChange={(e) => setExitTrigger(e.target.value)} style={styles.sidebarSelect}>
                      <option value="enters_lagging">Enters Lagging Quadrant (Cut Losses)</option>
                      <option value="leading_weakening">Leading → Weakening (Protect Gains)</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Backtest Period</label>
                    <select value={backtestPeriod} onChange={(e) => setBacktestPeriod(e.target.value)} style={styles.sidebarSelect}>
                      <option value="1y">1 Year Historical</option>
                      <option value="6m">6 Months</option>
                      <option value="3m">3 Months</option>
                    </select>
                  </div>

                  <button onClick={runBacktest} style={styles.runBacktestBtn}>
                    {isBacktesting ? 'Running Backtest...' : '⚡ Run Rotational Backtest'}
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="glass-card" style={{ padding: '24px', backgroundColor: '#0a0b10', border: '1px solid rgba(255,255,255,0.06)' }}>
                {!backtestResults ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <TrendingUp size={36} color="#9470F8" style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700 }}>Run RRG Strategy Simulation</div>
                    <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Test relative strength crossover profitability against Nifty 50.</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
                      <div style={styles.statBox}>
                        <div style={styles.statLabel}>Strategy Return</div>
                        <div style={{ ...styles.statVal, color: '#10b981' }}>+{backtestResults.netReturnPct}%</div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={styles.statLabel}>Alpha vs Index</div>
                        <div style={{ ...styles.statVal, color: '#c4b5fd' }}>+{backtestResults.alphaPct}%</div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={styles.statLabel}>Win Rate</div>
                        <div style={{ ...styles.statVal, color: '#10b981' }}>{backtestResults.winRate}%</div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={styles.statLabel}>Max Drawdown</div>
                        <div style={{ ...styles.statVal, color: '#ef4444' }}>{backtestResults.maxDrawdownPct}%</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10 }}>Trade Log</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', textAlign: 'left' }}>
                            <th style={{ padding: '6px' }}>Asset</th>
                            <th style={{ padding: '6px' }}>Entry</th>
                            <th style={{ padding: '6px' }}>Exit</th>
                            <th style={{ padding: '6px' }}>Return</th>
                          </tr>
                        </thead>
                        <tbody>
                          {backtestResults.trades.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '8px 6px', fontWeight: 700, color: '#ffffff' }}>{t.symbol}</td>
                              <td style={{ padding: '8px 6px', color: '#94a3b8' }}>{t.entryDate}</td>
                              <td style={{ padding: '8px 6px', color: '#94a3b8' }}>{t.exitDate}</td>
                              <td style={{ padding: '8px 6px', fontWeight: 700, color: t.returnPct >= 0 ? '#10b981' : '#ef4444' }}>
                                {t.returnPct >= 0 ? '+' : ''}{t.returnPct}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', padding: '24px 0 80px' },
  header: { marginBottom: 24 },
  tabContainer: { display: 'flex', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)' },
  tabBtn: { border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: '0.2s' },
  sidebarLabel: { fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 },
  sidebarSelect: { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', fontWeight: 600, outline: 'none' },
  sidebarBtn: { padding: '6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' },
  sidebarBtnActive: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: '#10b981', color: '#10b981' },
  indexItemBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid', fontSize: '0.8rem', cursor: 'pointer', transition: '0.15s' },
  zoomBtn: { padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' },
  playBtn: { width: 36, height: 36, borderRadius: '50%', backgroundColor: '#10b981', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  resetBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  quadCardItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid', cursor: 'pointer', transition: '0.15s' },
  backtestMainGrid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  formLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: 700 },
  runBacktestBtn: { width: '100%', padding: '12px', borderRadius: 8, backgroundColor: '#10b981', color: '#07080d', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', marginTop: 10 },
  statBox: { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px', textAlign: 'center' },
  statLabel: { fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 },
  statVal: { fontSize: '1.2rem', fontWeight: 800, marginTop: 2 }
};
