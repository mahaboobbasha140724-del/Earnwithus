import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area, Legend
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

function genADData() {
  const data = [];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  let advances = 1200; let declines = 800;
  for (let i = 0; i < 90; i++) {
    advances = Math.max(100, advances + (Math.random() - 0.48) * 80);
    declines = Math.max(100, declines + (Math.random() - 0.52) * 80);
    const ratio = parseFloat((advances / declines).toFixed(2));
    const week = Math.floor(i / 7);
    data.push({
      day: `${months[Math.floor(week/4) % 7]}${(i%7)+1}`,
      advances: Math.round(advances),
      declines: Math.round(declines),
      ratio,
    });
  }
  return data;
}

function genIntradayAD() {
  let hour = 9; let min = 15;
  let adv = 1100; let dec = 900;
  const data = [];
  for (let i = 0; i < 75; i++) {
    adv = Math.max(50, adv + (Math.random() - 0.48) * 40);
    dec = Math.max(50, dec + (Math.random() - 0.52) * 40);
    const t = `${hour}:${String(min).padStart(2,'0')}`;
    data.push({ time: t, advances: Math.round(adv), declines: Math.round(dec), ratio: parseFloat((adv/dec).toFixed(2)) });
    min += 5; if (min >= 60) { min = 0; hour++; }
    if (hour >= 15 && min >= 30) break;
  }
  return data;
}

const SECTOR_BREADTH = [
  { name: 'Banking', advances: 8, declines: 4, total: 12 },
  { name: 'IT', advances: 5, declines: 15, total: 20 },
  { name: 'Auto', advances: 12, declines: 3, total: 15 },
  { name: 'Pharma', advances: 8, declines: 7, total: 15 },
  { name: 'FMCG', advances: 5, declines: 5, total: 10 },
  { name: 'Energy', advances: 6, declines: 4, total: 10 },
  { name: 'Metal', advances: 9, declines: 6, total: 15 },
  { name: 'Realty', advances: 3, declines: 7, total: 10 },
  { name: 'Infra', advances: 7, declines: 3, total: 10 },
  { name: 'Media', advances: 2, declines: 8, total: 10 },
];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function AdvanceDecline() {
  const [tab, setTab] = useState('intraday');

  const intraday = genIntradayAD();
  const historical = genADData();
  const data = tab === 'intraday' ? intraday : historical;
  const latest = data[data.length - 1];
  const xKey = tab === 'intraday' ? 'time' : 'day';

  const totalAdvances = latest?.advances || 0;
  const totalDeclines = latest?.declines || 0;
  const adRatio = latest?.ratio || 1;
  const marketBreadth = adRatio > 1.5 ? 'Strong Bullish' : adRatio > 1.0 ? 'Bullish' : adRatio > 0.7 ? 'Bearish' : 'Strong Bearish';
  const mbColor = adRatio > 1.0 ? '#10b981' : '#ef4444';

  return (
    <ToolShell
      title="Advance / Decline Ratio"
      badge="MARKET"
      description="Market breadth indicator — tracks advancing vs declining stocks intraday and historically"
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Advances', value: totalAdvances, color: '#10b981' },
          { label: 'Declines', value: totalDeclines, color: '#ef4444' },
          { label: 'A/D Ratio', value: adRatio.toFixed(2), color: adRatio > 1 ? '#10b981' : '#ef4444' },
          { label: 'Breadth', value: marketBreadth, color: mbColor },
          { label: 'Unchanged', value: Math.floor(Math.random() * 100 + 50), color: '#64748b' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['intraday','historical'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.btn, ...(tab === t ? s.btnActive : {}) }}>
            {t === 'intraday' ? '📊 Today' : '📅 90-Day'}
          </button>
        ))}
      </div>

      {/* A/D Chart */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>Advance / Decline Over Time</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="advGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="decGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 10 }} interval={tab === 'intraday' ? 9 : 8} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip content={<TT />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
            <Area type="monotone" dataKey="advances" name="Advances" stroke="#10b981" fill="url(#advGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="declines" name="Declines" stroke="#ef4444" fill="url(#decGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sector Breadth Table */}
      <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12, fontSize: '0.9rem' }}>Sector-wise Breadth</div>
      <div style={s.sectorGrid}>
        {SECTOR_BREADTH.map(sec => {
          const pct = Math.round((sec.advances / sec.total) * 100);
          const color = pct > 60 ? '#10b981' : pct > 40 ? '#fbbf24' : '#ef4444';
          return (
            <div key={sec.name} style={s.sectorCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>{sec.name}</span>
                <span style={{ color, fontWeight: 700, fontSize: '0.85rem' }}>{pct}%</span>
              </div>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${pct}%`, background: color }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: '#64748b' }}>
                <span style={{ color: '#10b981' }}>▲ {sec.advances}</span>
                <span style={{ color: '#ef4444' }}>▼ {sec.declines}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ToolShell>
  );
}

const s = {
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 120px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.2rem', fontWeight: 700 },
  btn: { padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  sectorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 },
  sectorCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 14px' },
  barTrack: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s ease' },
};
