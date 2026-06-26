import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={legalStyles.container} className="animate-fade-in">
      <div className="page-wrapper" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: 24 }}>Privacy Policy</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 24 }}>Last Updated: June 2026</p>
        
        <div style={legalStyles.content}>
          <section style={legalStyles.section}>
            <h3>1. Data We Collect</h3>
            <p>We collect basic information required for account registration, including your name, email address, and payment preferences. We do not store credit card details directly on our servers; all payment transactions are securely handled by PCI-compliant gateways.</p>
          </section>

          <section style={legalStyles.section}>
            <h3>2. How We Use Data</h3>
            <p>Your data is used to authorize access to our premium scanners, deliver trade alerts, process payments, and improve platform speed. We never sell your personal information to third-party advertising companies.</p>
          </section>

          <section style={legalStyles.section}>
            <h3>3. Market Data Feeds</h3>
            <p>Our market pricing feeds are aggregated from free public sources (NSE indices, Yahoo Finance). Derivatives FII/DII data is sourced via open interest reports powered by Sensibull. This data is provided solely for educational analysis and research purposes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

const legalStyles = {
  container: {
    padding: '60px 0 80px 0',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    lineHeight: '1.7',
    color: '#e2e8f0',
    fontSize: '0.95rem',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '24px',
  }
};
export { legalStyles };
