import React from 'react';
import { Award, Compass, ShieldCheck, Heart } from 'lucide-react';

export default function AboutUs() {
  return (
    <div style={auxStyles.container} className="animate-fade-in">
      <div className="page-wrapper" style={{ maxWidth: '800px' }}>
        
        <span className="badge-glow">OUR MISSION</span>
        <h1 style={{ fontSize: '2.5rem', marginTop: 12, marginBottom: 16 }}>About Earn With Us</h1>
        
        <p style={auxStyles.introText}>
          Earn With Us, founded in 2023, is India's premier stock market analytics platform. We are dedicated to building lightning-fast scanners, sector heatmaps, and derivative analysis tools to help traders and investors unlock systematic edge in the markets.
        </p>

        <div className="glass-card" style={{ padding: '32px', margin: '32px 0', backgroundColor: '#0d0f17' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>The Earn With Us Vision</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Traditional stock research tools are either too slow, overly complex, or prohibitively expensive. Our vision is to democratize institutional-grade market data. By bringing together technical screeners, RRG rotation indices, option chains, and sentiment heatmaps under one single roof, we give retail participants the speed they need to execute successful trades.
          </p>
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>Our Core Values</h3>
        <div style={auxStyles.valuesGrid}>
          <div style={auxStyles.valueCard}>
            <Award size={24} color="#10b981" />
            <h4 style={{ fontSize: '1rem', margin: '10px 0 6px 0' }}>Institutional Speed</h4>
            <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Calculations are computed at sub-second speeds so you receive buy/sell triggers before the crowd reacts.
            </p>
          </div>

          <div style={auxStyles.valueCard}>
            <Compass size={24} color="#f59e0b" />
            <h4 style={{ fontSize: '1rem', margin: '10px 0 6px 0' }}>Data Integrity</h4>
            <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Aggregate volume data and open interest concentration feeds are audited continuously to maintain accuracy.
            </p>
          </div>

          <div style={auxStyles.valueCard}>
            <Heart size={24} color="#ef4444" />
            <h4 style={{ fontSize: '1rem', margin: '10px 0 6px 0' }}>Retail Focused</h4>
            <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Every chart indicator and screener card is designed to be highly intuitive, helping you learn while you earn.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

const auxStyles = {
  container: {
    padding: '60px 0 80px 0',
  },
  introText: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '16px',
  },
  valueCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '20px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};
