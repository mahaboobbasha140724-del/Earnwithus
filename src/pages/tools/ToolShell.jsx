import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const INSTRUMENTS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];

export default function ToolShell({
  title,
  badge = 'OPTIONS LAB',
  description,
  breadcrumb,
  instrument,
  setInstrument,
  expiry,
  setExpiry,
  expiries = [],
  children,
  rightControls,
}) {
  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="page-wrapper">
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link to="/tools" style={styles.breadcrumbLink}>Tools Hub</Link>
          <ChevronRight size={14} style={{ color: '#64748b' }} />
          <span style={styles.breadcrumbCurrent}>{title}</span>
        </div>

        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <span className="badge-glow" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>{badge}</span>
            <h1 style={styles.title}>{title}</h1>
            {description && <p style={styles.desc}>{description}</p>}
          </div>

          {/* Controls Row */}
          <div style={styles.controls}>
            {/* Instrument Selector */}
            {instrument !== undefined && setInstrument && (
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Instrument</label>
                <div style={styles.btnGroup}>
                  {INSTRUMENTS.map(sym => (
                    <button
                      key={sym}
                      onClick={() => setInstrument(sym)}
                      style={{
                        ...styles.instrBtn,
                        ...(instrument === sym ? styles.instrBtnActive : {}),
                      }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Expiry Selector */}
            {expiry !== undefined && setExpiry && expiries.length > 0 && (
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Expiry</label>
                <select
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  style={styles.select}
                >
                  {expiries.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            )}

            {rightControls}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px 0 60px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    fontSize: '0.8rem',
  },
  breadcrumbLink: {
    color: '#9470F8',
    fontWeight: 600,
  },
  breadcrumbCurrent: {
    color: '#64748b',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    marginTop: 10,
    marginBottom: 6,
    background: 'linear-gradient(135deg, #fff 60%, #9470F8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  desc: {
    color: '#94a3b8',
    fontSize: '0.92rem',
    marginTop: 4,
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
    alignItems: 'flex-end',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  controlLabel: {
    fontSize: '0.72rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  btnGroup: {
    display: 'flex',
    gap: 4,
  },
  instrBtn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: '0.15s ease',
  },
  instrBtnActive: {
    background: 'rgba(148,112,248,0.2)',
    borderColor: '#9470F8',
    color: '#c4b5fd',
  },
  select: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#e2e8f0',
    padding: '7px 12px',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
};
