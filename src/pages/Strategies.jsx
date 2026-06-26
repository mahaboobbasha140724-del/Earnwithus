import React, { useState } from 'react';
import { Award, Compass, Layers, ShieldCheck, Flame, BookOpen, ChevronRight, CheckCircle, Info } from 'lucide-react';

const STRATEGIES_DATA = [
  {
    id: "market-structure",
    title: "1. EWU Market Structure Automator",
    subtitle: "Structure Breaks & Reversals (BOS & CHoCH)",
    difficulty: "Intermediate",
    icon: Compass,
    color: "#0ea5e9", // Blue
    description: "Focuses on identifying structural shifts in market swings. Automating breaks of structure enables traders to catch trend reversals early at key swing levels without drawing lines manually.",
    concepts: [
      "BOS (Break of Structure) - Signals continuation of the active trend.",
      "CHoCH (Change of Character) - Signals the initial shift in trend direction.",
      "Swing Highs & Lows validation."
    ],
    rules: [
      "Wait for a CHoCH signal to indicate the old trend has run out of momentum (character shift).",
      "Once a new trend starts, wait for a BOS (trend continuation break) to confirm strength.",
      "Enter on a pullback to the key swing low or swing high that initiated the break.",
      "Target the next major swing point or unmitigated order block zone."
    ],
    pineCodeSnippet: `//@version=5
indicator("EWU Market Structure", overlay=true)
swingHigh = ta.highest(high, 5)
swingLow = ta.lowest(low, 5)
isBOS = close > swingHigh[1] // Break of Structure
plotshape(isBOS, title="BOS", style=shape.triangleup, color=color.blue)`
  },
  {
    id: "ewu-order-block",
    title: "2. EWU Order Block & Supply/Demand Strategy",
    subtitle: "Institutional Block Orders & Key Zones",
    difficulty: "Intermediate",
    icon: Flame,
    color: "#10b981", // Green
    description: "Identifies zones where institutional players have left unfilled buy or sell orders (Order Blocks), acting as strong support or resistance pivots when price retraces.",
    concepts: [
      "Order Blocks (OB) - Last opposite candle before a strong expansion move",
      "Mitigated vs. Unmitigated OB zones",
      "Volume Profile confluences"
    ],
    rules: [
      "Identify a strong displacement move (high volume breakout) that breaks structure (BOS).",
      "Locate the last opposite candle (down-close before a rally, up-close before a drop) that initiated the move. This is your Order Block.",
      "Draw the Order Block boundary. Place a limit entry order at the open of the block candle.",
      "Set Stop Loss just below/above the block candle wick. Target the next liquidity pool."
    ],
    pineCodeSnippet: `//@version=5
indicator("EWU Order Block Finder", overlay=true)
isBullishOB = close > open and close[1] < open[1] and volume > ta.sma(volume, 20)
plotshape(isBullishOB, "OB", shape.labelup, color=color.green)`
  },
  {
    id: "fvg-imbalance",
    title: "3. EWU Imbalance & Gap Strategy (FVG)",
    subtitle: "Inefficiency & Retracement",
    difficulty: "Advanced",
    icon: Layers,
    color: "#f59e0b", // Amber
    description: "Exploits market inefficiencies caused by rapid, aggressive institutional buying or selling. Price tends to retrace to fill these gaps before resuming its move.",
    concepts: [
      "FVG identification (3-candle sequence mismatch)",
      "Premium vs. Discount equilibrium zones",
      "Inefficiency fill percentages (50% Consequent Encroachment)"
    ],
    rules: [
      "Locate a large expansion candle that leaves a gap between the high of Candle 1 and low of Candle 3.",
      "Draw the Fair Value Gap zone across this inefficiency window.",
      "Set a Limit order at the FVG boundary (or the 50% midpoint) expecting price to fill the gap.",
      "Confirm entry with lower-timeframe character shifts (CHoCH). Stop Loss goes below Candle 1's origin."
    ],
    pineCodeSnippet: `//@version=5
indicator("EWU FVG Visualizer", overlay=true)
isFVG_Bull = low[0] > high[2] and body_size > average_body // Gap between low(0) and high(2)
box.new(left=bar_index[2], top=low[0], right=bar_index, bottom=high[2], bgcolor=color.new(color.yellow, 90))`
  },
  {
    id: "liquidity-sweeps",
    title: "4. EWU Liquidity Sweep Strategy",
    subtitle: "Stop-loss Hunting Confluence",
    difficulty: "Advanced",
    icon: ShieldCheck,
    color: "#8b5cf6", // Purple
    description: "Smart money institutions often trigger concentrated clusters of retail stop-losses (liquidity pools) to acquire orders before executing the true market move.",
    concepts: [
      "Buy-side Liquidity (BSL) above equal highs",
      "Sell-side Liquidity (SSL) below equal lows",
      "SFP (Swing Failure Pattern) sweeps"
    ],
    rules: [
      "Identify clean, equal highs (Double Top) or equal lows (Double Bottom) where retail stops are resting.",
      "Wait for a volatility spike that pierces these levels, executing stop orders (the Sweep).",
      "Look for a rapid close back inside the range (forming a wick/SFP).",
      "Enter immediately in the opposite direction of the sweep. Target the opposite liquidity pool."
    ],
    pineCodeSnippet: `//@version=5
indicator("EWU Liquidity Sweep Detector", overlay=true)
eqLows = ta.lowest(low, 20)
isSweep = low < eqLows[1] and close > eqLows[1] // Sweep and recover
plotchar(isSweep, char="🧹", location=location.belowbar, color=color.purple)`
  }
];

