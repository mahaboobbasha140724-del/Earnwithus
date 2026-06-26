import React, { useState } from 'react';
import { Mail, Phone, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Simulate sending message to support email (1 second delay)
    setTimeout(() => {
      setFormSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div style={contactStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge-glow">SUPPORT HUB</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: 12 }}>Contact Support Team</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 8 }}>
            Have a billing inquiry, feature request, or technical bug to report? Get in touch with us.
          </p>
        </div>

        {/* Layout Grid */}
        <div style={contactStyles.grid}>
          
          {/* Info Column */}
          <div style={contactStyles.infoCol}>
            <div className="glass-card" style={contactStyles.card}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>Support Channels</h3>
              
              <div style={contactStyles.channelList}>
                <div style={contactStyles.channelItem}>
                  <div style={contactStyles.iconBox}><Phone size={20} color="#10b981" /></div>
                  <div>
                    <div style={contactStyles.channelLabel}>Support Hotline</div>
                    <div style={contactStyles.channelVal}>+91 6361666629</div>
                  </div>
                </div>

                <div style={contactStyles.channelItem}>
                  <div style={contactStyles.iconBox}><Mail size={20} color="#10b981" /></div>
                  <div>
                    <div style={contactStyles.channelLabel}>Official Email</div>
                    <div style={contactStyles.channelVal}>support@earnwithus.com</div>
                  </div>
                </div>

                <div style={contactStyles.channelItem}>
                  <div style={contactStyles.iconBox}><Clock size={20} color="#10b981" /></div>
                  <div>
                    <div style={contactStyles.channelLabel}>Operational Hours</div>
                    <div style={contactStyles.channelVal}>Mon-Sat , 10 AM - 7 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div style={contactStyles.formCol}>
            <div className="glass-card" style={{ padding: '32px', backgroundColor: '#0d0f17' }}>
              
              {!formSubmitted ? (
                <form onSubmit={handleSubmit} style={contactStyles.form}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={20} color="#10b981" /> Leave a Message
                  </h3>

                  <div style={contactStyles.formGroup}>
                    <label style={contactStyles.label}>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter your name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={contactStyles.input}
                    />
                  </div>

                  <div style={contactStyles.formGroup}>
                    <label style={contactStyles.label}>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={contactStyles.input}
                    />
                  </div>

                  <div style={contactStyles.formGroup}>
                    <label style={contactStyles.label}>Subject</label>
                    <input 
                      type="text" 
                      placeholder="What is this inquiry about?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={contactStyles.input}
                    />
                  </div>

                  <div style={contactStyles.formGroup}>
                    <label style={contactStyles.label}>Message Body</label>
                    <textarea 
                      required 
                      rows="4" 
                      placeholder="Describe your issue or query details..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={contactStyles.textarea}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  >
                    Send Query <Send size={14} />
                  </button>
                </form>
              ) : (
                <div style={contactStyles.successBox}>
                  <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 16 }} />
                  <h3 style={{ color: '#10b981' }}>Message Sent Successfully!</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.5 }}>
                    Thank you for reaching out! Our client support desk has received your ticket and will investigate. We typically respond within 12-24 business hours.
                  </p>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ marginTop: 24 }}
                    onClick={() => setFormSubmitted(false)}
                  >
                    Submit Another Query
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const contactStyles = {
  container: {
    padding: '40px 0 80px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '32px',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    padding: '32px',
    backgroundColor: '#0d0f17',
    height: '100%',
  },
  channelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  channelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    backgroundColor: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  channelVal: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#ffffff',
    marginTop: '2px',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '12px',
    color: '#ffffff',
    outline: 'none',
    fontSize: '0.9rem',
    width: '100%',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  successBox: {
    textAlign: 'center',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};
