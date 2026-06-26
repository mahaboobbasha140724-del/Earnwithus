import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, CreditCard, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null); // plan object if checkout modal open
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const plans = [
    {
      id: '1m',
      name: '1 Month Pro',
      price: 649,
      basePrice: 650,
      period: 'Month',
      save: '0%',
      popular: false
    },
    {
      id: '6m',
      name: '6 Month Pro',
      price: 3600,
      basePrice: 4640,
      period: '6 Months',
      save: '22%',
      popular: false
    },
    {
      id: '1y',
      name: '1 Year Pro',
      price: 5610,
      basePrice: 7500,
      period: 'Year',
      save: '25%',
      popular: true
    },
    {
      id: '2y',
      name: '2 Year Pro',
      price: 10200,
      basePrice: 12000,
      period: '2 Years',
      save: '15%',
      popular: false
    }
  ];

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv || !name) return;
    
    setCheckoutStep('processing');
    
    // Simulate payment gateway delay (2.5 seconds)
    setTimeout(() => {
      setCheckoutStep('success');
    }, 2500);
  };

  const closeCheckout = () => {
    setSelectedPlan(null);
    setCheckoutStep('form');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setName('');
  };

  return (
    <div style={pricingStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={pricingStyles.header}>
          <span className="badge-glow">FLEXIBLE PRO SUITE</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: 12 }}>Unlock Earn With Us Pro Plans</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: 8, maxWidth: '600px', marginInline: 'auto' }}>
            Choose the subscription plan that fits your trading capital. Unlock scanners, derivatives analysis, and relative rotation graphs.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={pricingStyles.grid}>
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="glass-card"
              style={{
                ...pricingStyles.card,
                borderColor: plan.popular ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: plan.popular ? '0 0 25px rgba(16, 185, 129, 0.15)' : 'var(--shadow-premium)'
              }}
            >
              {plan.popular && (
                <div style={pricingStyles.popularTag}>MOST POPULAR</div>
              )}

              <div style={pricingStyles.planName}>{plan.name}</div>
              
              <div style={pricingStyles.priceBlock}>
                {plan.basePrice > plan.price && (
                  <span style={pricingStyles.basePrice}>₹{plan.basePrice.toLocaleString()}</span>
                )}
                <span style={pricingStyles.price}>₹{plan.price.toLocaleString()}</span>
                <span style={pricingStyles.period}>/ {plan.period}</span>
              </div>

              {plan.save !== '0%' && (
                <span className="badge-gold" style={{ marginBottom: 20 }}>Save {plan.save} Instantly</span>
              )}

              <button 
                onClick={() => setSelectedPlan(plan)}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
              >
                Subscribe Now <ArrowRight size={16} />
              </button>

              <div style={pricingStyles.featuresList}>
                <div style={foStyles.checklistItem}><Check size={14} color="#10b981" /> Full access to all 30+ Scanners</div>
                <div style={foStyles.checklistItem}><Check size={14} color="#10b981" /> Interactive Sector Heatmaps</div>
                <div style={foStyles.checklistItem}><Check size={14} color="#10b981" /> RRG rotational momentum graphs</div>
                <div style={foStyles.checklistItem}><Check size={14} color="#10b981" /> Derivatives Options Chain matrix</div>
                <div style={foStyles.checklistItem}><Check size={14} color="#10b981" /> Fear/Greed & sentiment dials</div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Matrix Table */}
        <div style={pricingStyles.matrixSection}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: 8, textAlign: 'center' }}>Compare Plans & Capabilities</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 32, textAlign: 'center' }}>See what's included in our free trial versus our pro subscription packages.</p>
          
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#0d0f17' }}>
            <table style={pricingStyles.table}>
              <thead>
                <tr style={pricingStyles.tableHeaderRow}>
                  <th style={pricingStyles.th}>PLATFORM CAPABILITIES</th>
                  <th style={pricingStyles.th}>FREE TRIAL (7 DAYS)</th>
                  <th style={{...pricingStyles.th, color: '#10b981'}}>PRO LICENSE</th>
                </tr>
              </thead>
              <tbody>
                <tr style={pricingStyles.tr}>
                  <td style={pricingStyles.tdTitle}>Price & Volume Scanners</td>
                  <td style={pricingStyles.td}>Basic Filters</td>
                  <td style={{...pricingStyles.td, color: '#10b981', fontWeight: 600}}>Advanced + Real-Time</td>
                </tr>
                <tr style={pricingStyles.tr}>
                  <td style={pricingStyles.tdTitle}>RMI & Dow Trend Indicators</td>
                  <td style={pricingStyles.td}>Delayed (15 mins)</td>
                  <td style={{...pricingStyles.td, color: '#10b981', fontWeight: 600}}>Instant Tick Update</td>
                </tr>
                <tr style={pricingStyles.tr}>
                  <td style={pricingStyles.tdTitle}>Relative Rotation Graphs (RRG)</td>
                  <td style={pricingStyles.td}>Indices Only</td>
                  <td style={{...pricingStyles.td, color: '#10b981', fontWeight: 600}}>Full Ticker Universe</td>
                </tr>
                <tr style={pricingStyles.tr}>
                  <td style={pricingStyles.tdTitle}>Option Chain & OI Build-up</td>
                  <td style={pricingStyles.td}>Not Available</td>
                  <td style={{...pricingStyles.td, color: '#10b981', fontWeight: 600}}>Available on All F&O Symbols</td>
                </tr>
                <tr style={pricingStyles.tr}>
                  <td style={pricingStyles.tdTitle}>FII/DII Net Flow Sentiment</td>
                  <td style={pricingStyles.td}>End of Day (EOD)</td>
                  <td style={{...pricingStyles.td, color: '#10b981', fontWeight: 600}}>Live Flow Dials</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Checkout Modal (Simulated payment gate) */}
      {selectedPlan && (
        <div style={pricingStyles.modalOverlay}>
          <div className="glass-card" style={pricingStyles.modal}>
            
            {/* Step 1: Billing Input Form */}
            {checkoutStep === 'form' && (
              <form onSubmit={handleCheckoutSubmit}>
                <div style={pricingStyles.modalHeader}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard color="#10b981" /> Complete Subscription
                  </h3>
                  <button type="button" onClick={closeCheckout} style={pricingStyles.closeBtn}>&times;</button>
                </div>

                <div style={pricingStyles.planSummary}>
                  <span>Subscribing to: <strong>{selectedPlan.name}</strong></span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>₹{selectedPlan.price.toLocaleString()}</span>
                </div>

                <div style={pricingStyles.formGroup}>
                  <label style={pricingStyles.label}>Name on Card</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter cardholder name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={pricingStyles.input}
                  />
                </div>

                <div style={pricingStyles.formGroup}>
                  <label style={pricingStyles.label}>Card Number</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="19"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    style={pricingStyles.input}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={pricingStyles.formGroup}>
                    <label style={pricingStyles.label}>Expiry Date</label>
                    <input 
                      type="text" 
                      required 
                      maxLength="5"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      style={pricingStyles.input}
                    />
                  </div>
                  <div style={pricingStyles.formGroup}>
                    <label style={pricingStyles.label}>CVV</label>
                    <input 
                      type="password" 
                      required 
                      maxLength="3"
                      placeholder="***"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      style={pricingStyles.input}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                >
                  Pay Now ₹{selectedPlan.price.toLocaleString()}
                </button>
              </form>
            )}

            {/* Step 2: Processing Payment Screen */}
            {checkoutStep === 'processing' && (
              <div style={pricingStyles.loadingContainer}>
                <Loader2 size={48} color="#10b981" style={{ animation: 'spin 1.5s linear infinite', marginBottom: 16 }} />
                <h4>Authorizing Payment Securely...</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}>Connecting to 3D-Secure Payment Gateway. Please do not close or refresh this tab.</p>
              </div>
            )}

            {/* Step 3: Success payment screen */}
            {checkoutStep === 'success' && (
              <div style={pricingStyles.successContainer}>
                <CheckCircle2 size={56} color="#10b981" style={{ marginBottom: 16 }} />
                <h3 style={{ color: '#10b981' }}>Subscription Activated!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 12, lineHeight: 1.6 }}>
                  Thank you, <strong>{name}</strong>! Your payment was processed successfully. You now have unrestricted access to all **Earn With Us Pro** features.
                </p>
                
                <div style={{ marginTop: 24, padding: 12, backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8, fontSize: '0.8rem', textAlign: 'left' }}>
                  <span>Transaction ID: <strong>EWU-TXN-{Math.floor(Math.random() * 900000) + 100000}</strong></span>
                </div>

                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ marginTop: 24 }}
                  onClick={closeCheckout}
                >
                  Go to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