export default function Strategies() {
  const [selectedStrategy, setSelectedStrategy] = useState(STRATEGIES_DATA[0]);

  return (
    <div style={stratStyles.container} className="animate-fade-in">
      
      {/* Ambient Spatial Lighting Orbs */}
      <div style={stratStyles.lightOrbLeft} />
      <div style={stratStyles.lightOrbRight} />

      <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Page Header */}
        <div style={stratStyles.header}>
          <span className="badge-glow" style={stratStyles.spatialBadge}>LEARNING HUB</span>
          <h1 style={stratStyles.headerTitle}>Earn With Us Price Action Academy</h1>
          <p style={stratStyles.headerSubtitle}>
            Unlock institutional market dynamics. Explore interactive guides on swings, structure breaks, order blocks, and liquidity.
          </p>
        </div>

        {/* Info Box - Floating Glass Card */}
        <div className="glass-card" style={stratStyles.infoCard}>
          <div style={stratStyles.infoGlow} />
          <BookOpen size={20} color="#10b981" style={{ flexShrink: 0, position: 'relative', zIndex: 2 }} />
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.6', position: 'relative', zIndex: 2, margin: 0 }}>
            <b>Price Action Architecture:</b> These models focus purely on raw chart mechanics, volume pools, and order inefficiencies, providing a lagging-indicator-free edge to your trading setup.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div style={stratStyles.grid}>
          
          {/* Left Sidebar: Strategy selector with specular highlight */}
          <div style={stratStyles.sidebar}>
            {STRATEGIES_DATA.map((strat) => {
              const IconComponent = strat.icon;
              const isSelected = selectedStrategy.id === strat.id;
              return (
                <div 
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat)}
                  className="spatial-card-hover"
                  style={{
                    ...stratStyles.sidebarCard,
                    borderColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                    background: isSelected 
                      ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
                      : 'rgba(255,255,255,0.02)',
                    boxShadow: isSelected 
                      ? `0 12px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15), 0 0 20px ${strat.color}25` 
                      : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0px rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={stratStyles.sidebarCardHeader}>
                    <div style={{ ...stratStyles.iconBox, backgroundColor: `${strat.color}15`, color: strat.color }}>
                      <IconComponent size={20} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                        {strat.subtitle.split(' (')[0]}
                      </h3>
                      <span style={{ ...stratStyles.difficultyBadge, color: strat.color }}>{strat.difficulty}</span>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" style={{ marginLeft: 8 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed content pane formatted as a floating slab */}
          <div 
            className="glass-card" 
            style={{
              ...stratStyles.contentArea,
              boxShadow: `0 30px 60px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.15), 0 0 35px ${selectedStrategy.color}08`
            }}
          >
            {/* Specular light border on top */}
            <div style={stratStyles.specularLine} />

            <div style={stratStyles.contentHeader}>
              <div>
                <h2 style={stratStyles.contentTitle}>{selectedStrategy.title}</h2>
                <span className="badge-glow" style={{ ...stratStyles.contentBadge, borderColor: selectedStrategy.color, color: selectedStrategy.color }}>
                  {selectedStrategy.subtitle}
                </span>
              </div>
              <span style={{ ...stratStyles.statusIndicator, backgroundColor: `${selectedStrategy.color}15`, color: selectedStrategy.color, borderColor: `${selectedStrategy.color}30` }}>
                {selectedStrategy.difficulty}
              </span>
            </div>

            <p style={stratStyles.strategyDesc}>
              {selectedStrategy.description}
            </p>

            {/* Core Concepts */}
            <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color }}>Core Dynamics Visualized</h4>
            <div style={stratStyles.conceptsGrid}>
              {selectedStrategy.concepts.map((concept, idx) => (
                <div key={idx} style={stratStyles.conceptItem}>
                  <div style={{ ...stratStyles.conceptBullet, backgroundColor: `${selectedStrategy.color}20` }}>
                    <CheckCircle size={14} color={selectedStrategy.color} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{concept}</span>
                </div>
              ))}
            </div>

            {/* Strategy Rules */}
            <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color }}>Execution Ruleset</h4>
            <div style={stratStyles.rulesList}>
              {selectedStrategy.rules.map((rule, idx) => (
                <div key={idx} style={stratStyles.ruleItem}>
                  <div style={{ ...stratStyles.ruleIndex, background: `linear-gradient(135deg, ${selectedStrategy.color} 0%, rgba(255,255,255,0.1) 100%)` }}>
                    {idx + 1}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{rule}</p>
                </div>
              ))}
            </div>

            {/* Pine Script Mock Code Box */}
            <h4 style={{ ...stratStyles.sectionSubTitle, borderLeftColor: selectedStrategy.color }}>Pine Script Code (TradingView Editor)</h4>
            <div style={stratStyles.codeWrapper}>
              <div style={stratStyles.codeHeader}>
                <div style={stratStyles.windowDotRed} />
                <div style={stratStyles.windowDotYellow} />
                <div style={stratStyles.windowDotGreen} />
                <span style={stratStyles.codeTitle}>PineScript_OB_Automator.src</span>
              </div>
              <pre style={stratStyles.pre}>
                <code>{selectedStrategy.pineCodeSnippet}</code>
              </pre>
            </div>
            
            {/* Tips footer block */}
            <div style={{ ...stratStyles.tipsFooter, borderTopColor: 'rgba(255,255,255,0.06)' }}>
              <Info size={18} color={selectedStrategy.color} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Note: Backtest these Price Action setups extensively using historical data before trading. Risk management remains your primary shield in volatile sessions.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// Add CSS styling dynamically for spatial effects and 3D tilts
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .spatial-card-hover {
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      backdrop-filter: blur(20px);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .spatial-card-hover:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.06) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
    }
  `;
  document.head.appendChild(styleEl);
}

const stratStyles = {
  container: {
    padding: '40px 0 64px 0',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh',
  },
  lightOrbLeft: {
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0.0) 70%)',
    position: 'absolute',
    top: '-100px',
    left: '-150px',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  lightOrbRight: {
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, rgba(16, 185, 129, 0.0) 75%)',
    position: 'absolute',
    bottom: '50px',
    right: '-200px',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    marginBottom: '36px',
  },
  spatialBadge: {
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontSize: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  headerTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.5rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginTop: '12px',
    color: '#ffffff',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    marginTop: '6px',
    maxWidth: '700px',
    lineHeight: '1.5',
  },
  infoCard: {
    padding: '20px 24px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(30px)',
    borderRadius: '16px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '32px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  infoGlow: {
    width: '120px',
    height: '120px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
    position: 'absolute',
    left: '-20px',
    top: '-20px',
    zIndex: 1,
    filter: 'blur(10px)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '32px',
    alignItems: 'start',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebarCard: {
    padding: '20px',
    cursor: 'pointer',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
  },
  sidebarCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  difficultyBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '4px',
    display: 'block',
  },
  contentArea: {
    padding: '36px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.2) 70%, transparent)',
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  contentTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  contentBadge: {
    marginTop: '8px',
    display: 'inline-block',
    textTransform: 'none',
    fontSize: '0.8rem',
    padding: '4px 12px',
    borderRadius: '999px',
  },
  statusIndicator: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid',
    textTransform: 'uppercase',
  },
  strategyDesc: {
    color: '#e2e8f0',
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '28px',
  },
  sectionSubTitle: {
    fontSize: '1.05rem',
    color: '#ffffff',
    fontWeight: 700,
    borderLeft: '4px solid',
    paddingLeft: '12px',
    margin: '32px 0 16px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  conceptsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '28px',
  },
  conceptItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  conceptBullet: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    marginBottom: '28px',
  },
  ruleItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  ruleIndex: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  codeWrapper: {
    backgroundColor: '#050608',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '20px',
    overflowX: 'auto',
    boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.8)',
    position: 'relative',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    paddingBottom: '12px',
    marginBottom: '14px',
  },
  windowDotRed: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
  },
  windowDotYellow: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#eab308',
  },
  windowDotGreen: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
  codeTitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginLeft: '12px',
    fontFamily: 'monospace',
  },
  pre: {
    margin: 0,
    color: '#34d399',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  tipsFooter: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '32px',
    borderTop: '1px solid',
    paddingTop: '20px',
  }
};
