import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={footerStyles.footer}>
      <div className="page-wrapper">
        <div style={footerStyles.grid}>
          
          {/* Logo & About Column */}
          <div style={footerStyles.colLarge}>
            <Link to="/" style={footerStyles.logoContainer}>
              <div style={footerStyles.logoIcon}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#0d0f17' }}>⚡</span>
              </div>
              <span style={footerStyles.logoText}>
                Earn <span style={{ color: '#10b981' }}>With Us</span>
              </span>
            </Link>
            <p style={footerStyles.description}>
              Earn With Us, founded in 2023, is a premier stock market analytical platform. We offer a comprehensive suite of scanners, sector heatmaps, RRG charts, and options analysis tools to help traders and investors execute data-backed decisions.
            </p>
            <div style={footerStyles.socials}>
              <a href="https://chat.whatsapp.com/LO3eNiIvHRv1DNDaAmkPoG?s=cl&p=a&mlu=1" target="_blank" rel="noopener noreferrer" style={{ ...footerStyles.socialIcon, color: '#25D366' }} aria-label="WhatsApp">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 2.019 14.13 1.01 11.999 1.01c-5.441 0-9.866 4.372-9.87 9.802 0 1.714.463 3.39 1.337 4.888l-.93 3.393 3.521-.921z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={footerStyles.socialIcon} aria-label="Facebook">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.39-1 1-1h2V2h-3c-2.9 0-5 1.55-5 4.5V8z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={footerStyles.socialIcon} aria-label="Instagram">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={footerStyles.socialIcon} aria-label="Twitter">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={footerStyles.socialIcon} aria-label="LinkedIn">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={footerStyles.socialIcon} aria-label="YouTube">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>

          {/* Connect Column */}
          <div style={footerStyles.col}>
            <h4 style={footerStyles.heading}>Connect with us</h4>
            <div style={footerStyles.connectInfo}>
              <div style={footerStyles.infoItem}>
                <Clock size={16} color="#10b981" />
                <span style={footerStyles.infoText}>Mon-Sat , 10 AM - 7 PM</span>
              </div>
              <div style={footerStyles.infoItem}>
                <Phone size={16} color="#10b981" />
                <span style={footerStyles.infoText}>+91 8790699123</span>
              </div>
              <div style={footerStyles.infoItem}>
                <svg width="16" height="16" fill="currentColor" style={{ color: '#10b981', flexShrink: 0 }} viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 2.019 14.13 1.01 11.999 1.01c-5.441 0-9.866 4.372-9.87 9.802 0 1.714.463 3.39 1.337 4.888l-.93 3.393 3.521-.921z"/>
                </svg>
                <a href="https://chat.whatsapp.com/LO3eNiIvHRv1DNDaAmkPoG?s=cl&p=a&mlu=1" target="_blank" rel="noopener noreferrer" style={footerStyles.link}>Join WhatsApp Group</a>
              </div>
              <div style={footerStyles.infoItem}>
                <Mail size={16} color="#10b981" />
                <a href="mailto:mahaboobbasha140724@gmail.com" style={footerStyles.link}>mahaboobbasha140724@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Links Column: Company */}
          <div style={footerStyles.col}>
            <h4 style={footerStyles.heading}>Company</h4>
            <ul style={footerStyles.list}>
              <li style={footerStyles.listItem}><Link to="/about-us" style={footerStyles.link}>About Us</Link></li>
              <li style={footerStyles.listItem}><Link to="/contact-us" style={footerStyles.link}>Contact Us</Link></li>
              <li style={footerStyles.listItem}><Link to="/privacy-policy" style={footerStyles.link}>Privacy Policy</Link></li>
              <li style={footerStyles.listItem}><Link to="/terms-conditions" style={footerStyles.link}>Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Links Column: Features */}
          <div style={footerStyles.col}>
            <h4 style={footerStyles.heading}>Features</h4>
            <ul style={footerStyles.list}>
              <li style={footerStyles.listItem}><Link to="/features/scanners" style={footerStyles.link}>Scanners</Link></li>
              <li style={footerStyles.listItem}><Link to="/features/heatmaps" style={footerStyles.link}>Heatmaps</Link></li>
              <li style={footerStyles.listItem}><Link to="/features/rrg" style={footerStyles.link}>RRG Analysis</Link></li>
              <li style={footerStyles.listItem}><Link to="/features/sentiment" style={footerStyles.link}>Sentiment Indicators</Link></li>
              <li style={footerStyles.listItem}><Link to="/features/futures-options" style={footerStyles.link}>Futures & Options</Link></li>
            </ul>
          </div>

        </div>

        <div style={footerStyles.copyrightContainer}>
          <p style={footerStyles.copyright}>
            &copy; {new Date().getFullYear()} Earn With Us. All rights reserved. All mock charts and analysis are for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}

const footerStyles = {
  footer: {
    backgroundColor: '#07080d',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '64px 0 32px 0',
    marginTop: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr 1fr 1fr',
    gap: '40px',
    marginBottom: '48px',
  },
  colLarge: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    backgroundColor: '#10b981',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: '1.25rem',
    color: '#ffffff',
  },
  description: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  socials: {
    display: 'flex',
    gap: '12px',
  },
  socialIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    transition: '0.2s ease',
  },
  heading: {
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#ffffff',
  },
  connectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  infoText: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    fontSize: '0.9rem',
  },
  link: {
    color: '#94a3b8',
    transition: '0.15s ease',
  },
  copyrightContainer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '24px',
    textAlign: 'center',
  },
  copyright: {
    color: '#64748b',
    fontSize: '0.8rem',
  }
};
