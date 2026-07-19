import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

// ─── helpers ───────────────────────────────────────────────────────────────────
function buildOptionChain(spot, symbol) {
  const atm = Math.round(spot / 50) * 50;
  const strikes = Array.from({ length: 13 }, (_, i) => atm - 300 + i * 50);
  const iv_base = symbol === 'BANKNIFTY' ? 18 : 14;
  let rows = strikes.map((k, idx) => {
    const dist = (k - spot) / spot;
    const callIV = parseFloat((iv_base + Math.abs(dist) * 180 + Math.random() * 2).toFixed(1));
    const putIV  = parseFloat((iv_base + Math.abs(dist) * 170 + Math.random() * 2).toFixed(1));
    const moneyness = k - spot;
    const callLTP = parseFloat(Math.max(0.05, (moneyness < 0 ? -moneyness + 5 : 5) * (1 + Math.random() * 0.1)).toFixed(2));
    const putLTP  = parseFloat(Math.max(0.05, (moneyness > 0 ? moneyness + 5 : 5) * (1 + Math.random() * 0.1)).toFixed(2));
    const callOI  = Math.floor((moneyness < 0 ? 90000 - idx * 5000 : 40000 + idx * 8000) * (1 + Math.random() * 0.2));
    const putOI   = Math.floor((moneyness > 0 ? 90000 - (12 - idx) * 5000 : 40000 + (12 - idx) * 8000) * (1 + Math.random() * 0.2));
    const callOIChg = Math.floor((Math.random() - 0.4) * 15000);
    const putOIChg  = Math.floor((Math.random() - 0.4) * 15000);
    const isATM = k === atm;
    let buildup = 'Neutral';
    if (callOIChg > 5000 && spot > k) buildup = 'Long Buildup';
    else if (callOIChg < -5000) buildup = 'Short Covering';
    else if (putOIChg > 5000 && spot < k) buildup = 'Short Buildup';
    else if (putOIChg < -5000) buildup = 'Long Unwinding';
    return { strike: k, callIV, putIV, callLTP, putLTP, callOI, putOI, callOIChg, putOIChg, isATM, buildup };
  });
  return rows;
}

function calcMaxPain(chain) {
  let minPain = Infinity, maxPainStrike = chain[0]?.strike;
  chain.forEach(row => {
    const pain = chain.reduce((acc, r) => {
      const callPain = Math.max(0, r.strike - row.strike) * r.callOI;
      const putPain  = Math.max(0, row.strike - r.strike) * r.putOI;
      return acc + callPain + putPain;
    }, 0);
    if (pain < minPain) { minPain = pain; maxPainStrike = row.strike; }
  });
  return maxPainStrike;
}

const BADGE_COLORS = {
  'Long Buildup':   { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '⬆ Long Buildup' },
  'Short Buildup':  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: '⬇ Short Buildup' },
  'Short Covering': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: '↩ Short Covering' },
  'Long Unwinding': { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: '↪ Long Unwinding' },
  'Neutral':        { bg: 'transparent',            color: '#475569', label: '— Neutral' },
};

const EXPIRIES = ['24 Jul 2025', '31 Jul 2025', '28 Aug 2025', '25 Sep 2025'];

