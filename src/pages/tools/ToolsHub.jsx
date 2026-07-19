import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, BarChart2, TrendingUp, TrendingDown, Zap, Target,
  Layers, Grid, GitBranch, BarChart, PieChart, Shuffle, Clock,
  DollarSign, Users, Globe, ArrowUpDown, Eye, Flame
} from 'lucide-react';

const TOOLS = [
  {
    category: '🔵 Options Lab',
    color: '#9470F8',
    tools: [
      { icon: <Grid size={22} />, name: 'Option Chain', desc: 'Live NSE option chain with OI, IV, Buildup & Max Pain', path: '/tools/option-chain', badge: 'CORE' },
      { icon: <BarChart2 size={22} />, name: 'Open Interest', desc: 'CE vs PE OI distribution across strikes', path: '/tools/open-interest', badge: 'CORE' },
      { icon: <ArrowUpDown size={22} />, name: 'Put-Call Ratio', desc: 'Intraday PCR chart with 365-day historical trend', path: '/tools/put-call-ratio', badge: 'CORE' },
      { icon: <Layers size={22} />, name: 'PE-CE Difference', desc: 'Time-stamped OI change difference table', path: '/tools/pe-ce-difference' },
      { icon: <Activity size={22} />, name: 'Straddle Chart', desc: 'ATM straddle premium decay visualization', path: '/tools/straddle-chart' },
      { icon: <TrendingDown size={22} />, name: 'Premium Decay', desc: 'Theta erosion dual chart with Futures overlay', path: '/tools/premium-decay' },
      { icon: <Target size={22} />, name: 'Max Pain', desc: 'Strike where max options expire worthless', path: '/tools/max-pain', badge: 'HOT' },
    ]
  },
  {
    category: '🟣 Advanced Analytics',
    color: '#c4b5fd',
    tools: [
      { icon: <GitBranch size={22} />, name: 'Price vs OI', desc: 'Long/Short Buildup classification chart', path: '/tools/price-vs-oi' },
      { icon: <Flame size={22} />, name: 'IV Analysis', desc: 'Implied vs Historical Volatility + IVP gauge', path: '/tools/iv-analysis' },
      { icon: <Zap size={22} />, name: 'Gamma Exposure', desc: 'Dealer GEX by strike with gamma flip level', path: '/tools/gamma-exposure', badge: 'PRO' },
      { icon: <Shuffle size={22} />, name: 'MultiStrike Chart', desc: 'Overlay up to 5 CE/PE premiums simultaneously', path: '/tools/multistrike' },
    ]
  },
  {
    category: '🟢 Market Internals',
    color: '#10b981',
    tools: [
      { icon: <BarChart size={22} />, name: 'Market Movers', desc: 'Top F&O gainers, losers, OI buildup & volume', path: '/tools/market-movers', badge: 'CORE' },
      { icon: <TrendingUp size={22} />, name: 'Advance / Decline', desc: 'Market breadth with sector breakdown', path: '/tools/advance-decline' },
      { icon: <PieChart size={22} />, name: 'Index Contributors', desc: 'Which stocks drove today\'s index move', path: '/tools/index-contributors' },
      { icon: <DollarSign size={22} />, name: 'FII/DII History', desc: '365-day FII/DII flow chart with Nifty overlay', path: '/tools/fii-dii-history', badge: 'LIVE' },
    ]
  },
  {
    category: '🟡 Existing Tools',
    color: '#fbbf24',
    tools: [
      { icon: <Activity size={22} />, name: 'Scanners', desc: 'Real-time technical stock scanners & filters', path: '/features/scanners', badge: 'CORE' },
      { icon: <Grid size={22} />, name: 'Heatmaps', desc: 'Color-coded sector & stock heatmaps', path: '/features/heatmaps' },
      { icon: <Globe size={22} />, name: 'RRG', desc: 'Relative Rotation Graph for sector momentum', path: '/features/rrg', badge: 'HOT' },
      { icon: <Eye size={22} />, name: 'Sentiment', desc: 'Fear/Greed, FII/DII flows & participant data', path: '/features/sentiment' },
      { icon: <BarChart2 size={22} />, name: 'Futures & Options', desc: 'F&O option chain, OI analytics & rollovers', path: '/features/futures-options' },
      { icon: <Layers size={22} />, name: 'Strategies', desc: 'Option strategy builder with payoff diagrams', path: '/strategies', badge: 'CORE' },
      { icon: <Target size={22} />, name: 'Paper Trade', desc: 'Practice trading with zero-risk simulation', path: '/paper-trade' },
    ]
  },
];

