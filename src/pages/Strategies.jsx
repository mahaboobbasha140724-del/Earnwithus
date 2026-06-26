import React, { useState } from 'react';
import { Award, Compass, Layers, ShieldCheck, Flame, BookOpen, ChevronRight, CheckCircle, Info } from 'lucide-react';

const STRATEGIES_DATA = [
  {
    id: "sfx-trend",
    title: "1. SFX Algo Trend Riding Strategy",
    subtitle: "Algorithmic Trend Confirmation",
    difficulty: "Beginner Friendly",
    icon: Flame,
    color: "#10b981", // Green
    description: "This strategy utilizes algorithmic overlays to identify long-term structural trends while filtering out sideways consolidations and market noise.",
    concepts: [
      "Algorithm-generated Buy/Sell Signals",
      "Exponential Moving Average (EMA) Cloud filtering",
      "Dynamic volatility channels (ATR-based bands)"
    ],
    rules: [
      "Identify the higher-timeframe trend bias using the color-coded EMA Cloud (Green = Bullish, Red = Bearish).",
      "Enter a trade only when the SFX Algo flashes a signal in alignment with the EMA Cloud.",
      "Place your Stop Loss just below the bottom of the Cloud channel.",
      "Take profit when the price hits the opposite volatility channel border or when a reversal signal occurs."
    ],
    pineCodeSnippet: `//@version=5
strategy("SFX Trend Strategy", overlay=true)
emaCloud = ta.ema(close, 50)
volatilityATR = ta.atr(14)
longCondition = close > emaCloud and ta.crossover(close, ta.ema(close, 9))
if (longCondition)
    strategy.entry("Long", strategy.long)`
  },
  {
    id: "market-structure",
    title: "2. BOS & CHoCH Market Structure Strategy",
    subtitle: "Structure Breaks & Reversals",
    difficulty: "Intermediate",
    icon: Compass,
    color: "#0ea5e9", // Blue
    description: "Focuses on identifying structural shifts in the market. Automating breaks of structure enables traders to catch trend reversals early at key swing levels.",
    concepts: [
      "BOS (Break of Structure) - Signals continuation of the active trend.",
      "CHoCH (Change of Character) - Signals the initial shift in trend direction.",
      "Swing Highs & Lows validation."
    ],
    rules: [
      "Wait for a CHoCH signal to indicate the old trend has run out of momentum (character shift).",
      "Once a new trend starts, wait for a BOS (trend continuation break) to confirm strength.",
      "Enter on a pullback to the key swing low or swing high that initiated the break.",
      "Target the next major swing point or order block zone."
    ],
    pineCodeSnippet: `//@version=5
indicator("Market Structure Automator", overlay=true)
swingHigh = ta.highest(high, 5)
swingLow = ta.lowest(low, 5)
isBOS = close > swingHigh[1] // Break of Structure
plotshape(isBOS, title="BOS", style=shape.triangleup, color=color.blue)`
  },
  {
    id: "fvg-imbalance",
    title: "3. Fair Value Gaps (FVG) Imbalance Strategy",
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
indicator("FVG Visualizer", overlay=true)
isFVG_Bull = low[0] > high[2] and body_size > average_body // Gap between low(0) and high(2)
box.new(left=bar_index[2], top=low[0], right=bar_index, bottom=high[2], bgcolor=color.new(color.yellow, 90))`
  },
  {
    id: "liquidity-sweeps",
    title: "4. Liquidity Sweeps & Grab Strategy",
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
indicator("Liquidity Sweep Detector", overlay=true)
eqLows = ta.lowest(low, 20)
isSweep = low < eqLows[1] and close > eqLows[1] // Sweep and recover
plotchar(isSweep, char="🧹", location=location.belowbar, color=color.purple)`
  }
];