const pricingStyles = {
  container: {
    padding: '40px 0 64px 0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '64px',
  },
  card: {
    padding: '32px 24px',
    backgroundColor: '#0d0f17',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    minHeight: '440px',
  },
  popularTag: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#10b981',
    color: '#07080d',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  planName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '16px',
  },
  priceBlock: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '12px',
  },
  basePrice: {
    fontSize: '1rem',
    color: '#64748b',
    textDecoration: 'line-through',
    fontWeight: 500,
  },
  price: {
    fontSize: '2rem',
    fontWeight: 800,
    fontFamily: 'var(--font-heading)',
    color: '#ffffff',
  },
  period: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  featuresList: {
    marginTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  matrixSection: {
    marginTop: '32px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  th: {
    padding: '16px 24px',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  tdTitle: {
    padding: '16px 24px',
    fontWeight: 600,
    color: '#ffffff',
  },
  td: {
    padding: '16px 24px',
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Modal checkout
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(3,4,6,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    backdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    maxWidth: '440px',
    padding: '24px',
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
    animation: 'slideUp 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '1.8rem',
    cursor: 'pointer',
  },
  planSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.04)',
    marginBottom: '20px',
    fontSize: '0.9rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#94a3b8',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '12px',
    color: '#ffffff',
    outline: 'none',
    fontSize: '0.9rem',
    width: '100%',
    ':focus': {
      borderColor: '#10b981',
    }
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '32px 0',
  },
  successContainer: {
    textAlign: 'center',
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};
// Add spin keyframes style dynamically
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML += `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleEl);
}
const foStyles = {
  checklistItem: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }
};