const BADGE_STYLES = {
  CORE: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  HOT:  { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  PRO:  { bg: 'rgba(148,112,248,0.15)', color: '#9470F8' },
  LIVE: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  NEW:  { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
};

export default function ToolsHub() {
  const totalTools = TOOLS.reduce((a, c) => a + c.tools.length, 0);

  return (
    <div style={s.container} className="animate-fade-in">
      <div className="page-wrapper">

        {/* Hero */}
        <div style={s.hero}>
          <span className="badge-glow" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>ALL TOOLS</span>
          <h1 style={s.heroTitle}>
            Your Complete <span style={{ color: '#9470F8' }}>Trading Arsenal</span>
          </h1>
          <p style={s.heroDesc}>
            {totalTools}+ professional-grade tools — Options Lab, Futures Analytics, Market Internals & more.
            Everything you need to analyze Indian markets like a pro.
          </p>

          {/* Quick Stats */}
          <div style={s.quickStats}>
            {[
              { label: 'Total Tools', value: totalTools },
              { label: 'Options Tools', value: 11 },
              { label: 'Market Tools', value: 4 },
              { label: 'Always Free Trial', value: '7 Days' },
            ].map(st => (
              <div key={st.label} style={s.quickStatCard}>
                <div style={s.quickStatVal}>{st.value}</div>
                <div style={s.quickStatLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Categories */}
        {TOOLS.map(cat => (
          <div key={cat.category} style={s.section}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <h2 style={{ ...s.catTitle, color: cat.color }}>{cat.category}</h2>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{cat.tools.length} tools</span>
            </div>

            <div style={s.grid}>
              {cat.tools.map(tool => (
                <Link key={tool.path} to={tool.path} style={s.card} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ ...s.iconBox, background: cat.color + '20', color: cat.color }}>
                      {tool.icon}
                    </div>
                    {tool.badge && (
                      <span style={{ ...s.badge, ...BADGE_STYLES[tool.badge] }}>{tool.badge}</span>
                    )}
                  </div>
                  <div style={s.toolName}>{tool.name}</div>
                  <div style={s.toolDesc}>{tool.desc}</div>
                  <div style={{ ...s.arrow, color: cat.color }}>Open →</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', padding: '32px 0 80px' },
  hero: { textAlign: 'center', paddingBottom: 60, paddingTop: 20 },
  heroTitle: {
    fontSize: 'clamp(2rem,5vw,3rem)',
    fontWeight: 900,
    marginTop: 14,
    marginBottom: 16,
    background: 'linear-gradient(135deg, #fff 50%, #9470F8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.15,
  },
  heroDesc: { color: '#94a3b8', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto 32px', lineHeight: 1.7 },
  quickStats: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  quickStatCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 28px', textAlign: 'center', minWidth: 110 },
  quickStatVal: { fontSize: '1.8rem', fontWeight: 800, color: '#9470F8' },
  quickStatLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 },
  section: { marginBottom: 48 },
  catTitle: { fontSize: '1.2rem', fontWeight: 800 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16 },
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  iconBox: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' },
  toolName: { fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 },
  toolDesc: { fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, flex: 1, marginBottom: 14 },
  arrow: { fontSize: '0.8rem', fontWeight: 700 },
};