export default function Strategies() {
  const [selectedStrategy, setSelectedStrategy] = useState(STRATEGIES_DATA[0]);

  return (
    <div style={stratStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={stratStyles.header}>
          <span className="badge-glow">LEARNING ACADEMY</span>
          <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>FluxCharts Trading Strategies</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
            Master institutional Price Action concepts. Learn to identify Smart Money trend confirmations, structure breaks, and liquidity pools.
          </p>
        </div>

        {/* Info Box */}
        <div className="glass-card" style={stratStyles.infoCard}>
          <BookOpen size={20} color="#10b981" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <b>Educational Hub:</b> These strategies are compiled from core concepts popularized by <b>FluxCharts</b> and Price Action indicators on TradingView. Understanding these rules helps you read order flows, support structures, and momentum blocks effectively.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div style={stratStyles.grid}>
          
          {/* Left: Strategy Sidebar selector */}
          <div style={stratStyles.sidebar}>
            {STRATEGIES_DATA.map((strat) => {
              const IconComponent = strat.icon;
              const isSelected = selectedStrategy.id === strat.id;
              return (
                <div 
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat)}
                  className="glass-card"
                  style={{
                    ...stratStyles.sidebarCard,
                    borderColor: isSelected ? strat.color : 'rgba(255,255,255,0.06)',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.02)' : '#0d0f17',
                    boxShadow: isSelected ? `0 0 15px ${strat.color}22` : 'none'
                  }}
                >
                  <div style={stratStyles.sidebarCardHeader}>
                    <div style={{ ...stratStyles.iconBox, backgroundColor: `${strat.color}15`, color: strat.color }}>
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                        {strat.subtitle}
                      </h3>
                      <span style={stratStyles.difficultyBadge}>{strat.difficulty}</span>
                    </div>
                    <ChevronRight size={16} color="#64748b" style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Strategy Content View */}
          <div className="glass-card" style={stratStyles.contentArea}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>{selectedStrategy.title}</h2>
                <span className="badge-glow" style={{ marginTop: 6, display: 'inline-block' }}>{selectedStrategy.subtitle}</span>
              </div>
              <span className="badge-gold" style={{ borderColor: selectedStrategy.color, color: selectedStrategy.color }}>
                {selectedStrategy.difficulty}
              </span>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: 24 }}>
              {selectedStrategy.description}
            </p>

            {/* Core Concepts */}
            <h4 style={stratStyles.sectionSubTitle}>Core Concepts Visualized</h4>
            <div style={stratStyles.conceptsGrid}>
              {selectedStrategy.concepts.map((concept, idx) => (
                <div key={idx} style={stratStyles.conceptItem}>
                  <CheckCircle size={16} color={selectedStrategy.color} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{concept}</span>
                </div>
              ))}
            </div>

            {/* Strategy Rules */}
            <h4 style={stratStyles.sectionSubTitle}>Execution Rules</h4>
            <div style={stratStyles.rulesList}>
              {selectedStrategy.rules.map((rule, idx) => (
                <div key={idx} style={stratStyles.ruleItem}>
                  <div style={{ ...stratStyles.ruleIndex, backgroundColor: selectedStrategy.color }}>
                    {idx + 1}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>{rule}</p>
                </div>
              ))}
            </div>

            {/* Pine Script Mock Code Box */}
            <h4 style={stratStyles.sectionSubTitle}>Pine Script Logic Overlay (TradingView)</h4>
            <div style={stratStyles.codeWrapper}>
              <pre style={stratStyles.pre}>
                <code>{selectedStrategy.pineCodeSnippet}</code>
              </pre>
            </div>
            
            <div style={stratStyles.tipsFooter}>
              <Info size={16} color={selectedStrategy.color} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Note: Backtest this model on paper or a demo account before risking capital. Market conditions change character rapidly.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

const stratStyles = {
  container: {
    padding: '40px 0 64px 0',
  },
  header: {
    marginBottom: '32px',
  },
  infoCard: {
    padding: '16px 20px',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.12)',
    borderRadius: '8px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2.2fr',
    gap: '32px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sidebarCard: {
    padding: '16px',
    cursor: 'pointer',
    transition: '0.2s ease',
  },
  sidebarCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyBadge: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  contentArea: {
    padding: '32px',
    backgroundColor: '#0d0f17',
  },
  sectionSubTitle: {
    fontSize: '1rem',
    color: '#ffffff',
    fontWeight: 700,
    borderLeft: '3px solid #10b981',
    paddingLeft: '10px',
    margin: '24px 0 12px 0',
  },
  conceptsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  conceptItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px',
  },
  ruleItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  ruleIndex: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    color: '#0d0f17',
    fontWeight: 800,
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  codeWrapper: {
    backgroundColor: '#07080d',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '16px',
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
  },
  pre: {
    margin: 0,
    color: '#34d399',
  },
  tipsFooter: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '16px',
  }
};
