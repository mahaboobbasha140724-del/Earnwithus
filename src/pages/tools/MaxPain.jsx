import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const EXPIRIES = ['24 Jul 2025', '31 Jul 2025', '28 Aug 2025'];

function calcMaxPainData(spot) {
  const atm = Math.round(spot / 50) * 50;
  const strikes = Array.from({ length: 15 }, (_, i) => atm - 350 + i * 50);
  const chain = strikes.map(k => {
    const dist = Math.abs(k - spot) / spot;
    const callOI = Math.floor((k > spot ? 40000 + (k - atm)/50 * 8000 : 90000 - (atm - k)/50 * 3500) * (1 + Math.random() * 0.2));
    const putOI  = Math.floor((k < spot ? 40000 + (atm - k)/50 * 8000 : 90000 - (k - atm)/50 * 3500) * (1 + Math.random() * 0.2));
    return { strike: k, callOI: Math.max(5000, callOI), putOI: Math.max(5000, putOI) };
  });

  // Calculate total pain at each strike
  const rows = strikes.map(target => {
    const pain = chain.reduce((acc, row) => {
      const callPain = Math.max(0, row.strike - target) * row.callOI;
      const putPain  = Math.max(0, target - row.strike) * row.putOI;
      return acc + callPain + putPain;
    }, 0);
    return { strike: target, pain: Math.round(pain / 1e8) };
  });

  const maxPainStrike = rows.reduce((min, r) => r.pain < min.pain ? r : min, rows[0]).strike;
  return { rows, maxPainStrike, chain };
}

function genHistoricalMaxPain(spot) {
  const dates = ['Jul 17', 'Jul 10', 'Jul 3', 'Jun 26', 'Jun 19', 'Jun 12', 'Jun 5', 'May 29', 'May 22', 'May 15'];
  const atm = Math.round(spot / 50) * 50;
  return dates.map((d, i) => ({
    date: d,
    maxPain: atm + (Math.floor(Math.random() * 7) - 3) * 50,
    spot: spot - i * 30 + (Math.random() - 0.5) * 60,
    expiry: ['24 Jul', '24 Jul', '27 Jun', '27 Jun', '27 Jun', '29 May', '29 May', '29 May', '29 Apr', '29 Apr'][i],
  }));
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>Strike: {label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function MaxPain() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];

  const { rows, maxPainStrike, chain } = calcMaxPainData(spot);
  const historical = genHistoricalMaxPain(spot);
  const distFromMP = Math.abs(spot - maxPainStrike);
  const distPct = ((distFromMP / spot) * 100).toFixed(2);

  return (
    <ToolShell
      title="Max Pain Calculator"
      badge="OPTIONS LAB"
      description="Calculates the strike where maximum options expire worthless — often acts as a magnet for expiry"
      instrument={instrument}
      setInstrument={setInstrument}
      expiry={expiry}
      setExpiry={setExpiry}
      expiries={EXPIRIES}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Spot Price', value: `₹${spot.toLocaleString('en-IN')}`, color: '#fff' },
          { label: 'Max Pain Strike', value: maxPainStrike.toLocaleString('en-IN'), color: '#fbbf24' },
          { label: 'Distance', value: `₹${distFromMP}`, color: distFromMP > 200 ? '#ef4444' : '#10b981' },
          { label: 'Distance %', value: `${distPct}%`, color: distFromMP > 200 ? '#ef4444' : '#10b981' },
          { label: 'Bias', value: spot > maxPainStrike ? 'Bearish Pull' : 'Bullish Pull', color: spot > maxPainStrike ? '#ef4444' : '#10b981' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Max Pain Theory Info */}
      <div style={s.infoBox}>
        <span style={{ color: '#fbbf24', fontWeight: 700 }}>⚠ Max Pain Theory: </span>
        <span style={{ color: '#94a3b8', fontSize: '0.87rem' }}>
          The Max Pain strike is where the total dollar loss for all options holders is maximized — meaning market makers gain the most. 
          As expiry approaches, the spot price tends to gravitate toward this level. Current Max Pain: <strong style={{ color: '#fbbf24' }}>{maxPainStrike.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {/* Pain Chart */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>Options Pain by Strike (Lower = Max Pain Strike)</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="strike" tick={{ fill: '#64748b', fontSize: 11 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Pain (Crore)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
            <Tooltip content={<TT />} />
            <ReferenceLine x={spot} stroke="#9470F8" strokeDasharray="4 3" label={{ value: 'Spot', fill: '#9470F8', fontSize: 11 }} />
            <ReferenceLine x={maxPainStrike} stroke="#fbbf24" strokeWidth={2} label={{ value: 'Max Pain', fill: '#fbbf24', fontSize: 11 }} />
            <Bar dataKey="pain" name="Pain" radius={[4,4,0,0]}>
              {rows.map((r, i) => (
                <Cell key={i} fill={r.strike === maxPainStrike ? '#fbbf24' : r.strike === Math.round(spot/50)*50 ? '#9470F8' : 'rgba(148,163,184,0.4)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Table */}
      <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12, fontSize: '0.9rem' }}>Historical Max Pain (Last 10 Expiries)</div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Date', 'Expiry', 'Max Pain', 'Spot at Expiry', 'Distance'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {historical.map((row, i) => {
              const dist = Math.abs(Math.round(row.spot) - row.maxPain);
              return (
                <tr key={i} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#e2e8f0' }}>{row.date}</td>
                  <td style={{ ...s.td, color: '#9470F8' }}>{row.expiry}</td>
                  <td style={{ ...s.td, color: '#fbbf24', fontWeight: 700 }}>{row.maxPain.toLocaleString('en-IN')}</td>
                  <td style={{ ...s.td, color: '#94a3b8' }}>{Math.round(row.spot).toLocaleString('en-IN')}</td>
                  <td style={{ ...s.td, color: dist < 100 ? '#10b981' : dist < 300 ? '#fbbf24' : '#ef4444' }}>{dist}</td>
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
  statValue: { fontSize: '1.15rem', fontWeight: 700 },
  infoBox: { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10, padding: '14px 18px', marginBottom: 24 },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 500 },
  th: { padding: '10px 14px', textAlign: 'center', fontSize: '0.73rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 14px', textAlign: 'center', fontSize: '0.85rem' },
};
