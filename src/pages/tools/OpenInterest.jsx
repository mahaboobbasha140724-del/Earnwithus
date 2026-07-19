import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LineChart, Line, Legend
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const EXPIRIES = ['24 Jul 2025', '31 Jul 2025', '28 Aug 2025'];

function buildOIData(spot, symbol) {
  const atm = Math.round(spot / 50) * 50;
  return Array.from({ length: 15 }, (_, i) => {
    const strike = atm - 350 + i * 50;
    const dist = Math.abs(strike - spot) / spot;
    const callOI = Math.floor((strike > spot ? 40000 + i * 9000 : 90000 - i * 4000) * (1 + Math.random() * 0.25));
    const putOI  = Math.floor((strike < spot ? 40000 + (14-i) * 9000 : 90000 - (14-i) * 4000) * (1 + Math.random() * 0.25));
    const callChg = Math.floor((Math.random() - 0.4) * 18000);
    const putChg  = Math.floor((Math.random() - 0.4) * 18000);
    return { strike, callOI, putOI, callChg, putChg, isATM: strike === atm };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>Strike: {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: {(p.value / 1000).toFixed(0)}K
        </div>
      ))}
    </div>
  );
};

export default function OpenInterest() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const [view, setView] = useState('absolute'); // absolute | change
  const [range, setRange] = useState('all'); // all | 5 | 10
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  let data = buildOIData(spot, instrument);

  const atm = Math.round(spot / 50) * 50;
  if (range === '5') data = data.filter(r => Math.abs(r.strike - atm) <= 250);
  if (range === '10') data = data.filter(r => Math.abs(r.strike - atm) <= 500);

  const totalCallOI = data.reduce((a, r) => a + r.callOI, 0);
  const totalPutOI  = data.reduce((a, r) => a + r.putOI, 0);
  const pcr = (totalPutOI / totalCallOI).toFixed(2);

  const sentiment = pcr > 1.2 ? 'Bullish' : pcr < 0.8 ? 'Bearish' : 'Neutral';
  const sentColor = sentiment === 'Bullish' ? '#10b981' : sentiment === 'Bearish' ? '#ef4444' : '#fbbf24';

  const chartData = data.map(r => ({
    strike: r.strike,
    'Call OI':  view === 'absolute' ? r.callOI : r.callChg,
    'Put OI':   view === 'absolute' ? r.putOI  : r.putChg,
  }));

  return (
    <ToolShell
      title="Open Interest Analysis"
      badge="OPTIONS LAB"
      description="CE vs PE Open Interest distribution across strikes — identifies support/resistance levels"
      instrument={instrument}
      setInstrument={setInstrument}
      expiry={expiry}
      setExpiry={setExpiry}
      expiries={EXPIRIES}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Call OI', value: `${(totalCallOI/1e6).toFixed(2)}M`, color: '#ef4444' },
          { label: 'Total Put OI',  value: `${(totalPutOI/1e6).toFixed(2)}M`,  color: '#10b981' },
          { label: 'PCR', value: pcr, color: pcr > 1 ? '#10b981' : '#ef4444' },
          { label: 'Sentiment', value: sentiment, color: sentColor },
          { label: 'Spot', value: `₹${spot.toLocaleString('en-IN')}`, color: '#c4b5fd' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['absolute','change'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ ...s.btn, ...(view === v ? s.btnActive : {}) }}>
            {v === 'absolute' ? 'OI Absolute' : 'OI Change'}
          </button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {['all','5','10'].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{ ...s.btn, ...(range === r ? s.btnActive : {}) }}>
            {r === 'all' ? 'All Strikes' : `±${r} Strikes`}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={s.chartBox}>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="strike" tick={{ fill: '#64748b', fontSize: 11 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem', paddingTop: 12 }} />
            <ReferenceLine x={atm} stroke="#9470F8" strokeDasharray="4 4" label={{ value: 'ATM', fill: '#9470F8', fontSize: 11 }} />
            <Bar dataKey="Call OI" fill="#ef4444" radius={[3,3,0,0]} opacity={0.85} />
            <Bar dataKey="Put OI"  fill="#10b981" radius={[3,3,0,0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* OI Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Strike', 'Call OI', 'Call OI Δ', 'Put OI', 'Put OI Δ', 'PCR'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const rowPCR = row.callOI > 0 ? (row.putOI / row.callOI).toFixed(2) : '—';
              return (
                <tr key={row.strike} style={{ ...s.tr, background: row.isATM ? 'rgba(148,112,248,0.07)' : 'transparent' }}>
                  <td style={{ ...s.td, fontWeight: 700, color: row.isATM ? '#c4b5fd' : '#e2e8f0' }}>
                    {row.strike.toLocaleString('en-IN')}{row.isATM && <span style={s.atmTag}>ATM</span>}
                  </td>
                  <td style={{ ...s.td, color: '#ef4444' }}>{(row.callOI/1000).toFixed(0)}K</td>
                  <td style={{ ...s.td, color: row.callChg >= 0 ? '#10b981' : '#ef4444' }}>
                    {row.callChg >= 0 ? '+' : ''}{(row.callChg/1000).toFixed(0)}K
                  </td>
                  <td style={{ ...s.td, color: '#10b981' }}>{(row.putOI/1000).toFixed(0)}K</td>
                  <td style={{ ...s.td, color: row.putChg >= 0 ? '#10b981' : '#ef4444' }}>
                    {row.putChg >= 0 ? '+' : ''}{(row.putChg/1000).toFixed(0)}K
                  </td>
                  <td style={{ ...s.td, color: rowPCR > 1 ? '#10b981' : '#ef4444' }}>{rowPCR}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ToolShell>
  );
}

const s = {
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 120px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.25rem', fontWeight: 700 },
  btn: { padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
  th: { padding: '10px 16px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 16px', textAlign: 'center', fontSize: '0.85rem' },
  atmTag: { display: 'inline-block', marginLeft: 6, padding: '1px 5px', borderRadius: 4, background: 'rgba(148,112,248,0.3)', color: '#c4b5fd', fontSize: '0.62rem', fontWeight: 700 },
};
