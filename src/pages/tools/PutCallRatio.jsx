import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart, ComposedChart, Bar, BarChart
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

// Generate intraday PCR time series
function genIntradayPCR(spot) {
  const times = [];
  let hour = 9; let min = 15; let pcr = 0.9 + Math.random() * 0.3; let fut = spot;
  for (let i = 0; i < 75; i++) {
    pcr += (Math.random() - 0.48) * 0.04;
    pcr = Math.max(0.5, Math.min(2.0, pcr));
    fut += (Math.random() - 0.49) * 30;
    const t = `${hour}:${String(min).padStart(2,'0')}`;
    times.push({ time: t, pcr: parseFloat(pcr.toFixed(2)), future: Math.round(fut) });
    min += 5; if (min >= 60) { min = 0; hour++; }
  }
  return times;
}

// Generate 365-day historical PCR
function genHistoricalPCR() {
  const data = []; let pcr = 1.0; let price = 22000;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for (let i = 0; i < 52; i++) {
    pcr += (Math.random() - 0.5) * 0.12;
    pcr = Math.max(0.5, Math.min(2.2, pcr));
    price += (Math.random() - 0.48) * 200;
    const week = Math.floor(i / 4.33);
    data.push({ week: `${months[week % 12]}W${(i % 4) + 1}`, pcr: parseFloat(pcr.toFixed(2)), nifty: Math.round(price) });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: {p.dataKey === 'pcr' ? p.value : `₹${p.value?.toLocaleString('en-IN')}`}
        </div>
      ))}
    </div>
  );
};

export default function PutCallRatio() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [tab, setTab] = useState('intraday');
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];

  const intraday = genIntradayPCR(spot);
  const historical = genHistoricalPCR();
  const data = tab === 'intraday' ? intraday : historical;

  const latestPCR = intraday[intraday.length - 1]?.pcr || 1.0;
  const sentiment = latestPCR > 1.3 ? 'Extremely Bullish' : latestPCR > 1.0 ? 'Bullish' : latestPCR > 0.8 ? 'Neutral' : latestPCR > 0.7 ? 'Bearish' : 'Extremely Bearish';
  const sentColor = latestPCR > 1.0 ? '#10b981' : latestPCR < 0.8 ? '#ef4444' : '#fbbf24';

  return (
    <ToolShell
      title="Put-Call Ratio (PCR)"
      badge="OPTIONS LAB"
      description="Intraday PCR chart with Futures price overlay and 365-day historical PCR trend"
      instrument={instrument}
      setInstrument={setInstrument}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Current PCR', value: latestPCR.toFixed(2), color: sentColor },
          { label: 'Signal', value: sentiment, color: sentColor },
          { label: 'Spot', value: `₹${spot.toLocaleString('en-IN')}`, color: '#c4b5fd' },
          { label: 'Oversold Zone', value: '< 0.7', color: '#ef4444' },
          { label: 'Overbought Zone', value: '> 1.3', color: '#10b981' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* PCR Gauge */}
      <div style={s.gaugeWrap}>
        <div style={s.gaugeLabel}>PCR Level</div>
        <div style={s.gaugeTrack}>
          <div style={{ ...s.gaugeFill, width: `${Math.min(100, (latestPCR / 2) * 100)}%`, background: sentColor }} />
        </div>
        <div style={s.gaugeTicks}>
          <span>0</span><span style={{ color: '#ef4444' }}>0.7 Bearish</span><span style={{ color: '#fbbf24' }}>1.0 Neutral</span><span style={{ color: '#10b981' }}>1.3 Bullish</span><span>2.0</span>
        </div>
      </div>

      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['intraday','historical'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.btn, ...(tab === t ? s.btnActive : {}) }}>
            {t === 'intraday' ? '📊 Intraday' : '📅 365-Day Trend'}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={s.chartBox}>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={tab === 'intraday' ? 'time' : 'week'} tick={{ fill: '#64748b', fontSize: 11 }} interval={tab === 'intraday' ? 9 : 3} />
            <YAxis yAxisId="pcr" domain={[0.4, 2.1]} tick={{ fill: '#10b981', fontSize: 11 }} label={{ value: 'PCR', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 11 }} />
            <YAxis yAxisId="fut" orientation="right" tick={{ fill: '#9470F8', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem', paddingTop: 12 }} />
            <ReferenceLine yAxisId="pcr" y={1.3} stroke="#10b981" strokeDasharray="4 3" label={{ value: 'Overbought', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine yAxisId="pcr" y={0.7} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'Oversold', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine yAxisId="pcr" y={1.0} stroke="#fbbf24" strokeDasharray="2 2" />
            <Area yAxisId="pcr" type="monotone" dataKey="pcr" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth={2} name="PCR" dot={false} />
            <Line yAxisId="fut" type="monotone" dataKey={tab === 'intraday' ? 'future' : 'nifty'} stroke="#9470F8" strokeWidth={1.5} name="Futures" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div style={s.interpGrid}>
        {[
          { range: 'PCR > 1.3', signal: 'Bullish — Excessive Put buying, contrarian buy signal', color: '#10b981' },
          { range: 'PCR 1.0–1.3', signal: 'Mildly Bullish — Balanced, slight Put dominance', color: '#6ee7b7' },
          { range: 'PCR 0.8–1.0', signal: 'Neutral — Market balanced', color: '#fbbf24' },
          { range: 'PCR < 0.7', signal: 'Bearish — Excessive Call buying, contrarian sell signal', color: '#ef4444' },
        ].map(r => (
          <div key={r.range} style={{ ...s.interpCard, borderLeftColor: r.color }}>
            <div style={{ color: r.color, fontWeight: 700, fontSize: '0.85rem' }}>{r.range}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 4 }}>{r.signal}</div>
          </div>
        ))}
      </div>
    </ToolShell>
  );
}

const s = {
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 120px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.2rem', fontWeight: 700 },
  gaugeWrap: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 24px', marginBottom: 20 },
  gaugeLabel: { fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 },
  gaugeTrack: { height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  gaugeFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
  gaugeTicks: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' },
  btn: { padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  interpGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 },
  interpCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid', borderRadius: 8, padding: '12px 16px' },
};
