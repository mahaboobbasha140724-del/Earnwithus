import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LineChart, Line, ComposedChart, Cell
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

function genTableData(spot) {
  let hour = 9; let min = 15; let callOI = 1800000; let putOI = 1900000; let fut = spot;
  const rows = [];
  for (let i = 0; i < 25; i++) {
    const callChg = Math.floor((Math.random() - 0.45) * 60000);
    const putChg  = Math.floor((Math.random() - 0.45) * 60000);
    callOI += callChg; putOI += putChg;
    const diff = putChg - callChg;
    fut += (Math.random() - 0.49) * 25;
    const t = `${hour}:${String(min).padStart(2,'0')}`;
    rows.push({
      time: t,
      callChg,
      putChg,
      diff,
      pcr: parseFloat((putOI / callOI).toFixed(2)),
      future: Math.round(fut),
    });
    min += 15; if (min >= 60) { min = 0; hour++; }
    if (hour >= 15 && min >= 30) break;
  }
  return rows;
}

const DiffBar = ({ value }) => {
  const w = Math.min(100, Math.abs(value) / 600);
  const color = value >= 0 ? '#10b981' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ color, fontSize: '0.78rem', fontWeight: 600, minWidth: 50, textAlign: 'right' }}>
        {value >= 0 ? '+' : ''}{(value / 1000).toFixed(0)}K
      </span>
    </div>
  );
};

const Tooltip2 = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {typeof p.value === 'number' ? (Math.abs(p.value) > 1000 ? `${(p.value/1000).toFixed(0)}K` : p.value) : p.value}</div>)}
    </div>
  );
};

export default function PECEDifference() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [interval, setInterval2] = useState('15m');
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const data = genTableData(spot);

  const latestDiff = data[data.length - 1]?.diff || 0;
  const totalPutChg = data.reduce((a, r) => a + r.putChg, 0);
  const totalCallChg = data.reduce((a, r) => a + r.callChg, 0);

  return (
    <ToolShell
      title="PE-CE OI Difference"
      badge="OPTIONS LAB"
      description="Time-stamped table of Put OI vs Call OI change — bullish when Put addition > Call addition"
      instrument={instrument}
      setInstrument={setInstrument}
    >
      {/* Stats Row */}
      <div style={s.statsRow}>
        {[
          { label: 'Spot', value: `₹${spot.toLocaleString('en-IN')}`, color: '#c4b5fd' },
          { label: 'Total Put OI Δ', value: `${totalPutChg >= 0 ? '+' : ''}${(totalPutChg/1000).toFixed(0)}K`, color: totalPutChg >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Total Call OI Δ', value: `${totalCallChg >= 0 ? '+' : ''}${(totalCallChg/1000).toFixed(0)}K`, color: totalCallChg >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Net Diff (PE-CE)', value: `${(totalPutChg - totalCallChg) >= 0 ? '+' : ''}${((totalPutChg - totalCallChg)/1000).toFixed(0)}K`, color: (totalPutChg - totalCallChg) >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Latest PCR', value: data[data.length-1]?.pcr || '—', color: '#fbbf24' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Chart: Diff over time */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.92rem' }}>PE–CE OI Difference (Per Interval)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<Tooltip2 />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <Bar dataKey="diff" name="PE-CE Diff" radius={[3,3,0,0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.diff >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Time', 'Put OI Δ', 'Call OI Δ', 'PE-CE Diff', 'Direction', 'PCR', 'Future LTP'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((row, i) => (
              <tr key={i} style={{ ...s.tr, background: i === 0 ? 'rgba(148,112,248,0.06)' : 'transparent' }}>
                <td style={{ ...s.td, fontWeight: 700, color: '#e2e8f0' }}>{row.time}</td>
                <td style={{ ...s.td, color: row.putChg >= 0 ? '#10b981' : '#ef4444' }}>
                  {row.putChg >= 0 ? '+' : ''}{(row.putChg/1000).toFixed(0)}K
                </td>
                <td style={{ ...s.td, color: row.callChg >= 0 ? '#10b981' : '#ef4444' }}>
                  {row.callChg >= 0 ? '+' : ''}{(row.callChg/1000).toFixed(0)}K
                </td>
                <td style={{ ...s.td }}>
                  <DiffBar value={row.diff} />
                </td>
                <td style={{ ...s.td }}>
                  <span style={{ ...s.dirBadge, background: row.diff >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: row.diff >= 0 ? '#10b981' : '#ef4444' }}>
                    {row.diff >= 0 ? '⬆ Bullish' : '⬇ Bearish'}
                  </span>
                </td>
                <td style={{ ...s.td, color: row.pcr > 1 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{row.pcr}</td>
                <td style={{ ...s.td, color: '#c4b5fd', fontWeight: 600 }}>₹{row.future.toLocaleString('en-IN')}</td>
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
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', marginBottom: 24 },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { padding: '10px 14px', textAlign: 'center', fontSize: '0.73rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '9px 14px', textAlign: 'center', fontSize: '0.83rem' },
  dirBadge: { display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 },
};
