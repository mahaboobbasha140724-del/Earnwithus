import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, BarChart, Bar, ComposedChart
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

function genIVData() {
  const data = [];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  for (let i = 0; i < 52; i++) {
    const week = Math.floor(i / 4.33);
    const iv = parseFloat((14 + Math.sin(i * 0.3) * 5 + Math.random() * 3).toFixed(1));
    const hv = parseFloat((12 + Math.sin(i * 0.25) * 4 + Math.random() * 2).toFixed(1));
    data.push({ week: `${months[week % 7]}W${(i%4)+1}`, iv, hv, ivp: Math.min(100, Math.floor((iv / 25) * 100)), spread: parseFloat((iv - hv).toFixed(1)) });
  }
  return data;
}

function buildVegaTable(spot) {
  const atm = Math.round(spot / 50) * 50;
  return [-150, -100, -50, 0, 50, 100, 150].map(offset => {
    const k = atm + offset;
    const dist = Math.abs(offset) / spot;
    const callVega = parseFloat(Math.max(0.01, (0.15 - dist * 20) * (1 + Math.random() * 0.1)).toFixed(3));
    const putVega  = parseFloat(Math.max(0.01, (0.14 - dist * 20) * (1 + Math.random() * 0.1)).toFixed(3));
    const callIV   = parseFloat((14 + dist * 120 + Math.random()).toFixed(1));
    const putIV    = parseFloat((13.5 + dist * 110 + Math.random()).toFixed(1));
    return { strike: k, callVega, putVega, callIV, putIV, isATM: offset === 0 };
  });
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {p.value}%</div>)}
    </div>
  );
};

export default function IVAnalysis() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [tab, setTab] = useState('ivhv');
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const data = genIVData();
  const vegaTable = buildVegaTable(spot);

  const latestIV  = data[data.length-1]?.iv || 0;
  const latestHV  = data[data.length-1]?.hv || 0;
  const latestIVP = data[data.length-1]?.ivp || 0;

  const ivSignal = latestIV > latestHV * 1.15 ? 'Overpriced Options' : latestIV < latestHV * 0.85 ? 'Underpriced Options' : 'Fairly Priced';
  const ivColor  = latestIV > latestHV * 1.15 ? '#fbbf24' : latestIV < latestHV * 0.85 ? '#10b981' : '#94a3b8';

  return (
    <ToolShell
      title="IV / HV Analysis"
      badge="OPTIONS LAB"
      description="Compare Implied Volatility vs Historical Volatility, IV Percentile, Vega sensitivity across strikes"
      instrument={instrument}
      setInstrument={setInstrument}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Current IV', value: `${latestIV}%`, color: '#fbbf24' },
          { label: 'Historical Vol', value: `${latestHV}%`, color: '#94a3b8' },
          { label: 'IV-HV Spread', value: `${(latestIV - latestHV).toFixed(1)}%`, color: latestIV > latestHV ? '#fbbf24' : '#10b981' },
          { label: 'IV Percentile', value: `${latestIVP}%`, color: latestIVP > 70 ? '#ef4444' : latestIVP < 30 ? '#10b981' : '#fbbf24' },
          { label: 'Signal', value: ivSignal, color: ivColor },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* IVP Gauge */}
      <div style={s.gaugeWrap}>
        <div style={s.gaugeLabel}>IV Percentile (IVP) — {latestIVP}% of last year IV was below current IV</div>
        <div style={s.track}>
          <div style={{ ...s.fill, width: `${latestIVP}%`, background: latestIVP > 70 ? '#ef4444' : latestIVP > 40 ? '#fbbf24' : '#10b981' }} />
        </div>
        <div style={s.ticks}>
          <span style={{ color: '#10b981' }}>0 (Low Vol)</span>
          <span style={{ color: '#fbbf24' }}>50</span>
          <span style={{ color: '#ef4444' }}>100 (High Vol)</span>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['ivhv','IV vs HV'],['ivp','IV Percentile'],['vega','Vega Analysis']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.btn, ...(tab === t ? s.btnActive : {}) }}>{l}</button>
        ))}
      </div>

      {tab === 'ivhv' && (
        <div style={s.chartBox}>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
              <Line type="monotone" dataKey="iv" stroke="#fbbf24" strokeWidth={2} name="IV" dot={false} />
              <Line type="monotone" dataKey="hv" stroke="#64748b" strokeWidth={2} name="HV" dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'ivp' && (
        <div style={s.chartBox}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<TT />} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'High', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 3" label={{ value: 'Low', fill: '#10b981', fontSize: 10 }} />
              <Bar dataKey="ivp" name="IVP" fill="#9470F8" opacity={0.7} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'vega' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Strike', 'Call IV%', 'Call Vega', 'Put IV%', 'Put Vega'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {vegaTable.map(row => (
                <tr key={row.strike} style={{ ...s.tr, background: row.isATM ? 'rgba(148,112,248,0.07)' : 'transparent' }}>
                  <td style={{ ...s.td, fontWeight: 700, color: row.isATM ? '#c4b5fd' : '#e2e8f0' }}>
                    {row.strike.toLocaleString('en-IN')}{row.isATM && <span style={s.tag}>ATM</span>}
                  </td>
                  <td style={{ ...s.td, color: '#fbbf24' }}>{row.callIV}%</td>
                  <td style={{ ...s.td, color: '#ef4444', fontWeight: 600 }}>{row.callVega}</td>
                  <td style={{ ...s.td, color: '#fbbf24' }}>{row.putIV}%</td>
                  <td style={{ ...s.td, color: '#10b981', fontWeight: 600 }}>{row.putVega}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolShell>
  );
}

const s = {
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 120px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.1rem', fontWeight: 700 },
  gaugeWrap: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 24px', marginBottom: 20 },
  gaugeLabel: { fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10 },
  track: { height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  fill: { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' },
  ticks: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' },
  btn: { padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 500 },
  th: { padding: '10px 14px', textAlign: 'center', fontSize: '0.73rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 14px', textAlign: 'center', fontSize: '0.85rem' },
  tag: { display: 'inline-block', marginLeft: 6, padding: '1px 5px', borderRadius: 4, background: 'rgba(148,112,248,0.3)', color: '#c4b5fd', fontSize: '0.62rem', fontWeight: 700 },
};
