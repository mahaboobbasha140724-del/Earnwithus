import React, { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Cell
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const BUILDUP_TYPES = {
  'Long Buildup':   { color: '#10b981', bg: 'rgba(16,185,129,0.15)', desc: '↑ Price + ↑ OI → Longs accumulating' },
  'Short Buildup':  { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  desc: '↓ Price + ↑ OI → Shorts accumulating' },
  'Long Unwinding': { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', desc: '↓ Price + ↓ OI → Longs exiting' },
  'Short Covering': { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', desc: '↑ Price + ↓ OI → Shorts covering' },
};

function genPriceOIData(spot) {
  let hour = 9; let min = 15;
  let price = spot; let oi = 2000000;
  const data = [];
  for (let i = 0; i < 75; i++) {
    const pChg = (Math.random() - 0.49) * 35;
    const oiChg = (Math.random() - 0.47) * 40000;
    price = Math.max(spot * 0.9, price + pChg);
    oi = Math.max(500000, oi + oiChg);
    const t = `${hour}:${String(min).padStart(2,'0')}`;
    let buildup = 'Neutral';
    if (pChg > 0 && oiChg > 0)  buildup = 'Long Buildup';
    if (pChg < 0 && oiChg > 0)  buildup = 'Short Buildup';
    if (pChg < 0 && oiChg < 0)  buildup = 'Long Unwinding';
    if (pChg > 0 && oiChg < 0)  buildup = 'Short Covering';
    data.push({ time: t, price: Math.round(price), oi: Math.round(oi / 1000), pChg: parseFloat(pChg.toFixed(1)), oiChg: Math.round(oiChg), buildup });
    min += 5; if (min >= 60) { min = 0; hour++; }
    if (hour >= 15 && min >= 30) break;
  }
  return data;
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const buildup = payload[0]?.payload?.buildup;
  const bt = BUILDUP_TYPES[buildup];
  return (
    <div style={{ background: '#0d0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', minWidth: 180 }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {p.dataKey === 'price' ? `₹${p.value}` : `${p.value}K`}</div>)}
      {bt && <div style={{ marginTop: 8, padding: '4px 8px', borderRadius: 4, background: bt.bg, color: bt.color, fontSize: '0.78rem', fontWeight: 600 }}>{buildup}</div>}
    </div>
  );
};

export default function PriceVsOI() {
  const [instrument, setInstrument] = useState('NIFTY');
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const data = genPriceOIData(spot);

  // Count buildup types
  const counts = data.reduce((acc, r) => { acc[r.buildup] = (acc[r.buildup] || 0) + 1; return acc; }, {});
  const dominant = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];

  return (
    <ToolShell
      title="Price vs Open Interest"
      badge="FUTURES LAB"
      description="Classifies market moves: Long/Short Buildup, Long/Short Unwinding using Price + OI relationship"
      instrument={instrument}
      setInstrument={setInstrument}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Spot', value: `₹${spot.toLocaleString('en-IN')}`, color: '#fff' },
          { label: 'Dominant Signal', value: dominant?.[0] || '—', color: BUILDUP_TYPES[dominant?.[0]]?.color || '#94a3b8' },
          { label: 'Long Buildup', value: counts['Long Buildup'] || 0, color: '#10b981' },
          { label: 'Short Buildup', value: counts['Short Buildup'] || 0, color: '#ef4444' },
          { label: 'Short Covering', value: counts['Short Covering'] || 0, color: '#fbbf24' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={s.legendGrid}>
        {Object.entries(BUILDUP_TYPES).map(([k, v]) => (
          <div key={k} style={{ ...s.legendCard, borderLeftColor: v.color }}>
            <div style={{ color: v.color, fontWeight: 700, fontSize: '0.85rem' }}>{k}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 3 }}>{v.desc}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>Price (Line) vs OI in Thousands (Bars) — Color = Buildup Type</div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 10, right: 60, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval={9} />
            <YAxis yAxisId="price" domain={['auto','auto']} tick={{ fill: '#9470F8', fontSize: 10 }} label={{ value: 'Price', angle: -90, position: 'insideLeft', fill: '#9470F8', fontSize: 10 }} />
            <YAxis yAxisId="oi" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}K`} />
            <Tooltip content={<TT />} />
            <Bar yAxisId="oi" dataKey="oi" name="OI (K)" radius={[2,2,0,0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={BUILDUP_TYPES[entry.buildup]?.color || '#475569'} opacity={0.7} />
              ))}
            </Bar>
            <Line yAxisId="price" type="monotone" dataKey="price" stroke="#9470F8" strokeWidth={2} name="Price" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ToolShell>
  );
}

const s = {
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 120px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.15rem', fontWeight: 700 },
  legendGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 },
  legendCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid', borderRadius: 8, padding: '10px 14px' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' },
};
