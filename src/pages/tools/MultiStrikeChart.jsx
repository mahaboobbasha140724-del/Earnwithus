import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const EXPIRIES = ['24 Jul 2025', '31 Jul 2025', '28 Aug 2025'];
const COLORS = ['#9470F8', '#10b981', '#ef4444', '#fbbf24', '#3b82f6'];

function genStrikePremium(spot, strike, type) {
  let hour = 9; let min = 15;
  const data = [];
  const dist = Math.abs(strike - spot);
  let prem = Math.max(5, (type === 'CE' ? (spot > strike ? dist : 15) : (spot < strike ? dist : 15)) * (1 + Math.random()*0.1));
  for (let i = 0; i < 75; i++) {
    prem = Math.max(0.5, prem + (Math.random() - 0.51) * 4 - 0.1);
    const t = `${hour}:${String(min).padStart(2,'0')}`;
    data.push({ time: t, [`${type} ${strike}`]: parseFloat(prem.toFixed(2)) });
    min += 5; if (min >= 60) { min = 0; hour++; }
    if (hour >= 15 && min >= 30) break;
  }
  return data;
}

function mergeData(series) {
  if (!series.length) return [];
  const base = series[0].map((r, i) => ({ time: r.time }));
  series.forEach(s => s.forEach((r, i) => { if (base[i]) Object.assign(base[i], r); }));
  return base;
}

export default function MultiStrikeChart() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const [optType, setOptType] = useState('CE');
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const atm = Math.round(spot / 50) * 50;

  const defaultStrikes = [atm - 100, atm - 50, atm, atm + 50, atm + 100];
  const [selectedStrikes, setSelectedStrikes] = useState(defaultStrikes.slice(0, 3));

  const availableStrikes = Array.from({ length: 13 }, (_, i) => atm - 300 + i * 50);

  const toggleStrike = (k) => {
    setSelectedStrikes(prev =>
      prev.includes(k) ? prev.filter(s => s !== k) : prev.length < 5 ? [...prev, k] : prev
    );
  };

  const series = selectedStrikes.map(k => genStrikePremium(spot, k, optType));
  const chartData = mergeData(series);
  const lines = selectedStrikes.map((k, i) => `${optType} ${k}`);

  return (
    <ToolShell
      title="MultiStrike Chart"
      badge="OPTIONS LAB"
      description="Overlay premium charts for up to 5 strikes simultaneously — compare CE/PE premium movements"
      instrument={instrument}
      setInstrument={setInstrument}
      expiry={expiry}
      setExpiry={setExpiry}
      expiries={EXPIRIES}
    >
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Option Type:</div>
        {['CE','PE'].map(t => (
          <button key={t} onClick={() => setOptType(t)} style={{ ...s.btn, ...(optType === t ? (t === 'CE' ? s.btnRed : s.btnGreen) : {}) }}>{t}</button>
        ))}
      </div>

      {/* Strike Selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
          Select Strikes (max 5): {selectedStrikes.length} selected
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {availableStrikes.map(k => {
            const idx = selectedStrikes.indexOf(k);
            const isSelected = idx !== -1;
            return (
              <button
                key={k}
                onClick={() => toggleStrike(k)}
                style={{
                  ...s.strikeBtn,
                  ...(isSelected ? { background: COLORS[idx] + '30', borderColor: COLORS[idx], color: COLORS[idx] } : {}),
                  ...(k === atm ? s.atmStrike : {}),
                }}
              >
                {k.toLocaleString('en-IN')}{k === atm ? ' ★' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>
          {instrument} {optType} Premium — {expiry} — {selectedStrikes.length} Strikes
        </div>
        {selectedStrikes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Select at least 1 strike above to begin</div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval={9} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: '0.82rem' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.82rem' }} />
              {lines.map((line, i) => (
                <Line key={line} type="monotone" dataKey={line} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} name={line} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Table */}
      {selectedStrikes.length > 0 && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>{['Strike', 'Type', 'Open', 'Current', 'Change', 'Change%'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {selectedStrikes.map((k, i) => {
                const key = `${optType} ${k}`;
                const open = chartData[0]?.[key] || 0;
                const cur  = chartData[chartData.length-1]?.[key] || 0;
                const chg  = parseFloat((cur - open).toFixed(2));
                const chgPct = open > 0 ? parseFloat(((chg / open) * 100).toFixed(2)) : 0;
                return (
                  <tr key={k} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{k.toLocaleString('en-IN')}{k === atm ? ' ★' : ''}</td>
                    <td style={{ ...s.td, color: optType === 'CE' ? '#ef4444' : '#10b981', fontWeight: 700 }}>{optType}</td>
                    <td style={s.td}>₹{open.toFixed(2)}</td>
                    <td style={s.td}>₹{cur.toFixed(2)}</td>
                    <td style={{ ...s.td, color: chg >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{chg >= 0 ? '+' : ''}₹{chg}</td>
                    <td style={{ ...s.td, color: chgPct >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{chgPct >= 0 ? '+' : ''}{chgPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ToolShell>
  );
}

const s = {
  btn: { padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnRed: { background: 'rgba(239,68,68,0.15)', borderColor: '#ef4444', color: '#ef4444' },
  btnGreen: { background: 'rgba(16,185,129,0.15)', borderColor: '#10b981', color: '#10b981' },
  strikeBtn: { padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  atmStrike: { border: '1px solid rgba(148,112,248,0.3)', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 20 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 500 },
  th: { padding: '10px 14px', textAlign: 'center', fontSize: '0.73rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 14px', textAlign: 'center', fontSize: '0.85rem' },
};
