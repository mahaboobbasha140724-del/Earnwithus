import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, ComposedChart, Area
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const EXPIRIES = ['24 Jul 2025', '31 Jul 2025', '28 Aug 2025'];

function genStraddleData(spot) {
  let hour = 9; let min = 15;
  const data = [];
  let premium = spot * 0.018 + Math.random() * 50;
  for (let i = 0; i < 75; i++) {
    // Theta decay: premium generally decays, especially after 2PM
    const isAfternoon = hour >= 13;
    premium -= isAfternoon ? (Math.random() * 3 + 1) : (Math.random() * 1.5 + 0.3);
    premium += (Math.random() - 0.5) * 8;
    premium = Math.max(20, premium);
    const t = `${hour}:${String(min).padStart(2,'0')}`;
    const atm = Math.round(spot / 50) * 50;
    const callPrem = parseFloat((premium * 0.52).toFixed(2));
    const putPrem  = parseFloat((premium * 0.48).toFixed(2));
    data.push({ time: t, combined: parseFloat(premium.toFixed(2)), call: callPrem, put: putPrem });
    min += 5; if (min >= 60) { min = 0; hour++; }
    if (hour >= 15 && min >= 30) break;
  }
  return data;
}

function buildStraddleTable(spot) {
  const atm = Math.round(spot / 50) * 50;
  return [-100, -50, 0, 50, 100].map(offset => {
    const k = atm + offset;
    const callLTP = parseFloat((Math.max(5, (offset < 0 ? -offset : 15) * (1 + Math.random() * 0.1))).toFixed(2));
    const putLTP  = parseFloat((Math.max(5, (offset > 0 ? offset  : 15) * (1 + Math.random() * 0.1))).toFixed(2));
    const combined = parseFloat((callLTP + putLTP).toFixed(2));
    const iv = parseFloat((14 + Math.abs(offset) / 50 * 2 + Math.random()).toFixed(1));
    return { strike: k, callLTP, putLTP, combined, iv, isATM: offset === 0 };
  });
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>{p.name}: ₹{p.value}</div>)}
    </div>
  );
};

export default function StraddleChart() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const [view, setView] = useState('combined'); // combined | split
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const data = genStraddleData(spot);
  const table = buildStraddleTable(spot);

  const openPrem = data[0]?.combined || 0;
  const curPrem  = data[data.length-1]?.combined || 0;
  const decayAmt = parseFloat((openPrem - curPrem).toFixed(2));
  const decayPct = parseFloat(((decayAmt / openPrem) * 100).toFixed(1));
  const atm = Math.round(spot / 50) * 50;

  return (
    <ToolShell
      title="Straddle Chart"
      badge="OPTIONS LAB"
      description="ATM straddle premium decay chart — measures volatility compression through the session"
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
          { label: 'Open Premium', value: `₹${openPrem.toFixed(2)}`, color: '#fbbf24' },
          { label: 'Current Premium', value: `₹${curPrem.toFixed(2)}`, color: '#fff' },
          { label: 'Decay (₹)', value: `₹${decayAmt}`, color: '#10b981' },
          { label: 'Decay (%)', value: `${decayPct}%`, color: '#10b981' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['combined','split'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ ...s.btn, ...(view === v ? s.btnActive : {}) }}>
            {v === 'combined' ? '📈 Combined Premium' : '📊 CE + PE Split'}
          </button>
        ))}
      </div>

      {/* Straddle Chart */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.92rem' }}>
          {instrument} ATM {atm} Straddle — {expiry}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} interval={9} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<TT />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
            {view === 'combined' ? (
              <Area type="monotone" dataKey="combined" fill="rgba(148,112,248,0.1)" stroke="#9470F8" strokeWidth={2} name="Combined" dot={false} />
            ) : (
              <>
                <Line type="monotone" dataKey="call" stroke="#ef4444" strokeWidth={2} name="Call LTP" dot={false} />
                <Line type="monotone" dataKey="put"  stroke="#10b981" strokeWidth={2} name="Put LTP" dot={false} />
              </>
            )}
            <ReferenceLine y={openPrem * 0.9} stroke="#fbbf24" strokeDasharray="4 3" label={{ value: '-10%', fill: '#fbbf24', fontSize: 10 }} />
            <ReferenceLine y={openPrem * 0.8} stroke="#ef4444" strokeDasharray="4 3" label={{ value: '-20%', fill: '#ef4444', fontSize: 10 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Strike Table */}
      <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12, fontSize: '0.92rem' }}>Strike-wise Straddle Premium</div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Strike', 'Call LTP', 'Put LTP', 'Combined', 'ATM IV%'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map(row => (
              <tr key={row.strike} style={{ ...s.tr, background: row.isATM ? 'rgba(148,112,248,0.08)' : 'transparent' }}>
                <td style={{ ...s.td, fontWeight: 700, color: row.isATM ? '#c4b5fd' : '#e2e8f0' }}>
                  {row.strike.toLocaleString('en-IN')}{row.isATM && <span style={s.atmTag}>ATM</span>}
                </td>
                <td style={{ ...s.td, color: '#ef4444' }}>₹{row.callLTP}</td>
                <td style={{ ...s.td, color: '#10b981' }}>₹{row.putLTP}</td>
                <td style={{ ...s.td, color: '#fbbf24', fontWeight: 700 }}>₹{row.combined}</td>
                <td style={{ ...s.td, color: '#94a3b8' }}>{row.iv}%</td>
              </tr>
            ))}
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
  statValue: { fontSize: '1.15rem', fontWeight: 700 },
  btn: { padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 500 },
  th: { padding: '10px 14px', textAlign: 'center', fontSize: '0.73rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 14px', textAlign: 'center', fontSize: '0.85rem' },
  atmTag: { display: 'inline-block', marginLeft: 6, padding: '1px 5px', borderRadius: 4, background: 'rgba(148,112,248,0.3)', color: '#c4b5fd', fontSize: '0.62rem', fontWeight: 700 },
};
