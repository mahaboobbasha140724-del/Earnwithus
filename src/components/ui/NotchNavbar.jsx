import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Activity, Layers, BarChart2, Shield, Search, LogOut } from 'lucide-react';
import ThemeSelector from '../ThemeSelector';
import { useAuth } from '../../context/AuthContext';

export function NotchNavbar({
  setIsAuthModalOpen,
  setAuthModalTab,
  setSelectedStockForModal
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [optionsLabOpen, setOptionsLabOpen] = useState(false);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  const { currentUser, userProfile, logout, isAdmin } = useAuth();

  return (
    <>
      <header style={notchStyles.headerContainer}>
        {/* Left Side Bar */}
        <div style={notchStyles.sideBarLeft}>
          <svg style={notchStyles.svgLine} preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="var(--border-light)" strokeWidth="1" />
          </svg>
        </div>

        {/* Responsive Notch Center Slice */}
        <div style={notchStyles.notchCenterWrapper}>
          
          {/* Left Corner Notch Curve */}
          <div style={notchStyles.cornerLeft}>
            <div style={{ ...notchStyles.cornerBg, clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }} />
            <svg style={notchStyles.cornerSvg} viewBox="0 0 50 64">
              <path d="M0 39.5 C25 39.5 25 63.5 50 63.5" fill="none" stroke="var(--border-light)" strokeWidth="1" />
            </svg>
          </div>

          {/* Flexible Middle Content */}
          <div style={notchStyles.middleContent}>
            <div style={notchStyles.middleBg}>
              <svg style={notchStyles.svgLine} preserveAspectRatio="none">
                <line x1="0" y1="63.5" x2="100%" y2="63.5" stroke="var(--border-light)" strokeWidth="1" />
              </svg>
            </div>

            <div style={notchStyles.contentRow}>
              
              {/* Mobile Hamburger Menu Toggle */}
              <button
                className="mobile-only"
                style={notchStyles.iconBtn}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logo */}
              <Link to="/" style={notchStyles.logoBox}>
                <div style={notchStyles.logoIcon}>
                  <Activity size={18} color="#ffffff" />
                </div>
                <span style={notchStyles.logoText}>
                  Earn <span style={{ color: '#10b981' }}>With Us</span>
                </span>
              </Link>

              {/* Desktop Left / Center Navigation */}
              <nav className="desktop-only" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                
                {/* Features */}
                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setFeaturesDropdownOpen(true)}
                  onMouseLeave={() => setFeaturesDropdownOpen(false)}
                >
                  <span style={notchStyles.navLink}>
                    Features <ChevronDown size={14} style={{ marginLeft: 4, transform: featuresDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </span>
                  {featuresDropdownOpen && (
                    <div style={notchStyles.dropdown}>
                      <Link to="/tools/futures-dashboard" style={notchStyles.dropdownLink}>
                        <div style={notchStyles.dropdownTitle}>Futures Dashboard <span className="badge-glow" style={{ fontSize: '0.6rem', padding: '1px 4px', marginLeft: 4 }}>NEW</span></div>
                        <div style={notchStyles.dropdownDesc}>OI build-up cycle & basis spread</div>
                      </Link>
                      <Link to="/features/scanners" style={notchStyles.dropdownLink}>
                        <div style={notchStyles.dropdownTitle}>Scanners</div>
                        <div style={notchStyles.dropdownDesc}>Real-time technical screeners</div>
                      </Link>
                      <Link to="/features/heatmaps" style={notchStyles.dropdownLink}>
                        <div style={notchStyles.dropdownTitle}>Heatmaps</div>
                        <div style={notchStyles.dropdownDesc}>Color-coded sector view</div>
                      </Link>
                      <Link to="/features/rrg" style={notchStyles.dropdownLink}>
                        <div style={notchStyles.dropdownTitle}>RRG</div>
                        <div style={notchStyles.dropdownDesc}>Relative rotation graphs</div>
                      </Link>
                      <Link to="/features/sentiment" style={notchStyles.dropdownLink}>
                        <div style={notchStyles.dropdownTitle}>Market Sentiment</div>
                        <div style={notchStyles.dropdownDesc}>Fear/Greed & participant flows</div>
                      </Link>
                      <Link to="/strategies" style={notchStyles.dropdownLink}>
                        <div style={notchStyles.dropdownTitle}>Strategies</div>
                        <div style={notchStyles.dropdownDesc}>Option strategy builder</div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Options Lab */}
                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setOptionsLabOpen(true)}
                  onMouseLeave={() => setOptionsLabOpen(false)}
                >
                  <span style={notchStyles.navLink}>
                    Options Lab <ChevronDown size={14} style={{ marginLeft: 4, transform: optionsLabOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </span>
                  {optionsLabOpen && (
                    <div style={{ ...notchStyles.dropdown, width: 300 }}>
                      <div style={notchStyles.dropdownSection}>Core Tools</div>
                      {[
                        ['/tools/futures-dashboard', 'Futures Dashboard', 'F&O OI build-up cycle'],
                        ['/tools/option-chain', 'Option Chain', 'Live OI & IV'],
                        ['/tools/open-interest', 'Open Interest', 'CE vs PE distribution'],
                        ['/tools/put-call-ratio', 'Put-Call Ratio', 'Intraday PCR trend'],
                        ['/tools/max-pain', 'Max Pain', 'Max pain strike calculation'],
                      ].map(([path, title, desc]) => (
                        <Link key={path} to={path} style={notchStyles.dropdownLink}>
                          <div style={notchStyles.dropdownTitle}>{title}</div>
                          <div style={notchStyles.dropdownDesc}>{desc}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Market */}
                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setMarketDropdownOpen(true)}
                  onMouseLeave={() => setMarketDropdownOpen(false)}
                >
                  <span style={notchStyles.navLink}>
                    Market <ChevronDown size={14} style={{ marginLeft: 4, transform: marketDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </span>
                  {marketDropdownOpen && (
                    <div style={notchStyles.dropdown}>
                      {[
                        ['/tools/market-movers', 'Market Movers', 'Gainers, losers, OI buildup'],
                        ['/tools/advance-decline', 'Advance / Decline', 'Market breadth indicator'],
                        ['/tools/index-contributors', 'Index Contributors', 'Stocks driving index move'],
                        ['/tools/fii-dii-history', 'FII/DII History', '365-day flow chart'],
                      ].map(([path, title, desc]) => (
                        <Link key={path} to={path} style={notchStyles.dropdownLink}>
                          <div style={notchStyles.dropdownTitle}>{title}</div>
                          <div style={notchStyles.dropdownDesc}>{desc}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link to="/tools" style={{ ...notchStyles.navLink, color: 'var(--color-primary)', fontWeight: 700 }}>🔧 Tools Hub</Link>
                <Link to="/paper-trade" style={notchStyles.navLink}>Paper Trade <span className="badge-glow" style={{marginLeft: '4px', fontSize: '0.6rem', padding: '1px 4px', backgroundColor: '#3b82f6'}}>NEW</span></Link>
                <Link to="/pricing" style={notchStyles.navLink}>Pricing</Link>
              </nav>

              {/* Actions Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ThemeSelector />
                
                {currentUser ? (
                  <button onClick={logout} style={notchStyles.authBtn}>
                    <LogOut size={14} /> Logout
                  </button>
                ) : (
                  <button onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    Login
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right Corner Notch Curve */}
          <div style={notchStyles.cornerRight}>
            <div style={{ ...notchStyles.cornerBg, clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }} />
            <svg style={notchStyles.cornerSvg} viewBox="0 0 50 64">
              <path d="M0 63.5 C25 63.5 25 39.5 50 39.5" fill="none" stroke="var(--border-light)" strokeWidth="1" />
            </svg>
          </div>

        </div>

        {/* Right Side Bar */}
        <div style={notchStyles.sideBarRight}>
          <svg style={notchStyles.svgLine} preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="var(--border-light)" strokeWidth="1" />
          </svg>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={notchStyles.mobileDrawer}
          >
            <ThemeSelector isMobile={true} />
            <div style={{ margin: '12px 0', borderBottom: '1px solid var(--border-light)' }} />
            <Link to="/tools/futures-dashboard" onClick={() => setIsMobileMenuOpen(false)} style={notchStyles.mobileLink}>Futures Dashboard</Link>
            <Link to="/features/scanners" onClick={() => setIsMobileMenuOpen(false)} style={notchStyles.mobileLink}>Scanners</Link>
            <Link to="/features/heatmaps" onClick={() => setIsMobileMenuOpen(false)} style={notchStyles.mobileLink}>Heatmaps</Link>
            <Link to="/features/rrg" onClick={() => setIsMobileMenuOpen(false)} style={notchStyles.mobileLink}>RRG</Link>
            <Link to="/tools" onClick={() => setIsMobileMenuOpen(false)} style={notchStyles.mobileLink}>Tools Hub</Link>
            <Link to="/paper-trade" onClick={() => setIsMobileMenuOpen(false)} style={notchStyles.mobileLink}>Paper Trade</Link>
            <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} style={notchStyles.mobileLink}>Pricing</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const notchStyles = {
  headerContainer: {
    position: 'sticky',
    top: 0,
    insetX: 0,
    zIndex: 100,
    height: '64px',
    display: 'flex',
    backdropFilter: 'blur(12px)',
  },
  sideBarLeft: {
    flex: 1,
    height: '40px',
    backgroundColor: 'var(--bg-header)',
    position: 'relative',
  },
  sideBarRight: {
    flex: 1,
    height: '40px',
    backgroundColor: 'var(--bg-header)',
    position: 'relative',
  },
  svgLine: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  notchCenterWrapper: {
    display: 'flex',
    height: '64px',
    position: 'relative',
    zIndex: 10,
    flexShrink: 0,
  },
  cornerLeft: {
    width: '50px',
    height: '100%',
    position: 'relative',
    flexShrink: 0,
  },
  cornerRight: {
    width: '50px',
    height: '100%',
    position: 'relative',
    flexShrink: 0,
  },
  cornerBg: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--bg-header)',
  },
  cornerSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  middleContent: {
    flex: 1,
    height: '100%',
    position: 'relative',
    minWidth: '720px',
  },
  middleBg: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--bg-header)',
  },
  contentRow: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
  },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '28px',
    height: '28px',
    backgroundColor: '#10b981',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
  },
  navLink: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'var(--bg-dropdown)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    width: '240px',
    padding: '12px',
    boxShadow: 'var(--shadow-premium)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 100,
  },
  dropdownSection: {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  dropdownLink: {
    padding: '6px 10px',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
  },
  dropdownTitle: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  dropdownDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '4px',
  },
  authBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1px solid var(--border-light)',
    color: 'var(--text-primary)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  mobileDrawer: {
    position: 'fixed',
    top: '64px',
    insetX: 0,
    zIndex: 90,
    backgroundColor: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-light)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mobileLink: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    textDecoration: 'none',
  }
};
