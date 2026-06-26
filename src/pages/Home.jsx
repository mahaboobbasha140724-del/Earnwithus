import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Users, CheckCircle, ArrowRight, Play, Star, ChevronLeft, ChevronRight, Activity, Grid, Compass, BarChart2, PieChart } from 'lucide-react';
import { mockStocks } from '../data/mockStocks';

export default function Home({ setSelectedStockForModal }) {
  const [activeFeatureTab, setActiveFeatureTab] = useState('scanners'); // 'scanners' | 'heatmaps' | 'rrg' | 'sentiment'
  const [activeTraderTab, setActiveTraderTab] = useState('short'); // 'short' | 'long' | 'fo'
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const [liveData, setLiveData] = useState({
    NIFTY50: { price: 24056.00, change: 0.14 },
    BANKNIFTY: { price: 58177.05, change: 0.05 },
    RELIANCE: { price: 2950.00, change: 0.87 },
    HDFCBANK: { price: 1520.50, change: 0.68 },
    TCS: { price: 3950.25, change: -0.38 }
  });
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    
    const fetchOverview = () => {
      fetch(`${API_BASE}/api/market/overview`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success && resData.data) {
            const map = {};
            resData.data.forEach(item => {
              map[item.symbol] = {
                price: item.price,
                change: item.change
              };
            });
            setLiveData(prev => ({
              ...prev,
              ...map
            }));
          }
          setLoadingLive(false);
        })
        .catch(err => {
          console.error("Failed to fetch live quotes on home:", err);
          setLoadingLive(false);
        });
    };

    fetchOverview();
    const interval = setInterval(fetchOverview, 15000); // Real-time updates: poll every 15s
    return () => clearInterval(interval);
  }, []);

  // Auto rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Get some stocks for mini previews
  const energyStocks = mockStocks.filter(s => s.sector === 'Energy').slice(0, 3);
  const techStocks = mockStocks.filter(s => s.sector === 'Information Technology').slice(0, 3);
  const finStocks = mockStocks.filter(s => s.sector === 'Financial Services').slice(0, 3);

  return (
    <div style={homeStyles.container}>
      
      {/* 1. Hero Section */}
      <section style={homeStyles.heroSection}>
        <div className="page-wrapper" style={homeStyles.heroGrid}>
          
          {/* Hero Content */}
          <div style={homeStyles.heroContent} className="animate-slide-up">
            <div style={homeStyles.badge}>
              <span className="badge-glow">Now Live: v2.4 Analytics Update</span>
            </div>
            <h1 style={homeStyles.heroTitle}>
              Supercharge Your <span style={{ color: '#10b981' }}>Stock Trading</span> & Real-time Analysis
            </h1>
            <p style={homeStyles.heroSubtitle}>
              Earn With Us offers institutional-grade stock scanners, options analysis, and relative rotation graphs. Effortlessly spot winning setups, track momentum trends, and make data-backed trades.
            </p>
            <div style={homeStyles.heroActions}>
              <Link to="/pricing" className="btn-primary" style={homeStyles.heroBtn}>
                Get Started for FREE <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="btn-secondary" style={homeStyles.heroBtnSec}>
                View Plans
              </Link>
            </div>
            
            {/* Stats Block */}
            <div style={homeStyles.statsContainer}>
              <div style={homeStyles.statItem}>
                <div style={homeStyles.statIconBox}><Users size={18} color="#10b981" /></div>
                <div>
                  <div style={homeStyles.statVal}>40,000+</div>
                  <div style={homeStyles.statLabel}>Active Traders</div>
                </div>
              </div>
              <div style={homeStyles.statItem}>
                <div style={homeStyles.statIconBox}><Award size={18} color="#f59e0b" /></div>
                <div>
                  <div style={homeStyles.statVal}>30+</div>
                  <div style={homeStyles.statLabel}>Unique Scanners</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Live Widget (Nifty 50 Chart Preview) */}
          <div style={homeStyles.heroVisual} className="animate-fade-in">
            <div className="glass-card" style={homeStyles.chartWidget}>
              <div style={homeStyles.chartHeader}>
                <div>
                  <span style={homeStyles.chartTitle}>NIFTY 50 INDEX</span>
                  <div style={homeStyles.chartPriceContainer}>
                    <span style={homeStyles.chartPrice}>{liveData.NIFTY50.price.toLocaleString()}</span>
                    <span style={{
                      ...homeStyles.chartPriceChange,
                      color: liveData.NIFTY50.change >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {liveData.NIFTY50.change >= 0 ? '+' : ''}{liveData.NIFTY50.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div style={homeStyles.liveDotContainer}>
                  <div style={homeStyles.liveDot} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>LIVE</span>
                </div>
              </div>

              {/* Animated Mock SVG Area Chart */}
              <div style={homeStyles.miniChartWrapper}>
                <svg width="100%" height="150" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="37" x2="400" y2="37" stroke="rgba(255,255,255,0.02)" />
                  <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.02)" />
                  <line x1="0" y1="112" x2="400" y2="112" stroke="rgba(255,255,255,0.02)" />
                  {/* Line Fill */}
                  <path d="M 0 120 L 50 110 L 100 130 L 150 95 L 200 105 L 250 65 L 300 75 L 350 40 L 400 45 L 400 150 L 0 150 Z" fill="url(#heroChartGrad)" />
                  {/* Stroke Line */}
                  <path d="M 0 120 L 50 110 L 100 130 L 150 95 L 200 105 L 250 65 L 300 75 L 350 40 L 400 45" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  {/* Indicator Dot */}
                  <circle cx="400" cy="45" r="5" fill="#10b981" />
                  <circle cx="400" cy="45" r="10" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5" />
                </svg>
              </div>

              {/* Quick stock ticks */}
              <div style={homeStyles.quickTicks}>
                <div style={homeStyles.tickItem} onClick={() => {
                  const stockObj = mockStocks.find(s => s.symbol === 'RELIANCE') || mockStocks[0];
                  setSelectedStockForModal({ ...stockObj, price: liveData.RELIANCE.price, change: liveData.RELIANCE.change });
                }}>
                  <span style={homeStyles.tickSymbol}>RELIANCE</span>
                  <span style={liveData.RELIANCE.change >= 0 ? homeStyles.tickValGreen : homeStyles.tickValRed}>
                    ₹{liveData.RELIANCE.price.toLocaleString()} ({liveData.RELIANCE.change >= 0 ? '+' : ''}{liveData.RELIANCE.change.toFixed(2)}%)
                  </span>
                </div>
                <div style={homeStyles.tickItem} onClick={() => {
                  const stockObj = mockStocks.find(s => s.symbol === 'HDFCBANK') || mockStocks[3];
                  setSelectedStockForModal({ ...stockObj, price: liveData.HDFCBANK.price, change: liveData.HDFCBANK.change });
                }}>
                  <span style={homeStyles.tickSymbol}>HDFCBANK</span>
                  <span style={liveData.HDFCBANK.change >= 0 ? homeStyles.tickValGreen : homeStyles.tickValRed}>
                    ₹{liveData.HDFCBANK.price.toLocaleString()} ({liveData.HDFCBANK.change >= 0 ? '+' : ''}{liveData.HDFCBANK.change.toFixed(2)}%)
                  </span>
                </div>
                <div style={homeStyles.tickItem} onClick={() => {
                  const stockObj = mockStocks.find(s => s.symbol === 'TCS') || mockStocks[1];
                  setSelectedStockForModal({ ...stockObj, price: liveData.TCS.price, change: liveData.TCS.change });
                }}>
                  <span style={homeStyles.tickSymbol}>TCS</span>
                  <span style={liveData.TCS.change >= 0 ? homeStyles.tickValGreen : homeStyles.tickValRed}>
                    ₹{liveData.TCS.price.toLocaleString()} ({liveData.TCS.change >= 0 ? '+' : ''}{liveData.TCS.change.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Key Features Tabbed Showcase */}
      <section style={homeStyles.featuresSection}>
        <div className="page-wrapper">
          <div style={homeStyles.sectionHeader}>
            <span className="badge-glow" style={{ marginBottom: 12 }}>Platform Highlights</span>
            <h2 style={homeStyles.sectionTitle}>Explore Core Analysis Features</h2>
            <p style={homeStyles.sectionSubtitle}>
              Unlock the stock market's full potential. Toggle the tabs below to preview our signature analytics dashboards.
            </p>
          </div>

          {/* Features Navigation Tabs */}
          <div style={homeStyles.featureTabs}>
            <button 
              style={{...homeStyles.featureTabBtn, backgroundColor: activeFeatureTab === 'scanners' ? 'rgba(16,185,129,0.1)' : 'transparent', color: activeFeatureTab === 'scanners' ? '#10b981' : '#94a3b8', borderColor: activeFeatureTab === 'scanners' ? '#10b981' : 'rgba(255,255,255,0.08)'}}
              onClick={() => setActiveFeatureTab('scanners')}
            >
              <Activity size={18} /> Scanners
            </button>
            <button 
              style={{...homeStyles.featureTabBtn, backgroundColor: activeFeatureTab === 'heatmaps' ? 'rgba(16,185,129,0.1)' : 'transparent', color: activeFeatureTab === 'heatmaps' ? '#10b981' : '#94a3b8', borderColor: activeFeatureTab === 'heatmaps' ? '#10b981' : 'rgba(255,255,255,0.08)'}}
              onClick={() => setActiveFeatureTab('heatmaps')}
            >
              <Grid size={18} /> Heatmaps
            </button>
            <button 
              style={{...homeStyles.featureTabBtn, backgroundColor: activeFeatureTab === 'rrg' ? 'rgba(16,185,129,0.1)' : 'transparent', color: activeFeatureTab === 'rrg' ? '#10b981' : '#94a3b8', borderColor: activeFeatureTab === 'rrg' ? '#10b981' : 'rgba(255,255,255,0.08)'}}
              onClick={() => setActiveFeatureTab('rrg')}
            >
              <Compass size={18} /> RRG rotation
            </button>
            <button 
              style={{...homeStyles.featureTabBtn, backgroundColor: activeFeatureTab === 'sentiment' ? 'rgba(16,185,129,0.1)' : 'transparent', color: activeFeatureTab === 'sentiment' ? '#10b981' : '#94a3b8', borderColor: activeFeatureTab === 'sentiment' ? '#10b981' : 'rgba(255,255,255,0.08)'}}
              onClick={() => setActiveFeatureTab('sentiment')}
            >
              <PieChart size={18} /> Sentiment
            </button>
          </div>

          {/* Features Preview Container */}
          <div className="glass-card" style={homeStyles.featureContentCard}>
            
            {/* Scanners Preview */}
            {activeFeatureTab === 'scanners' && (
              <div style={homeStyles.featurePreviewGrid}>
                <div style={homeStyles.featurePreviewText}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Stock Scanners</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
                    Scan and pick high-growth stocks effortlessly with advanced screeners. Filter by RSI crossovers, candlestick structures, Dow trends, volumes, and custom momentum triggers.
                  </p>
                  <ul style={homeStyles.featurePoints}>
                    <li><CheckCircle size={16} color="#10b981" /> 52-Week High & Low breakouts</li>
                    <li><CheckCircle size={16} color="#10b981" /> Daily, Weekly & Hourly RMI signals</li>
                    <li><CheckCircle size={16} color="#10b981" /> Volume spikes & delivery percentages</li>
                  </ul>
                  <Link to="/features/scanners" className="btn-primary" style={{ marginTop: '24px' }}>
                    Open Scanners <ArrowRight size={16} />
                  </Link>
                </div>
                <div style={homeStyles.featurePreviewVisual}>
                  <div style={homeStyles.miniTableCard}>
                    <div style={homeStyles.miniTableHeader}>Price Scanners (52W Highs)</div>
                    {mockStocks.slice(0, 4).map(s => (
                      <div key={s.symbol} style={homeStyles.miniTableRow} onClick={() => setSelectedStockForModal(s)}>
                        <span>{s.symbol}</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>₹{s.price.toFixed(2)}</span>
                        <span className="badge-glow" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Breakout</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Heatmaps Preview */}
            {activeFeatureTab === 'heatmaps' && (
              <div style={homeStyles.featurePreviewGrid}>
                <div style={homeStyles.featurePreviewText}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Color-coded Stock Heatmaps</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
                    Instantly identify outperforming sectors and stocks with a color-coded tree grid map. Easily filter by sectors, index components, and gains.
                  </p>
                  <ul style={homeStyles.featurePoints}>
                    <li><CheckCircle size={16} color="#10b981" /> Visual tree-grid mapping</li>
                    <li><CheckCircle size={16} color="#10b981" /> Percentage change scaling</li>
                    <li><CheckCircle size={16} color="#10b981" /> Sector-wise grouping (IT, Energy, Banks)</li>
                  </ul>
                  <Link to="/features/heatmaps" className="btn-primary" style={{ marginTop: '24px' }}>
                    Open Heatmaps <ArrowRight size={16} />
                  </Link>
                </div>
                <div style={homeStyles.featurePreviewVisual}>
                  <div style={homeStyles.miniHeatmapGrid}>
                    <div style={{...homeStyles.miniHeatmapBox, backgroundColor: 'rgba(16,185,129,0.85)'}} onClick={() => setSelectedStockForModal(mockStocks[3])}>
                      <span>HDFCBANK</span>
                      <strong>+2.1%</strong>
                    </div>
                    <div style={{...homeStyles.miniHeatmapBox, backgroundColor: 'rgba(16,185,129,0.65)'}} onClick={() => setSelectedStockForModal(mockStocks[4])}>
                      <span>ICICIBANK</span>
                      <strong>+1.8%</strong>
                    </div>
                    <div style={{...homeStyles.miniHeatmapBox, backgroundColor: 'rgba(16,185,129,0.5)'}} onClick={() => setSelectedStockForModal(mockStocks[0])}>
                      <span>RELIANCE</span>
                      <strong>+1.4%</strong>
                    </div>
                    <div style={{...homeStyles.miniHeatmapBox, backgroundColor: 'rgba(239,68,68,0.7)'}} onClick={() => setSelectedStockForModal(mockStocks[1])}>
                      <span>TCS</span>
                      <strong>-0.8%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RRG Preview */}
            {activeFeatureTab === 'rrg' && (
              <div style={homeStyles.featurePreviewGrid}>
                <div style={homeStyles.featurePreviewText}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Relative Rotation Graphs (RRG)</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
                    Understand stock and sector rotations relative to index benchmarks. Classify tickers into Leading, Weakening, Lagging, and Improving quadrants.
                  </p>
                  <ul style={homeStyles.featurePoints}>
                    <li><CheckCircle size={16} color="#10b981" /> Quadrant scatter plot grids</li>
                    <li><CheckCircle size={16} color="#10b981" /> Custom rotation tails representing trend strength</li>
                    <li><CheckCircle size={16} color="#10b981" /> Historical trajectory animation controls</li>
                  </ul>
                  <Link to="/features/rrg" className="btn-primary" style={{ marginTop: '24px' }}>
                    Open RRG Chart <ArrowRight size={16} />
                  </Link>
                </div>
                <div style={homeStyles.featurePreviewVisual}>
                  <div style={homeStyles.miniRrgPlot}>
                    {/* Simulated RRG grid */}
                    <div style={homeStyles.rrgLineY} />
                    <div style={homeStyles.rrgLineX} />
                    
                    <div style={{...homeStyles.rrgLabel, top: 12, right: 12, color: '#10b981'}}>LEADING</div>
                    <div style={{...homeStyles.rrgLabel, bottom: 12, right: 12, color: '#f59e0b'}}>WEAKENING</div>
                    <div style={{...homeStyles.rrgLabel, bottom: 12, left: 12, color: '#ef4444'}}>LAGGING</div>
                    <div style={{...homeStyles.rrgLabel, top: 12, left: 12, color: '#0ea5e9'}}>IMPROVING</div>
                    
                    {/* Mock Stock Points */}
                    <div style={{...homeStyles.rrgDot, top: '25%', left: '75%', backgroundColor: '#10b981'}}>
                      <span style={homeStyles.rrgDotLabel}>HDFCBANK</span>
                    </div>
                    <div style={{...homeStyles.rrgDot, top: '65%', left: '80%', backgroundColor: '#f59e0b'}}>
                      <span style={homeStyles.rrgDotLabel}>RELIANCE</span>
                    </div>
                    <div style={{...homeStyles.rrgDot, top: '80%', left: '20%', backgroundColor: '#ef4444'}}>
                      <span style={homeStyles.rrgDotLabel}>TCS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sentiment Preview */}
            {activeFeatureTab === 'sentiment' && (
              <div style={homeStyles.featurePreviewGrid}>
                <div style={homeStyles.featurePreviewText}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Market Sentiment Indicators</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
                    Understand underlying market emotions by tracking FII/DII Net Flows, open interest, and the signature Fear and Greed dials.
                  </p>
                  <ul style={homeStyles.featurePoints}>
                    <li><CheckCircle size={16} color="#10b981" /> Institutional Net Buyers vs. Sellers flows</li>
                    <li><CheckCircle size={16} color="#10b981" /> Fear & Greed index dials</li>
                    <li><CheckCircle size={16} color="#10b981" /> Put-Call Ratio (PCR) sentiment readings</li>
                  </ul>
                  <Link to="/features/sentiment" className="btn-primary" style={{ marginTop: '24px' }}>
                    Open Sentiment Dashboard <ArrowRight size={16} />
                  </Link>
                </div>
                <div style={homeStyles.featurePreviewVisual}>
                  <div style={homeStyles.miniDialCard}>
                    <div style={homeStyles.dialTitle}>Fear & Greed Index</div>
                    {/* Semi circle SVG */}
                    <svg width="200" height="110" viewBox="0 0 200 110">
                      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" strokeLinecap="round" />
                      <path d="M20 100 A80 80 0 0 1 145 40" fill="none" stroke="url(#dialGrad)" strokeWidth="16" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <circle cx="100" cy="100" r="10" fill="#ffffff" />
                      <line x1="100" y1="100" x2="135" y2="45" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div style={homeStyles.dialText}>68 - Greed</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 3. Made For Target Demographics */}
      <section style={homeStyles.tradersHubSection}>
        <div className="page-wrapper">
          <div style={homeStyles.sectionHeader}>
            <span className="badge-glow" style={{ marginBottom: 12 }}>Tailored Trading Hub</span>
            <h2 style={homeStyles.sectionTitle}>Built for Every Style of Market Participant</h2>
            <p style={homeStyles.sectionSubtitle}>
              Whether you are locking in quick momentum profits, researching long-term equity valuations, or scaling options strategies, Earn With Us fits your plan.
            </p>
          </div>

          {/* Hub Navigation Tabs */}
          <div style={homeStyles.traderTabs}>
            <button 
              style={{...homeStyles.traderTabBtn, borderBottomColor: activeTraderTab === 'short' ? '#10b981' : 'transparent', color: activeTraderTab === 'short' ? '#ffffff' : '#64748b'}}
              onClick={() => setActiveTraderTab('short')}
            >
              Short Term Traders
            </button>
            <button 
              style={{...homeStyles.traderTabBtn, borderBottomColor: activeTraderTab === 'long' ? '#10b981' : 'transparent', color: activeTraderTab === 'long' ? '#ffffff' : '#64748b'}}
              onClick={() => setActiveTraderTab('long')}
            >
              Long Term Investors
            </button>
            <button 
              style={{...homeStyles.traderTabBtn, borderBottomColor: activeTraderTab === 'fo' ? '#10b981' : 'transparent', color: activeTraderTab === 'fo' ? '#ffffff' : '#64748b'}}
              onClick={() => setActiveTraderTab('fo')}
            >
              F & O Derivative Traders
            </button>
          </div>

          {/* Hub Content View */}
          <div style={homeStyles.traderHubBody}>
            {activeTraderTab === 'short' && (
              <div style={homeStyles.traderGrid}>
                <div style={homeStyles.traderText}>
                  <h3>Capture Momentum Shifts Instantly</h3>
                  <p style={{ color: '#94a3b8', margin: '14px 0 24px 0' }}>
                    Short-term trading relies on swift entries and exits based on statistical shifts. Track market indicators designed specifically to flag early trend signals.
                  </p>
                  <div style={homeStyles.checklistGrid}>
                    <div style={homeStyles.checklistItem}>⚡ <strong>Rohit Momentum Indicator (RMI)</strong>: Spot trend reversals across multiples cycles.</div>
                    <div style={homeStyles.checklistItem}>⚡ <strong>Dow Theory Indicators</strong>: Easily identify Higher High/Lower Low breakouts.</div>
                    <div style={homeStyles.checklistItem}>⚡ <strong>Real-time Candle Patterns</strong>: Scans for reversal candles like Hammers and Engulfings.</div>
                    <div style={homeStyles.checklistItem}>⚡ <strong>RSI & Moving Average Scanners</strong>: Buy and sell alerts on key levels.</div>
                  </div>
                </div>
                <div style={homeStyles.traderVisual}>
                  <div className="glass-card" style={homeStyles.hubFeatureCard}>
                    <h4 style={{ color: '#10b981', marginBottom: 8 }}>RMI Scanner Signals</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 16 }}>Top daily alerts representing high momentum builds.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={homeStyles.hubRow}><span>RELIANCE</span><span style={{color: '#10b981', fontWeight: 600}}>RMI Daily BUY</span></div>
                      <div style={homeStyles.hubRow}><span>HDFCBANK</span><span style={{color: '#10b981', fontWeight: 600}}>RMI Daily BUY</span></div>
                      <div style={homeStyles.hubRow}><span>ONGC</span><span style={{color: '#10b981', fontWeight: 600}}>RMI Weekly BUY</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTraderTab === 'long' && (
              <div style={homeStyles.traderGrid}>
                <div style={homeStyles.traderText}>
                  <h3>Uncover Deep Fundamental Value</h3>
                  <p style={{ color: '#94a3b8', margin: '14px 0 24px 0' }}>
                    Long-term investing requires systematic review of balance sheets, peer multiples, and valuation metrics. Save hours of research with aggregated sheets.
                  </p>
                  <div style={homeStyles.checklistGrid}>
                    <div style={homeStyles.checklistItem}>📊 <strong>Valuation Ranges</strong>: Compares historical P/E and price-to-book ratios.</div>
                    <div style={homeStyles.checklistItem}>📊 <strong>Financial Ratio Cards</strong>: Instant access to Return on Equity (ROE), debt ratios.</div>
                    <div style={homeStyles.checklistItem}>📊 <strong>Peer Comparison Table</strong>: Evaluate competitors side-by-side in real-time.</div>
                    <div style={homeStyles.checklistItem}>📊 <strong>Institutional Holdings</strong>: Review promoter pledge levels and holdings.</div>
                  </div>
                </div>
                <div style={homeStyles.traderVisual}>
                  <div className="glass-card" style={homeStyles.hubFeatureCard}>
                    <h4 style={{ color: '#f59e0b', marginBottom: 8 }}>Fundamental Overview</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 16 }}>Key valuation metrics for RELIANCE Industries.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={homeStyles.hubRow}><span>P/E Ratio</span><strong>26.4x (Fairly Valued)</strong></div>
                      <div style={homeStyles.hubRow}><span>Debt to Equity</span><strong>0.38 (Low Risk)</strong></div>
                      <div style={homeStyles.hubRow}><span>ROE %</span><strong>14.8% (Healthy)</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTraderTab === 'fo' && (
              <div style={homeStyles.traderGrid}>
                <div style={homeStyles.traderText}>
                  <h3>Leverage Open Interest (OI) & Derivatives Dynamics</h3>
                  <p style={{ color: '#94a3b8', margin: '14px 0 24px 0' }}>
                    Derivatives traders analyze concentration levels of Open Interest and rollover structures. Spot institutional accumulation patterns before the price reacts.
                  </p>
                  <div style={homeStyles.checklistGrid}>
                    <div style={homeStyles.checklistItem}>📈 <strong>OI Interpretation Dials</strong>: Short covering, Long buildup indicators.</div>
                    <div style={homeStyles.checklistItem}>📈 <strong>Option Chain Sheets</strong>: Visual heatmap of highest call/put concentration.</div>
                    <div style={homeStyles.checklistItem}>📈 <strong>Rollover Positioning</strong>: Early indicator of monthly expiry rolls.</div>
                    <div style={homeStyles.checklistItem}>📈 <strong>Strike OI Insights</strong>: Tracks real-time change in OI throughout market hours.</div>
                  </div>
                </div>
                <div style={homeStyles.traderVisual}>
                  <div className="glass-card" style={homeStyles.hubFeatureCard}>
                    <h4 style={{ color: '#0ea5e9', marginBottom: 8 }}>OI Build-Up Interpretation</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 16 }}>Active derivatives positioning indicators.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={homeStyles.hubRow}><span>NIFTY 50</span><span style={{color: '#10b981'}}>Long Build Up</span></div>
                      <div style={homeStyles.hubRow}><span>BANKNIFTY</span><span style={{color: '#10b981'}}>Long Build Up</span></div>
                      <div style={homeStyles.hubRow}><span>TCS</span><span style={{color: '#ef4444'}}>Short Build Up</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Middle Banner */}
      <section style={homeStyles.bannerSection}>
        <div className="page-wrapper" style={homeStyles.bannerWrapper}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>See the trends. Earn the profits.</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Get full access to Earn With Us Pro dashboards for 7 days. Risk-free.</p>
          </div>
          <Link to="/pricing" className="btn-primary" style={homeStyles.bannerBtn}>
            Start 7 Days Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section style={homeStyles.testimonialsSection}>
        <div className="page-wrapper">
          <div style={homeStyles.sectionHeader}>
            <span className="badge-glow" style={{ marginBottom: 12 }}>User Trust</span>
            <h2 style={homeStyles.sectionTitle}>What Professional Traders Say</h2>
          </div>

          <div style={homeStyles.testimonialContainer}>
            <button onClick={handlePrevTestimonial} style={homeStyles.sliderNavBtn} aria-label="Previous Testimonial">
              <ChevronLeft size={24} />
            </button>
            
            <div className="glass-card" style={homeStyles.testimonialCard}>
              <div style={homeStyles.quoteIcon}>“</div>
              <p style={homeStyles.testimonialQuote}>
                {testimonials[testimonialIndex].text}
              </p>
              <div style={homeStyles.testimonialAuthor}>
                <div style={homeStyles.authorAvatar}>
                  {testimonials[testimonialIndex].author[0].toUpperCase()}
                </div>
                <div>
                  <div style={homeStyles.authorName}>{testimonials[testimonialIndex].author}</div>
                  <div style={homeStyles.authorRole}>{testimonials[testimonialIndex].role}</div>
                </div>
              </div>
            </div>

            <button onClick={handleNextTestimonial} style={homeStyles.sliderNavBtn} aria-label="Next Testimonial">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div style={homeStyles.sliderDots}>
            {testimonials.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setTestimonialIndex(i)}
                style={{
                  ...homeStyles.sliderDot,
                  backgroundColor: i === testimonialIndex ? '#10b981' : 'rgba(255,255,255,0.15)'
                }}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// Mock Testimonials
const testimonials = [
  {
    text: "Earn With Us is an amazing tool that I use day in and day out for finding trade opportunities. The team is adding new scanners and features at lightning speed. It packs a huge punch for Indian markets.",
    author: "Manish Sethia",
    role: "Professional Derivatives Trader"
  },
  {
    text: "This is an exceptional stock analysis tool that provides in-depth data analytics. It is incredibly user-friendly, making complex technical screenings efficient and effective for traders at all experience levels.",
    author: "Sbhadip Sikdar",
    role: "Equity Portfolio Manager"
  },
  {
    text: "The user interface is superb and very clean. I've thoroughly enjoyed utilizing the sector heatmaps and RRG charts to assist me in making informed decisions. A must-use tool for any serious participant.",
    author: "VV Rajan",
    role: "Technical Analyst & Swing Investor"
  },
  {
    text: "Data-driven indicators on Earn With Us helped me create a definitive edge in my portfolio for swing trades. The RMI (Rohit Momentum Indicator) scanner helps confirm precise entry points. Highly recommended.",
    author: "Muskaan Kapoor",
    role: "F&O Momentum Trader"
  }
];

const homeStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    paddingBottom: '64px',
  },
  
  // Hero
  heroSection: {
    padding: '80px 0 40px 0',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '48px',
    alignItems: 'center',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px',
  },
  badge: {
    display: 'inline-block',
  },
  heroTitle: {
    fontSize: '3.6rem',
    lineHeight: '1.1',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    width: '100%',
  },
  heroBtn: {
    padding: '14px 28px',
  },
  heroBtnSec: {
    padding: '14px 28px',
  },
  statsContainer: {
    display: 'flex',
    gap: '32px',
    marginTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '24px',
    width: '100%',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  
  // Hero Visual
  heroVisual: {
    display: 'flex',
    justifyContent: 'center',
  },
  chartWidget: {
    width: '100%',
    maxWidth: '440px',
    padding: '24px',
    backgroundColor: 'rgba(22, 26, 41, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  chartTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.05em',
  },
  chartPriceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginTop: '4px',
  },
  chartPrice: {
    fontSize: '1.8rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    color: '#ffffff',
  },
  chartPriceChange: {
    fontSize: '0.85rem',
    color: '#10b981',
    fontWeight: 600,
  },
  liveDotContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(16,185,129,0.1)',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 6px #10b981',
    animation: 'pulse 1.5s infinite',
  },
  miniChartWrapper: {
    margin: '20px 0',
  },
  quickTicks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '16px',
  },
  tickItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    padding: '6px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid transparent',
    transition: '0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderColor: 'rgba(255,255,255,0.06)',
    }
  },
  tickSymbol: {
    fontWeight: 700,
    color: '#ffffff',
  },
  tickValGreen: {
    color: '#10b981',
    fontWeight: 600,
  },
  tickValRed: {
    color: '#ef4444',
    fontWeight: 600,
  },

  // Section Header Generic
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    marginBottom: '12px',
  },
  sectionSubtitle: {
    color: '#94a3b8',
    maxWidth: '680px',
    margin: '0 auto',
    fontSize: '1rem',
  },

  // Key Features
  featuresSection: {
    padding: '60px 0',
  },
  featureTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '28px',
  },
  featureTabBtn: {
    padding: '12px 24px',
    borderRadius: '9999px',
    border: '1px solid',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: '0.2s ease',
  },
  featureContentCard: {
    padding: '40px',
    backgroundColor: 'rgba(22, 26, 41, 0.5)',
  },
  featurePreviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '40px',
    alignItems: 'center',
  },
  featurePreviewText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  featurePoints: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: '12px 0 24px 0',
  },
  featurePreviewVisual: {
    display: 'flex',
    justifyContent: 'center',
  },
  miniTableCard: {
    backgroundColor: '#0a0b10',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '16px',
    width: '100%',
    maxWidth: '340px',
  },
  miniTableHeader: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#64748b',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '10px',
    marginBottom: '12px',
  },
  miniTableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '0.85rem',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    cursor: 'pointer',
  },
  miniHeatmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    width: '100%',
    maxWidth: '340px',
    height: '220px',
  },
  miniHeatmapBox: {
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    color: '#07080d',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  miniRrgPlot: {
    position: 'relative',
    backgroundColor: '#0a0b10',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '340px',
    height: '240px',
  },
  rrgLineY: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: '1px',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  rrgLineX: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  rrgLabel: {
    position: 'absolute',
    fontSize: '0.65rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
  },
  rrgDot: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
  },
  rrgDotLabel: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#ffffff',
    whiteSpace: 'nowrap',
  },
  miniDialCard: {
    backgroundColor: '#0a0b10',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '24px 16px',
    width: '100%',
    maxWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  dialTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#94a3b8',
  },
  dialText: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#10b981',
  },

  // Traders Hub (Made For)
  tradersHubSection: {
    padding: '60px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  traderTabs: {
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '36px',
  },
  traderTabBtn: {
    background: 'none',
    border: 'none',
    padding: '16px 24px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: '0.2s',
  },
  traderHubBody: {
    minHeight: '280px',
  },
  traderGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '48px',
    alignItems: 'center',
  },
  traderText: {
    display: 'flex',
    flexDirection: 'column',
  },
  checklistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '18px',
  },
  checklistItem: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: '1.5',
  },
  traderVisual: {
    display: 'flex',
    justifyContent: 'center',
  },
  hubFeatureCard: {
    width: '100%',
    maxWidth: '340px',
    padding: '24px',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  hubRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    padding: '10px 12px',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.02)',
  },

  // CTA Banner
  bannerSection: {
    padding: '40px 0',
  },
  bannerWrapper: {
    background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    padding: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  bannerBtn: {
    padding: '14px 28px',
  },

  // Testimonials
  testimonialsSection: {
    padding: '60px 0',
  },
  testimonialContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    maxWidth: '720px',
    margin: '0 auto',
  },
  sliderNavBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: '#ffffff',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: '0.2s',
    ':hover': {
      backgroundColor: '#10b981',
      color: '#07080d',
    }
  },
  testimonialCard: {
    flexGrow: 1,
    padding: '36px',
    textAlign: 'center',
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: '12px',
    left: '24px',
    fontSize: '4.5rem',
    color: 'rgba(255,255,255,0.04)',
    fontFamily: 'Georgia, serif',
    lineHeight: '1',
  },
  testimonialQuote: {
    fontSize: '1.1rem',
    color: '#e2e8f0',
    lineHeight: '1.7',
    fontStyle: 'italic',
    marginBottom: '24px',
    position: 'relative',
    zIndex: 1,
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  authorAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: '#07080d',
    fontWeight: 700,
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontWeight: 700,
    color: '#ffffff',
    fontSize: '0.95rem',
    textAlign: 'left',
  },
  authorRole: {
    fontSize: '0.75rem',
    color: '#64748b',
    textAlign: 'left',
  },
  sliderDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  sliderDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: '0.2s',
  }
};
