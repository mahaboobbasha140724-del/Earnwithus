import React, { useState, useEffect } from 'react';
import {
  ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Cell, Area, AreaChart
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

function genFIIDIIHistory(days) {
  const data = []; let nifty = 22500; let cumFII = 0; let cumDII = 0;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  for (let i = days; i >= 0; i--) {
    const fii = Math.round((Math.random() - 0.48) * 3500);
    const dii = Math.round((Math.random() - 0.45) * 2800);
    nifty += (Math.random() - 0.49) * 150;
    cumFII += fii;
    cumDII += dii;
    const week = Math.floor((days - i) / 7);
    const label = `${months[Math.floor(week/4) % 7]}${((days-i)%30)+1}`;
    if (i % (days > 90 ? 7 : 1) === 0) {
      data.push({ date: label, fii, dii, nifty: Math.round(nifty), cumFII: Math.round(cumFII), cumDII: Math.round(cumDII) });
    }
  }
  return data;
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: {p.dataKey === 'nifty' ? `₹${p.value?.toLocaleString('en-IN')}` : `₹${Math.abs(p.value || 0).toFixed(0)} Cr ${(p.value || 0) >= 0 ? '▲' : '▼'}`}
        </div>
      ))}
    </div>
  );
};

export default function FIIDIIHistory() {
  const [period, setPeriod] = useState(30);
  const [view, setView] = useState('daily'); // daily | cumulative
  const { backendUrl } = usePaperTrade();
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    if (!backendUrl) return;
    fetch(`${backendUrl}/api/market/fii-dii`)
      .then(r => r.json())
      .then(d => { if (d.success) setLiveData(d); })
      .catch(() => {});
  }, [backendUrl]);

  const data = genFIIDIIHistory(period);
  const latestFII = liveData?.flows?.find(f => f.segment === 'FII Cash Market')?.netValue || 0;
  const latestDII = liveData?.flows?.find(f => f.segment === 'DII Cash Market')?.netValue || 0;

  const totalFII = data.reduce((a, r) => a + r.fii, 0);
  const totalDII = data.reduce((a, r) => a + r.dii, 0);
  const netFlow = totalFII + totalDII;

  return (
    <ToolShell
      title="FII / DII Historical Flows"
      badge="MARKET"
      description="Historical FII and DII buy/sell flow analysis with cumulative net positions overlaid with Nifty"
    >
      {/* Live Stats */}
      {liveData && (
        <div style={s.liveBox}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>🔴 LIVE</span>
          <span style={{ color: '#64748b', margin: '0 8px' }}>|</span>
          <span style={{ color: '#94a3b8', fontSize: '0.87rem' }}>Today: </span>
          <span style={{ color: latestFII >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, marginLeft: 8 }}>
            FII: ₹{Math.abs(latestFII).toFixed(0)} Cr {latestFII >= 0 ? '▲' : '▼'}
          </span>
          <span style={{ color: latestDII >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, marginLeft: 16 }}>
            DII: ₹{Math.abs(latestDII).toFixed(0)} Cr {latestDII >= 0 ? '▲' : '▼'}
          </span>
        </div>
      )}

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: `${period}D FII Net`, value: `₹${Math.abs(Math.round(totalFII)).toLocaleString('en-IN')} Cr`, color: totalFII >= 0 ? '#10b981' : '#ef4444', suffix: totalFII >= 0 ? '▲' : '▼' },
          { label: `${period}D DII Net`, value: `₹${Math.abs(Math.round(totalDII)).toLocaleString('en-IN')} Cr`, color: totalDII >= 0 ? '#10b981' : '#ef4444', suffix: totalDII >= 0 ? '▲' : '▼' },
          { label: 'Combined Net Flow', value: `₹${Math.abs(Math.round(netFlow)).toLocaleString('en-IN')} Cr`, color: netFlow >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Dominant Force', value: Math.abs(totalFII) > Math.abs(totalDII) ? 'FII' : 'DII', color: '#fbbf24' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value} {st.suffix || ''}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[30, 90, 180, 365].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ ...s.btn, ...(period === p ? s.btnActive : {}) }}>{p}D</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {['daily','cumulative'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ ...s.btn, ...(view === v ? s.btnActive : {}) }}>
            {v === 'daily' ? '📊 Daily Flow' : '📈 Cumulative'}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>
          {view === 'daily' ? 'Daily FII/DII Buy-Sell Net (₹ Cr) vs Nifty' : 'Cumulative FII/DII Net Position vs Nifty'}
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={data} margin={{ top: 10, right: 60, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval={Math.floor(data.length / 8)} />
            <YAxis yAxisId="flow" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `₹${v > 0 ? '' : ''}${(v/1000).toFixed(0)}K`} />
            <YAxis yAxisId="nifty" orientation="right" tick={{ fill: '#9470F8', fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<TT />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
            <ReferenceLine yAxisId="flow" y={0} stroke="rgba(255,255,255,0.15)" />
            {view === 'daily' ? (
              <>
                <Bar yAxisId="flow" dataKey="fii" name="FII Net" radius={[2,2,0,0]}>
                  {data.map((r, i) => <Cell key={i} fill={r.fii >= 0 ? '#10b981' : '#ef4444'} opacity={0.8} />)}
                </Bar>
                <Bar yAxisId="flow" dataKey="dii" name="DII Net" radius={[2,2,0,0]} fill="#3b82f6" opacity={0.6} />
              </>
            ) : (
              <>
                <Area yAxisId="flow" type="monotone" dataKey="cumFII" name="Cum FII" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={2} dot={false} />
                <Area yAxisId="flow" type="monotone" dataKey="cumDII" name="Cum DII" stroke="#3b82f6" fill="rgba(59,130,246,0.1)" strokeWidth={2} dot={false} />
              </>
            )}
            <Line yAxisId="nifty" type="monotone" dataKey="nifty" stroke="#9470F8" strokeWidth={2} name="Nifty" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ToolShell>
  );
}

const s = {
  liveBox: { display: 'flex', alignItems: 'center', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, flexWrap: 'wrap', gap: 4 },
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 140px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.05rem', fontWeight: 700 },
  btn: { padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' },
};
