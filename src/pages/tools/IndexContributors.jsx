import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, PieChart, Pie, Legend
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const INDEX_STOCKS = {
  NIFTY: [
    { symbol: 'HDFCBANK',   weight: 13.2, change: 0.62,  pts: 3.21 },
    { symbol: 'RELIANCE',   weight: 9.8,  change: 1.45,  pts: 2.84 },
    { symbol: 'ICICIBANK',  weight: 8.1,  change: 1.12,  pts: 2.01 },
    { symbol: 'INFY',       weight: 6.4,  change: -1.20, pts: -1.54 },
    { symbol: 'TCS',        weight: 5.9,  change: -0.85, pts: -1.18 },
    { symbol: 'AXISBANK',   weight: 4.2,  change: 2.34,  pts: 1.96 },
    { symbol: 'TATAMOTORS', weight: 3.8,  change: 3.21,  pts: 2.43 },
    { symbol: 'SBIN',       weight: 3.5,  change: -0.45, pts: -0.39 },
    { symbol: 'WIPRO',      weight: 2.8,  change: -0.90, pts: -0.63 },
    { symbol: 'MARUTI',     weight: 2.5,  change: 1.88,  pts: 0.94 },
    { symbol: 'SUNPHARMA',  weight: 2.2,  change: -0.32, pts: -0.17 },
    { symbol: 'KOTAKBANK',  weight: 3.9,  change: 0.78,  pts: 0.61 },
  ],
  BANKNIFTY: [
    { symbol: 'HDFCBANK',  weight: 28.4, change: 0.62,  pts: 5.62 },
    { symbol: 'ICICIBANK', weight: 22.1, change: 1.12,  pts: 7.91 },
    { symbol: 'AXISBANK',  weight: 14.8, change: 2.34,  pts: 11.04 },
    { symbol: 'SBIN',      weight: 10.2, change: -0.45, pts: -1.46 },
    { symbol: 'KOTAKBANK', weight: 12.4, change: 0.78,  pts: 3.08 },
    { symbol: 'PNB',       weight: 2.8,  change: -1.20, pts: -1.07 },
    { symbol: 'BANKBARODA',weight: 2.5,  change: 0.55,  pts: 0.44 },
    { symbol: 'INDUSINDBK',weight: 6.9,  change: -0.82, pts: -1.80 },
  ],
};

const SECTOR_CONTRIB = [
  { name: 'Banking', pts: 12.4, color: '#3b82f6' },
  { name: 'IT', pts: -2.7, color: '#8b5cf6' },
  { name: 'Auto', pts: 3.8, color: '#f59e0b' },
  { name: 'Energy', pts: 2.1, color: '#ef4444' },
  { name: 'Pharma', pts: -0.5, color: '#10b981' },
  { name: 'FMCG', pts: 0.8, color: '#06b6d4' },
];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value > 0 ? '+' : ''}{p.value} pts</div>)}
    </div>
  );
};

export default function IndexContributors() {
  const [instrument, setInstrument] = useState('NIFTY');
  const { marketData } = usePaperTrade();

  const stocks = INDEX_STOCKS[instrument] || INDEX_STOCKS.NIFTY;
  const sorted = [...stocks].sort((a, b) => b.pts - a.pts);
  const totalPts = stocks.reduce((a, r) => a + r.pts, 0).toFixed(2);

  const pieData = SECTOR_CONTRIB.map(s => ({ ...s, value: Math.abs(s.pts), fill: s.color }));

  return (
    <ToolShell
      title="Index Contributors"
      badge="MARKET"
      description="Which stocks drove today's index move — top positive and negative contributors by points"
      instrument={instrument}
      setInstrument={setInstrument}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Index Move', value: `${totalPts > 0 ? '+' : ''}${totalPts} pts`, color: totalPts > 0 ? '#10b981' : '#ef4444' },
          { label: 'Top Contributor', value: sorted[0]?.symbol, color: '#10b981' },
          { label: 'Biggest Drag', value: sorted[sorted.length-1]?.symbol, color: '#ef4444' },
          { label: 'Advances', value: stocks.filter(s => s.pts > 0).length, color: '#10b981' },
          { label: 'Declines', value: stocks.filter(s => s.pts < 0).length, color: '#ef4444' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
        {/* Horizontal Bar Chart */}
        <div style={s.chartBox}>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>
            Point Contribution to {instrument} Today
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 60, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}pts`} />
              <YAxis type="category" dataKey="symbol" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }} width={80} />
              <Tooltip content={<TT />} />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" />
              <Bar dataKey="pts" name="Contribution" radius={[0,4,4,0]}>
                {sorted.map((r, i) => <Cell key={i} fill={r.pts >= 0 ? '#10b981' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Pie */}
        <div style={{ ...s.chartBox, minWidth: 240 }}>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>Sector-wise</div>
          <ResponsiveContainer width={240} height={240}>
            <PieChart>
              <Pie data={pieData} cx={110} cy={110} innerRadius={60} outerRadius={100} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip formatter={(v, n, p) => [`${p.payload.pts > 0 ? '+' : ''}${p.payload.pts} pts`, p.payload.name]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }}>
            {SECTOR_CONTRIB.map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  <span style={{ color: '#94a3b8' }}>{s.name}</span>
                </span>
                <span style={{ color: s.pts >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{s.pts > 0 ? '+' : ''}{s.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12, fontSize: '0.9rem' }}>Full Stock-wise Contribution</div>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>{['Symbol', 'Weight%', '% Change', 'Pts Contribution'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {sorted.map(row => (
                <tr key={row.symbol} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 800, color: '#c4b5fd' }}>{row.symbol}</td>
                  <td style={{ ...s.td, color: '#64748b' }}>{row.weight}%</td>
                  <td style={{ ...s.td, color: row.change >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    {row.change >= 0 ? '+' : ''}{row.change}%
                  </td>
                  <td style={{ ...s.td, color: row.pts >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {row.pts > 0 ? '+' : ''}{row.pts} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolShell>
  );
}

const s = {
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 120px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.1rem', fontWeight: 700 },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 400 },
  th: { padding: '10px 14px', textAlign: 'center', fontSize: '0.73rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 14px', textAlign: 'center', fontSize: '0.85rem' },
};
