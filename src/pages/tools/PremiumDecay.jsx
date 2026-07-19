import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, ComposedChart, Area, AreaChart
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const EXPIRIES = ['24 Jul 2025', '31 Jul 2025', '28 Aug 2025'];

function genDecayData(spot) {
  let hour = 9; let min = 15;
  let callPrem = spot * 0.009; let putPrem = spot * 0.0085; let fut = spot;
  const data = [];
  for (let i = 0; i < 75; i++) {
    const afternoon = hour >= 13;
    callPrem -= afternoon ? (Math.random() * 1.8 + 0.6) : (Math.random() * 0.8 + 0.2);
    putPrem  -= afternoon ? (Math.random() * 1.6 + 0.5) : (Math.random() * 0.7 + 0.1);
    callPrem  = Math.max(1, callPrem + (Math.random() - 0.5) * 4);
    putPrem   = Math.max(1, putPrem  + (Math.random() - 0.5) * 3.5);
    fut      += (Math.random() - 0.49) * 20;
    const callDecay = parseFloat((-(callPrem * 0.05) - Math.random() * 0.3).toFixed(2));
    const putDecay  = parseFloat((-(putPrem  * 0.05) - Math.random() * 0.25).toFixed(2));
    const t = `${hour}:${String(min).padStart(2,'0')}`;
    data.push({
      time: t,
      callLTP: parseFloat(callPrem.toFixed(2)),
      putLTP:  parseFloat(putPrem.toFixed(2)),
      callDecay,
      putDecay,
      future: Math.round(fut),
    });
    min += 5; if (min >= 60) { min = 0; hour++; }
    if (hour >= 15 && min >= 30) break;
  }
  return data;
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {typeof p.value === 'number' && Math.abs(p.value) > 500 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</div>)}
    </div>
  );
};

export default function PremiumDecay() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const data = genDecayData(spot);

  const atm = Math.round(spot / 50) * 50;
  const openCall = data[0]?.callLTP || 0;
  const openPut  = data[0]?.putLTP || 0;
  const curCall  = data[data.length-1]?.callLTP || 0;
  const curPut   = data[data.length-1]?.putLTP || 0;
  const callDecayTotal = parseFloat((openCall - curCall).toFixed(2));
  const putDecayTotal  = parseFloat((openPut  - curPut).toFixed(2));

  return (
    <ToolShell
      title="Premium Decay (Theta)"
      badge="OPTIONS LAB"
      description="Theta erosion visualizer — dual charts showing CE/PE decay rate and actual premiums with Futures overlay"
      instrument={instrument}
      setInstrument={setInstrument}
      expiry={expiry}
      setExpiry={setExpiry}
      expiries={EXPIRIES}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'ATM Strike', value: atm.toLocaleString('en-IN'), color: '#c4b5fd' },
          { label: 'Call LTP (Now)', value: `₹${curCall.toFixed(2)}`, color: '#ef4444' },
          { label: 'Put LTP (Now)', value: `₹${curPut.toFixed(2)}`, color: '#10b981' },
          { label: 'Call Decay', value: `-₹${callDecayTotal}`, color: '#fbbf24' },
          { label: 'Put Decay', value: `-₹${putDecayTotal}`, color: '#fbbf24' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Top chart: Decay Rate */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>⚡ CE / PE Decay Rate (Per 5-min Bar)</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval={9} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip content={<TT />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
            <Line type="monotone" dataKey="callDecay" stroke="#ef4444" strokeWidth={1.5} name="Call Decay" dot={false} />
            <Line type="monotone" dataKey="putDecay"  stroke="#10b981" strokeWidth={1.5} name="Put Decay"  dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom chart: LTP + Futures */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>📉 Call & Put LTP vs Futures Price</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval={9} />
            <YAxis yAxisId="prem" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Premium', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
            <YAxis yAxisId="fut" orientation="right" tick={{ fill: '#9470F8', fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<TT />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
            <Area yAxisId="prem" type="monotone" dataKey="callLTP" fill="rgba(239,68,68,0.07)"   stroke="#ef4444" strokeWidth={2} name="Call LTP" dot={false} />
            <Area yAxisId="prem" type="monotone" dataKey="putLTP"  fill="rgba(16,185,129,0.07)"  stroke="#10b981" strokeWidth={2} name="Put LTP"  dot={false} />
            <Line yAxisId="fut" type="monotone" dataKey="future" stroke="#9470F8" strokeWidth={1.5} name="Future" dot={false} />
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
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
};
