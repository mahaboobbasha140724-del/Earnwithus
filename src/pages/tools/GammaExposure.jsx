import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import ToolShell from './ToolShell';
import { usePaperTrade } from '../../context/PaperTradeContext';

const EXPIRIES = ['24 Jul 2025', '31 Jul 2025', '28 Aug 2025'];

function computeGEX(spot) {
  const atm = Math.round(spot / 50) * 50;
  const strikes = Array.from({ length: 13 }, (_, i) => atm - 300 + i * 50);
  let gammaFlip = atm;

  return strikes.map(k => {
    const dist = (k - spot) / spot;
    const callGamma = parseFloat((Math.max(0.001, 0.015 - Math.abs(dist) * 1.5) * (1 + Math.random() * 0.2)).toFixed(4));
    const putGamma  = parseFloat((Math.max(0.001, 0.014 - Math.abs(dist) * 1.4) * (1 + Math.random() * 0.2)).toFixed(4));
    const callOI    = Math.floor((k > spot ? 45000 + (k-atm)/50*7000 : 80000 - (atm-k)/50*3000) * (1 + Math.random()*0.15));
    const putOI     = Math.floor((k < spot ? 45000 + (atm-k)/50*7000 : 80000 - (k-atm)/50*3000) * (1 + Math.random()*0.15));
    const lotSize = 50;
    const dealerCallGEX = parseFloat((callGamma * callOI * lotSize * spot / 1e8).toFixed(2));
    const dealerPutGEX  = parseFloat((-putGamma * putOI * lotSize * spot / 1e8).toFixed(2));
    const netGEX = parseFloat((dealerCallGEX + dealerPutGEX).toFixed(2));
    return { strike: k, callGEX: dealerCallGEX, putGEX: dealerPutGEX, netGEX, isATM: k === atm, isFlip: k === gammaFlip };
  });
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <div style={{ color: '#9470F8', fontWeight: 700, marginBottom: 6 }}>Strike: {label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {p.value} Cr</div>)}
    </div>
  );
};

export default function GammaExposure() {
  const [instrument, setInstrument] = useState('NIFTY');
  const [expiry, setExpiry] = useState(EXPIRIES[0]);
  const [view, setView] = useState('net'); // net | breakdown
  const { marketData } = usePaperTrade();

  const spotMap = { NIFTY: 24200, BANKNIFTY: 52400, FINNIFTY: 23800, MIDCPNIFTY: 12400, SENSEX: 79500 };
  const spot = marketData?.[instrument === 'NIFTY' ? 'NIFTY50' : instrument]?.price || spotMap[instrument];
  const data = computeGEX(spot);

  const netGEXTotal = parseFloat(data.reduce((a, r) => a + r.netGEX, 0).toFixed(2));
  const gammaFlipIdx = data.findIndex((r, i) => i > 0 && Math.sign(r.netGEX) !== Math.sign(data[i-1].netGEX));
  const gammaFlipStrike = gammaFlipIdx >= 0 ? data[gammaFlipIdx].strike : Math.round(spot / 50) * 50;
  const isPositiveGamma = netGEXTotal > 0;

  return (
    <ToolShell
      title="Gamma Exposure (GEX)"
      badge="OPTIONS LAB"
      description="Dealer gamma exposure by strike — positive GEX stabilizes markets, negative GEX amplifies moves"
      instrument={instrument}
      setInstrument={setInstrument}
      expiry={expiry}
      setExpiry={setExpiry}
      expiries={EXPIRIES}
    >
      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Net GEX', value: `${netGEXTotal > 0 ? '+' : ''}${netGEXTotal} Cr`, color: isPositiveGamma ? '#10b981' : '#ef4444' },
          { label: 'Gamma Environment', value: isPositiveGamma ? '+ Positive' : '− Negative', color: isPositiveGamma ? '#10b981' : '#ef4444' },
          { label: 'Gamma Flip Level', value: gammaFlipStrike.toLocaleString('en-IN'), color: '#fbbf24' },
          { label: 'Spot', value: `₹${spot.toLocaleString('en-IN')}`, color: '#c4b5fd' },
          { label: 'Market Behavior', value: isPositiveGamma ? 'Mean Revert' : 'Trending', color: isPositiveGamma ? '#10b981' : '#fbbf24' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Gamma Theory Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ ...s.infoCard, borderColor: 'rgba(16,185,129,0.2)' }}>
          <div style={{ color: '#10b981', fontWeight: 700, marginBottom: 6 }}>⬆ Positive GEX (Dealer Long Gamma)</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Dealers hedge by selling into rallies and buying dips → Market becomes range-bound and mean-reverting</div>
        </div>
        <div style={{ ...s.infoCard, borderColor: 'rgba(239,68,68,0.2)' }}>
          <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: 6 }}>⬇ Negative GEX (Dealer Short Gamma)</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Dealers hedge by buying rallies and selling dips → Market becomes trend-following and volatile</div>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['net','breakdown'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ ...s.btn, ...(view === v ? s.btnActive : {}) }}>
            {v === 'net' ? 'Net GEX' : 'Call/Put Breakdown'}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={s.chartBox}>
        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '0.9rem' }}>
          Dealer Gamma Exposure by Strike (Cr) — Gamma Flip Level: {gammaFlipStrike.toLocaleString('en-IN')}
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="strike" tick={{ fill: '#64748b', fontSize: 11 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}Cr`} />
            <Tooltip content={<TT />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
            <ReferenceLine x={spot} stroke="#9470F8" strokeDasharray="4 3" label={{ value: 'Spot', fill: '#9470F8', fontSize: 11 }} />
            <ReferenceLine x={gammaFlipStrike} stroke="#fbbf24" strokeWidth={2} label={{ value: '⚡Flip', fill: '#fbbf24', fontSize: 11 }} />
            {view === 'net' ? (
              <Bar dataKey="netGEX" name="Net GEX" radius={[3,3,0,0]}>
                {data.map((r, i) => <Cell key={i} fill={r.netGEX >= 0 ? '#10b981' : '#ef4444'} />)}
              </Bar>
            ) : (
              <>
                <Bar dataKey="callGEX" name="Call GEX" fill="#ef4444" radius={[3,3,0,0]} opacity={0.8} />
                <Bar dataKey="putGEX" name="Put GEX" fill="#10b981" radius={[3,3,0,0]} opacity={0.8} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ToolShell>
  );
}

const s = {
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 20px', flex: '1 1 120px' },
  statLabel: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  statValue: { fontSize: '1.1rem', fontWeight: 700 },
  infoCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid', borderRadius: 10, padding: '14px 18px' },
  btn: { padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnActive: { background: 'rgba(148,112,248,0.15)', borderColor: '#9470F8', color: '#c4b5fd' },
  chartBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' },
};
