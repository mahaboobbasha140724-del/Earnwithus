import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Zap } from 'lucide-react';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';
import { mockStocks } from '../../data/mockStocks';

const FO_STOCKS = [
  { symbol:'RELIANCE', name:'Reliance Industries', sector:'Energy', price:2465, change:1.45, oiChg:12400, volume:5420000 },
  { symbol:'TCS', name:'Tata Consultancy', sector:'IT', price:3410, change:-0.85, oiChg:-8200, volume:1850000 },
  { symbol:'HDFCBANK', name:'HDFC Bank', sector:'Banking', price:1720, change:0.62, oiChg:18500, volume:7800000 },
  { symbol:'ICICIBANK', name:'ICICI Bank', sector:'Banking', price:1340, change:1.12, oiChg:22000, volume:9200000 },
  { symbol:'INFY', name:'Infosys', sector:'IT', price:1520, change:-1.20, oiChg:-5400, volume:4500000 },
  { symbol:'AXISBANK', name:'Axis Bank', sector:'Banking', price:1180, change:2.34, oiChg:31000, volume:6100000 },
  { symbol:'SBIN', name:'State Bank of India', sector:'Banking', price:830, change:-0.45, oiChg:-12000, volume:8900000 },
  { symbol:'KOTAKBANK', name:'Kotak Bank', sector:'Banking', price:1980, change:0.78, oiChg:9800, volume:2100000 },
  { symbol:'TATAMOTORS', name:'Tata Motors', sector:'Auto', price:964, change:3.21, oiChg:44000, volume:12000000 },
  { symbol:'SUNPHARMA', name:'Sun Pharma', sector:'Pharma', price:1680, change:-0.32, oiChg:-3200, volume:1200000 },
  { symbol:'MARUTI', name:'Maruti Suzuki', sector:'Auto', price:12400, change:1.88, oiChg:5600, volume:340000 },
  { symbol:'LT', name:'Larsen & Toubro', sector:'Infra', price:3540, change:0.55, oiChg:7800, volume:890000 },
  { symbol:'WIPRO', name:'Wipro', sector:'IT', price:545, change:-0.90, oiChg:-6100, volume:3200000 },
  { symbol:'HINDUNILVR', name:'Hindustan Unilever', sector:'FMCG', price:2380, change:0.25, oiChg:1200, volume:980000 },
  { symbol:'ADANIPORTS', name:'Adani Ports', sector:'Infra', price:1420, change:2.10, oiChg:19800, volume:3400000 },
];

const SECTORS = [
  { name: 'Banking', advances: 5, declines: 2 },
  { name: 'IT', advances: 1, declines: 3 },
  { name: 'Auto', advances: 3, declines: 0 },
  { name: 'Pharma', advances: 2, declines: 2 },
  { name: 'Energy', advances: 2, declines: 1 },
  { name: 'FMCG', advances: 2, declines: 1 },
  { name: 'Infra', advances: 3, declines: 1 },
];

export default function MarketMovers() {
  const [tab, setTab] = useState('gainers');
  const { marketData } = usePaperTrade();

  // Inject live prices where available
  const enriched = FO_STOCKS.map(s => {
    const live = marketData?.[s.symbol];
    return live ? { ...s, price: live.price, change: live.change } : s;
  });

  const gainers = [...enriched].sort((a, b) => b.change - a.change).slice(0, 10);
  const losers  = [...enriched].sort((a, b) => a.change - b.change).slice(0, 10);
  const oiBuildup = [...enriched].filter(s => s.oiChg > 0).sort((a, b) => b.oiChg - a.oiChg).slice(0, 10);
  const oiUnwinding = [...enriched].filter(s => s.oiChg < 0).sort((a, b) => a.oiChg - b.oiChg).slice(0, 10);
  const highVol = [...enriched].sort((a, b) => b.volume - a.volume).slice(0, 10);

  const tables = { gainers, losers, oiBuildup, oiUnwinding, highVol };
  const current = tables[tab] || gainers;

  const totalAdvances = enriched.filter(s => s.change > 0).length;
  const totalDeclines = enriched.filter(s => s.change < 0).length;

  const fmtVol = v => v >= 1e7 ? `${(v/1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v/1e5).toFixed(0)}L` : `${(v/1000).toFixed(0)}K`;
  const fmtOI = v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v;

  return (
    <ToolShell
      title="Market Movers"
      badge="MARKET"
      description="F&O top gainers, losers, OI buildup, volume leaders and sector breadth — updated in real-time"
    >
      {/* Breadth Cards */}
      <div style={s.breadthRow}>
        <div style={{ ...s.breadthCard, borderColor: 'rgba(16,185,129,0.2)' }}>
          <TrendingUp size={20} color="#10b981" />
          <div>
            <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.6rem' }}>{totalAdvances}</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Advances</div>
          </div>
        </div>
        <div style={{ ...s.breadthCard, borderColor: 'rgba(239,68,68,0.2)' }}>
          <TrendingDown size={20} color="#ef4444" />
          <div>
            <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.6rem' }}>{totalDeclines}</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Declines</div>
          </div>
        </div>
        <div style={{ ...s.breadthCard, borderColor: 'rgba(148,112,248,0.2)' }}>
          <Activity size={20} color="#9470F8" />
          <div>
            <div style={{ color: '#9470F8', fontWeight: 800, fontSize: '1.6rem' }}>{enriched.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>F&O Stocks Tracked</div>
          </div>
        </div>

        {/* Sector Breadth */}
        {SECTORS.map(sec => (
          <div key={sec.name} style={{ ...s.sectorCard }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>{sec.name}</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{sec.advances}▲</span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>{sec.declines}▼</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['gainers', '📈 Top Gainers'],
          ['losers',  '📉 Top Losers'],
          ['oiBuildup', '🟢 OI Buildup'],
          ['oiUnwinding', '🔴 OI Unwinding'],
          ['highVol', '⚡ High Volume'],
        ].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.btn, ...(tab === t ? s.btnActive : {}) }}>{l}</button>
        ))}
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['#', 'Symbol', 'Name', 'Sector', 'LTP', '% Change', 'OI Change', 'Volume'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {current.map((row, i) => (
              <tr key={row.symbol} style={s.tr}>
                <td style={{ ...s.td, color: '#64748b' }}>{i + 1}</td>
                <td style={{ ...s.td, fontWeight: 800, color: '#c4b5fd' }}>{row.symbol}</td>
                <td style={{ ...s.td, color: '#94a3b8', textAlign: 'left' }}>{row.name}</td>
                <td style={{ ...s.td }}><span style={s.sectorBadge}>{row.sector}</span></td>
                <td style={{ ...s.td, color: '#e2e8f0', fontWeight: 600 }}>₹{row.price.toLocaleString('en-IN')}</td>
                <td style={{ ...s.td }}>
                  <span style={{ color: row.change >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                  </span>
                </td>
                <td style={{ ...s.td, color: row.oiChg >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                  {row.oiChg >= 0 ? '+' : ''}{fmtOI(row.oiChg)}
                </td>
                <td style={{ ...s.td, color: '#64748b' }}>{fmtVol(row.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolShell>
  );
}

const s = {
  breadthRow: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  breadthCard: { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: 10, padding: '14px 20px', minWidth: 120 },
  sectorCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' },
  btn: { padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { padding: '10px 14px', textAlign: 'center', fontSize: '0.73rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.15s' },
  td: { padding: '10px 14px', textAlign: 'center', fontSize: '0.85rem' },
  sectorBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'rgba(148,112,248,0.1)', color: '#9470F8', fontSize: '0.72rem', fontWeight: 600 },
};