export default function OptionChain() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const [filter, setFilter] = useState('all');
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const liveSpot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const chain = buildOptionChain(liveSpot, instrument);
  const maxPainStrike = calcMaxPain(chain);
  const totalCallOI = chain.reduce((a, r) => a + r.callOI, 0);
  const totalPutOI  = chain.reduce((a, r) => a + r.putOI, 0);
  const pcr = (totalPutOI / totalCallOI).toFixed(2);

  const filtered = filter === 'all' ? chain :
    filter === 'itm-call' ? chain.filter(r => r.strike < liveSpot) :
    chain.filter(r => r.strike > liveSpot);

  const fmtOI = n => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(0)+'K' : n;

  return (
    <ToolShell
      title="Option Chain"
      badge="OPTIONS LAB"
      description="Live NSE option chain with Open Interest, IV, buildup signals and Max Pain marker"
      instrument={instrument}
      setInstrument={setInstrument}
      expiry={expiry}
      setExpiry={setExpiry}
      expiries={EXPIRIES}
    >
      {/* Stats Row */}
      <div style={s.statsRow}>
        {[
          { label: 'Spot Price', value: `₹${liveSpot.toLocaleString('en-IN')}` },
          { label: 'PCR (OI)', value: pcr, color: pcr > 1 ? '#10b981' : '#ef4444' },
          { label: 'Max Pain', value: maxPainStrike.toLocaleString('en-IN'), color: '#fbbf24' },
          { label: 'Total Call OI', value: fmtOI(totalCallOI), color: '#ef4444' },
          { label: 'Total Put OI',  value: fmtOI(totalPutOI),  color: '#10b981' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color || '#fff' }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all','itm-call','itm-put'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            ...s.filterBtn,
            ...(filter === f ? s.filterBtnActive : {}),
          }}>
            {f === 'all' ? 'All Strikes' : f === 'itm-call' ? 'ITM Calls' : 'ITM Puts'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Call OI</th>
              <th style={s.th}>OI Chg</th>
              <th style={s.th}>IV%</th>
              <th style={s.th}>Call LTP</th>
              <th style={{ ...s.th, background: 'rgba(148,112,248,0.08)', color: '#c4b5fd', fontSize: '0.95rem' }}>STRIKE</th>
              <th style={s.th}>Put LTP</th>
              <th style={s.th}>IV%</th>
              <th style={s.th}>OI Chg</th>
              <th style={s.th}>Put OI</th>
              <th style={s.th}>Buildup</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const bd = BADGE_COLORS[row.buildup] || BADGE_COLORS['Neutral'];
              const isATM = row.strike === Math.round(liveSpot / 50) * 50;
              const isMaxPain = row.strike === maxPainStrike;
              return (
                <tr key={row.strike} style={{
                  ...s.tr,
                  background: isATM ? 'rgba(148,112,248,0.08)' : isMaxPain ? 'rgba(251,191,36,0.05)' : 'transparent',
                  borderLeft: isATM ? '2px solid #9470F8' : isMaxPain ? '2px solid #fbbf24' : '2px solid transparent',
                }}>
                  <td style={{ ...s.td, color: '#94a3b8' }}>{fmtOI(row.callOI)}</td>
                  <td style={{ ...s.td, color: row.callOIChg >= 0 ? '#10b981' : '#ef4444' }}>
                    {row.callOIChg >= 0 ? '+' : ''}{fmtOI(row.callOIChg)}
                  </td>
                  <td style={{ ...s.td, color: '#fbbf24' }}>{row.callIV}%</td>
                  <td style={{ ...s.td, color: '#e2e8f0', fontWeight: 600 }}>{row.callLTP}</td>
                  <td style={{ ...s.tdStrike }}>
                    {row.strike.toLocaleString('en-IN')}
                    {isATM && <span style={s.atmBadge}>ATM</span>}
                    {isMaxPain && <span style={s.mpBadge}>MP</span>}
                  </td>
                  <td style={{ ...s.td, color: '#e2e8f0', fontWeight: 600 }}>{row.putLTP}</td>
                  <td style={{ ...s.td, color: '#fbbf24' }}>{row.putIV}%</td>
                  <td style={{ ...s.td, color: row.putOIChg >= 0 ? '#10b981' : '#ef4444' }}>
                    {row.putOIChg >= 0 ? '+' : ''}{fmtOI(row.putOIChg)}
                  </td>
                  <td style={{ ...s.td, color: '#94a3b8' }}>{fmtOI(row.putOI)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.builtBadge, background: bd.bg, color: bd.color }}>
                      {bd.label}
                    </span>
                  </td>
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
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: '12px 20px',
    flex: '1 1 120px',
  },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.25rem', fontWeight: 700 },
  filterBtn: {
    padding: '6px 14px', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)', color: '#94a3b8',
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  filterBtnActive: {
    background: 'rgba(148,112,248,0.15)',
    borderColor: '#9470F8', color: '#c4b5fd',
  },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  thead: { background: 'rgba(255,255,255,0.04)' },
  th: {
    padding: '10px 12px', textAlign: 'center', fontSize: '0.75rem',
    color: '#64748b', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tr: { transition: '0.15s', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 12px', textAlign: 'center', fontSize: '0.85rem' },
  tdStrike: {
    padding: '9px 12px', textAlign: 'center', fontSize: '0.92rem',
    fontWeight: 800, color: '#e2e8f0',
    background: 'rgba(148,112,248,0.04)',
  },
  atmBadge: {
    display: 'inline-block', marginLeft: 6, padding: '1px 5px',
    borderRadius: 4, background: 'rgba(148,112,248,0.3)',
    color: '#c4b5fd', fontSize: '0.62rem', fontWeight: 700,
  },
  mpBadge: {
    display: 'inline-block', marginLeft: 6, padding: '1px 5px',
    borderRadius: 4, background: 'rgba(251,191,36,0.25)',
    color: '#fbbf24', fontSize: '0.62rem', fontWeight: 700,
  },
  builtBadge: {
    display: 'inline-block', padding: '2px 8px',
    borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap',
  },
};
