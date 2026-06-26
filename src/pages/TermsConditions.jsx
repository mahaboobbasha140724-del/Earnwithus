import React from 'react';
import { legalStyles } from './PrivacyPolicy';

export default function TermsConditions() {
  return (
    <div style={legalStyles.container} className="animate-fade-in">
      <div className="page-wrapper" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: 24 }}>Terms & Conditions</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 24 }}>Last Updated: June 2026</p>
        
        <div style={legalStyles.content}>
          <section style={legalStyles.section}>
            <h3>1. Terms of Service</h3>
            <p>By accessing Earn With Us, you agree to comply with our service terms. Our platform provides simulated stock analytics, scanners, and derivatives indicators using free public feeds. We do not provide authorized financial advisories.</p>
          </section>

          <section style={legalStyles.section}>
            <h3>2. Licensing and Access</h3>
            <p>We grant users a limited, revocable license to access our platform for personal trading research. Sharing professional account details or scraping real-time scanners using unauthorized bots is strictly prohibited.</p>
          </section>

          <section style={legalStyles.section}>
            <h3>3. Financial Disclaimer</h3>
            <p>All stock and index prices, open interest metrics, and sentiment scores are for educational use. Stock market trading involves significant capital risk. We advise users to verify trade plans through certified brokers before committing funds.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
