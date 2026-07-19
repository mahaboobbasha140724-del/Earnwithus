import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Activity, User, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchStocks } from '../data/mockStocks';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import Logo from './Logo';
import ThemeSelector from './ThemeSelector';

export default function Header({ setSelectedStockForModal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [optionsLabOpen, setOptionsLabOpen] = useState(false);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { currentUser, userProfile, isAdmin, isTrialActive, trialDaysLeft, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showTrialPopup, setShowTrialPopup] = useState(false);
  
  const location = useLocation();

  // Listen to url search params for login/signup redirects
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authAction = searchParams.get('authAction');
    if (authAction === 'login' || authAction === 'signup') {
      setAuthModalTab(authAction);
      setIsAuthModalOpen(true);
      
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('authAction');
      newSearch.delete('redirect');
      const cleanSearch = newSearch.toString();
      navigate(location.pathname + (cleanSearch ? `?${cleanSearch}` : ''), { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  // Show trial popup once per user
  useEffect(() => {
    if (currentUser && isTrialActive) {
      const shown = localStorage.getItem(`trial_popup_shown_${currentUser.uid}`);
      if (shown !== 'true') {
        setShowTrialPopup(true);
      }
    } else {
      setShowTrialPopup(false);
    }
  }, [currentUser, isTrialActive]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      setSearchResults(searchStocks(val));
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSelectStock = (stock) => {
    setSelectedStockForModal(stock);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* VengenceUI Notch Navbar Header */}
      <header style={headerStyles.notchHeader}>
        
        {/* Left Side Bar - Flexible width */}
        <div style={headerStyles.sideBarLeft}>
          <svg style={headerStyles.absSvg} preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="var(--border-light)" strokeWidth="1" />
            <line x1="0" y1="36.5" x2="100%" y2="36.5" stroke="var(--border-light)" strokeWidth="1" />
          </svg>
        </div>

        {/* Responsive Notch Container - 3 Slices */}
        <div style={headerStyles.notchContainer}>
          
          {/* Left Slice (Corner Curve) */}
          <div style={headerStyles.cornerLeft}>
            <div style={{ ...headerStyles.cornerBg, clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }} />
            <svg style={headerStyles.cornerSvg} viewBox="0 0 50 64">
              <path d="M0 39.5 C25 39.5 25 63.5 50 63.5" fill="none" stroke="var(--border-light)" strokeWidth="1" />
              <path d="M0 36.5 C25 36.5 25 60.5 50 60.5" fill="none" stroke="var(--border-light)" strokeWidth="1" />
            </svg>
          </div>

          {/* Center Slice (Flexible Content Area) */}
          <div style={headerStyles.centerContent}>
            <div style={headerStyles.centerBg}>
              <svg style={headerStyles.absSvg} preserveAspectRatio="none">
                <line x1="0" y1="63.5" x2="100%" y2="63.5" stroke="var(--border-light)" strokeWidth="1" />
                <line x1="0" y1="60.5" x2="100%" y2="60.5" stroke="var(--border-light)" strokeWidth="1" />
              </svg>
            </div>

            {/* Content Layer */}
            <div style={headerStyles.contentLayer}>
              
              {/* Mobile Menu Button (Left) */}
              <button 
                className="mobile-only"
                style={headerStyles.hamburgerBtn}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logo (Center / Left) */}
              <Link to="/" style={headerStyles.logoContainer}>
                <Logo size={28} />
                <span style={headerStyles.logoText}>
                  Earn <span style={{ color: '#10b981' }}>With Us</span>
                </span>
              </Link>

              {/* Desktop Left Nav Links */}
              <nav className="desktop-only" style={headerStyles.nav}>
                <ul style={headerStyles.navList}>

                  {/* Features Dropdown */}
                  <li style={headerStyles.navItem} onMouseEnter={() => setFeaturesDropdownOpen(true)} onMouseLeave={() => setFeaturesDropdownOpen(false)}>
                    <span style={headerStyles.navLink}>
                      Features <ChevronDown size={14} style={{ marginLeft: 4, transform: featuresDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </span>
                    {featuresDropdownOpen && (
                      <div style={headerStyles.dropdown}>
                        <Link to="/tools/futures-dashboard" style={headerStyles.dropdownLink}>
                          <div style={headerStyles.dropdownTitle}>Futures Dashboard <span className="badge-glow" style={{ fontSize: '0.6rem', padding: '1px 4px', marginLeft: 4 }}>NEW</span></div>
                          <div style={headerStyles.dropdownDesc}>OI build-up cycle & basis spread</div>
                        </Link>
                        <Link to="/features/scanners" style={headerStyles.dropdownLink}>
                          <div style={headerStyles.dropdownTitle}>Scanners</div>
                          <div style={headerStyles.dropdownDesc}>Real-time technical screeners</div>
                        </Link>
                        <Link to="/features/heatmaps" style={headerStyles.dropdownLink}>
                          <div style={headerStyles.dropdownTitle}>Heatmaps</div>
                          <div style={headerStyles.dropdownDesc}>Color-coded sector view</div>
                        </Link>
                        <Link to="/features/rrg" style={headerStyles.dropdownLink}>
                          <div style={headerStyles.dropdownTitle}>RRG</div>
                          <div style={headerStyles.dropdownDesc}>Relative rotation graphs</div>
                        </Link>
                        <Link to="/features/sentiment" style={headerStyles.dropdownLink}>
                          <div style={headerStyles.dropdownTitle}>Market Sentiment</div>
                          <div style={headerStyles.dropdownDesc}>Fear/Greed & participant flows</div>
                        </Link>
                        <Link to="/strategies" style={headerStyles.dropdownLink}>
                          <div style={headerStyles.dropdownTitle}>Strategies</div>
                          <div style={headerStyles.dropdownDesc}>Option strategy builder</div>
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* Options Lab Dropdown */}
                  <li style={headerStyles.navItem} onMouseEnter={() => setOptionsLabOpen(true)} onMouseLeave={() => setOptionsLabOpen(false)}>
                    <span style={headerStyles.navLink}>
                      Options Lab <ChevronDown size={14} style={{ marginLeft: 4, transform: optionsLabOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </span>
                    {optionsLabOpen && (
                      <div style={{ ...headerStyles.dropdown, width: 320 }}>
                        <div style={headerStyles.dropdownSection}>Core Tools</div>
                        {[
                          ['/tools/futures-dashboard', 'Futures Dashboard', 'F&O OI build-up cycle & intraday trends'],
                          ['/tools/option-chain', 'Option Chain', 'Live OI, IV, Buildup & Max Pain marker'],
                          ['/tools/open-interest', 'Open Interest', 'CE vs PE OI distribution by strike'],
                          ['/tools/put-call-ratio', 'Put-Call Ratio', 'Intraday PCR + 365-day trend'],
                          ['/tools/max-pain', 'Max Pain', 'Strike where max options expire worthless'],
                        ].map(([path, title, desc]) => (
                          <Link key={path} to={path} style={headerStyles.dropdownLink}>
                            <div style={headerStyles.dropdownTitle}>{title}</div>
                            <div style={headerStyles.dropdownDesc}>{desc}</div>
                          </Link>
                        ))}
                        <div style={headerStyles.dropdownSection}>Advanced</div>
                        {[
                          ['/tools/straddle-chart', 'Straddle Chart', 'ATM straddle premium decay'],
                          ['/tools/premium-decay', 'Premium Decay', 'Theta erosion visualization'],
                          ['/tools/pe-ce-difference', 'PE-CE Difference', 'OI change diff table'],
                          ['/tools/price-vs-oi', 'Price vs OI', 'Buildup classification'],
                          ['/tools/iv-analysis', 'IV / HV Analysis', 'Implied vs Historical Vol + IVP'],
                          ['/tools/gamma-exposure', 'Gamma Exposure', 'Dealer GEX by strike'],
                          ['/tools/multistrike', 'MultiStrike Chart', 'Up to 5 strikes overlaid'],
                        ].map(([path, title, desc]) => (
                          <Link key={path} to={path} style={headerStyles.dropdownLink}>
                            <div style={headerStyles.dropdownTitle}>{title}</div>
                            <div style={headerStyles.dropdownDesc}>{desc}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>

                  {/* Market Dropdown */}
                  <li style={headerStyles.navItem} onMouseEnter={() => setMarketDropdownOpen(true)} onMouseLeave={() => setMarketDropdownOpen(false)}>
                    <span style={headerStyles.navLink}>
                      Market <ChevronDown size={14} style={{ marginLeft: 4, transform: marketDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </span>
                    {marketDropdownOpen && (
                      <div style={headerStyles.dropdown}>
                        {[
                          ['/tools/market-movers', 'Market Movers', 'Gainers, losers, OI buildup'],
                          ['/tools/advance-decline', 'Advance / Decline', 'Market breadth indicator'],
                          ['/tools/index-contributors', 'Index Contributors', 'Stocks driving index move'],
                          ['/tools/fii-dii-history', 'FII/DII History', '365-day flow chart with Nifty'],
                          ['/features/sentiment', 'Sentiment', 'Fear/Greed & participant flows'],
                        ].map(([path, title, desc]) => (
                          <Link key={path} to={path} style={headerStyles.dropdownLink}>
                            <div style={headerStyles.dropdownTitle}>{title}</div>
                            <div style={headerStyles.dropdownDesc}>{desc}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>

                  <li style={headerStyles.navItem}>
                    <Link to="/tools" style={{ ...headerStyles.navLink, color: 'var(--color-primary)', fontWeight: 700 }}>🔧 Tools Hub</Link>
                  </li>
                  <li style={headerStyles.navItem}>
                    <Link to="/paper-trade" style={headerStyles.navLink}>Paper Trade <span className="badge-glow" style={{marginLeft: '6px', fontSize: '0.65rem', padding: '2px 4px', backgroundColor: '#3b82f6'}}>NEW</span></Link>
                  </li>
                  <li style={headerStyles.navItem}>
                    <Link to="/pricing" style={headerStyles.navLink}>Pricing</Link>
                  </li>

                  {/* Company Dropdown */}
                  <li style={headerStyles.navItem} onMouseEnter={() => setCompanyDropdownOpen(true)} onMouseLeave={() => setCompanyDropdownOpen(false)}>
                    <span style={headerStyles.navLink}>
                      Company <ChevronDown size={14} style={{ marginLeft: 4, transform: companyDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </span>
                    {companyDropdownOpen && (
                      <div style={headerStyles.dropdown}>
                        <Link to="/about-us" style={headerStyles.dropdownLink}>About Us</Link>
                        <Link to="/contact-us" style={headerStyles.dropdownLink}>Contact Us</Link>
                        <Link to="/privacy-policy" style={headerStyles.dropdownLink}>Privacy Policy</Link>
                        <Link to="/terms-conditions" style={headerStyles.dropdownLink}>Terms & Conditions</Link>
                      </div>
                    )}
                  </li>

                  <li style={headerStyles.navItem}>
                    <a href="https://chat.whatsapp.com/LO3eNiIvHRv1DNDaAmkPoG?s=cl&p=a&mlu=1" target="_blank" rel="noopener noreferrer" style={{ ...headerStyles.navLink, color: '#10b981', fontWeight: 600 }}>
                      WhatsApp
                    </a>
                  </li>
                </ul>
              </nav>

              {/* Right Side: Stock Search, Theme Selector & Auth */}
              <div style={headerStyles.rightContainer}>
                
                {/* Stock Search Bar */}
                <div ref={searchRef} style={headerStyles.searchContainer}>
                  <div style={headerStyles.searchBar}>
                    <Search size={14} style={headerStyles.searchIcon} />
                    <input 
                      type="text" 
                      placeholder="Search stocks..." 
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={headerStyles.searchInput}
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchQuery && (
                    <div style={headerStyles.searchResults}>
                      {searchResults.length > 0 ? (
                        searchResults.map((stock) => (
                          <div 
                            key={stock.symbol}
                            onClick={() => handleSelectStock(stock)}
                            style={headerStyles.searchItem}
                            className="search-item-hover"
                          >
                            <div>
                              <div style={headerStyles.searchSymbol}>{stock.symbol}</div>
                              <div style={headerStyles.searchName}>{stock.name}</div>
                            </div>
                            <div style={headerStyles.searchPriceContainer}>
                              <div style={headerStyles.searchPrice}>₹{stock.price.toFixed(2)}</div>
                              <div style={{
                                ...headerStyles.searchChange,
                                color: stock.change >= 0 ? '#10b981' : '#ef4444'
                              }}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={headerStyles.noResult}>No stocks found matching "{searchQuery}"</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Theme Selector */}
                <ThemeSelector />

                {/* Auth CTAs / User Profile Avatar */}
                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                  {currentUser && isTrialActive && (
                    <span className="badge-gold" style={{ marginRight: 8, fontSize: '0.7rem', padding: '3px 8px', backgroundColor: '#eab308', color: '#07080d', fontWeight: 'bold', borderRadius: '4px' }}>
                      Trial: {trialDaysLeft}d
                    </span>
                  )}
                  {currentUser ? (
                    <div 
                      style={headerStyles.profileWrapper} 
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <button 
                        style={headerStyles.avatarBtn} 
                        onMouseEnter={() => setProfileDropdownOpen(true)}
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      >
                        <span style={headerStyles.avatarText}>
                          {(userProfile?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
                        </span>
                      </button>

                      {profileDropdownOpen && (
                        <div style={headerStyles.profileDropdown}>
                          <div style={headerStyles.profileHeader}>
                            <div style={headerStyles.profileName}>
                              {userProfile?.displayName || 'Trader'}
                            </div>
                            <div style={headerStyles.profileEmail}>
                              {currentUser.email}
                            </div>
                            {isAdmin && (
                              <span className="badge-glow" style={{ fontSize: '0.65rem', marginTop: 4, display: 'inline-block' }}>
                                ADMIN
                              </span>
                            )}
                          </div>

                          <div style={headerStyles.profileMenu}>
                            {isAdmin && (
                              <Link 
                                to="/admin" 
                                style={headerStyles.profileMenuItem}
                                onClick={() => setProfileDropdownOpen(false)}
                              >
                                <Shield size={14} style={{ marginRight: 8 }} /> Admin Panel
                              </Link>
                            )}
                            <button 
                              onClick={() => { logout(); setProfileDropdownOpen(false); }} 
                              style={headerStyles.logoutBtn}
                            >
                              <LogOut size={14} style={{ marginRight: 8 }} /> Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button 
                        onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                        style={headerStyles.loginBtn}
                      >
                        Login
                      </button>
                      <button 
                        onClick={() => { setAuthModalTab('signup'); setIsAuthModalOpen(true); }}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        Get Started
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* Right Slice (Corner Curve) */}
          <div style={headerStyles.cornerRight}>
            <div style={{ ...headerStyles.cornerBg, clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }} />
            <svg style={headerStyles.cornerSvg} viewBox="0 0 50 64">
              <path d="M0 63.5 C25 63.5 25 39.5 50 39.5" fill="none" stroke="var(--border-light)" strokeWidth="1" />
              <path d="M0 60.5 C25 60.5 25 36.5 50 36.5" fill="none" stroke="var(--border-light)" strokeWidth="1" />
            </svg>
          </div>

        </div>

        {/* Right Side Bar - Flexible width */}
        <div style={headerStyles.sideBarRight}>
          <svg style={headerStyles.absSvg} preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="var(--border-light)" strokeWidth="1" />
            <line x1="0" y1="36.5" x2="100%" y2="36.5" stroke="var(--border-light)" strokeWidth="1" />
          </svg>
        </div>

      </header>

      {/* Mobile Menu Overlay with framer-motion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={headerStyles.mobileDrawer}
          >
            <ThemeSelector isMobile={true} />
            <div style={{ margin: '12px 0', borderBottom: '1px solid var(--border-light)' }} />
            
            <div style={headerStyles.mobileHeading}>Options Lab</div>
            <Link to="/tools/futures-dashboard" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Futures Dashboard <span className="badge-glow" style={{marginLeft: '6px', fontSize: '0.65rem', padding: '2px 4px'}}>NEW</span></Link>
            <Link to="/tools/option-chain" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Option Chain</Link>
            <Link to="/tools/open-interest" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Open Interest</Link>
            <Link to="/tools/put-call-ratio" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Put-Call Ratio</Link>
            <Link to="/tools/max-pain" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Max Pain</Link>
            
            <div style={headerStyles.mobileHeading}>Features</div>
            <Link to="/features/scanners" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Scanners</Link>
            <Link to="/features/heatmaps" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Heatmaps</Link>
            <Link to="/features/rrg" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>RRG</Link>
            <Link to="/features/sentiment" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Sentiment</Link>
            
            <div style={headerStyles.mobileHeading}>Company</div>
            <Link to="/about-us" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>About Us</Link>
            <Link to="/contact-us" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Contact Us</Link>
            <Link to="/privacy-policy" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Privacy Policy</Link>
            
            <div style={{ margin: '16px 0', borderBottom: '1px solid var(--border-light)' }} />
            
            {currentUser ? (
              <button onClick={() => { logout(); handleMobileLinkClick(); }} style={headerStyles.logoutBtn}>
                <LogOut size={14} style={{ marginRight: 6 }} /> Sign Out
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} style={{ ...headerStyles.loginBtn, flex: 1 }}>
                  Login
                </button>
                <button onClick={() => { setAuthModalTab('signup'); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Get Started
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialTab={authModalTab} 
      />

      {/* 7-Day Trial Started Popup Modal */}
      {showTrialPopup && (
        <div style={headerStyles.trialModalOverlay}>
          <div className="glass-card animate-fade-in" style={headerStyles.trialModal}>
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <Activity size={32} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: 12 }}>
                🎉 7-Day Free Trial Started!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                Welcome to <strong>Earn With Us</strong>! Your trial has successfully started. Access all pro tools:
              </p>
              
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
                onClick={() => {
                  localStorage.setItem('trial_popup_shown_' + currentUser.uid, 'true');
                  setShowTrialPopup(false);
                }}
              >
                Let's Start Exploring!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Inline CSS Styles for Notch Header
const headerStyles = {
  notchHeader: {
    position: 'sticky',
    top: 0,
    insetX: 0,
    zIndex: 100,
    height: '64px',
    display: 'flex',
    backdropFilter: 'blur(16px)',
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
  absSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  notchContainer: {
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
  centerContent: {
    flex: 1,
    height: '100%',
    position: 'relative',
    minWidth: '820px',
  },
  centerBg: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--bg-header)',
  },
  contentLayer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    gap: '20px',
    alignItems: 'center',
  },
  navItem: {
    position: 'relative',
  },
  navLink: {
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'var(--bg-dropdown)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    width: '260px',
    padding: '12px',
    boxShadow: 'var(--shadow-premium)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    zIndex: 100,
  },
  dropdownSection: {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '2px',
  },
  dropdownLink: {
    padding: '6px 8px',
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
  rightContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchContainer: {
    position: 'relative',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '9999px',
    padding: '4px 10px',
    width: '160px',
  },
  searchIcon: {
    color: 'var(--text-muted)',
    marginRight: '6px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.78rem',
    width: '100%',
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'var(--bg-dropdown)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    width: '240px',
    marginTop: '6px',
    boxShadow: 'var(--shadow-premium)',
    zIndex: 100,
    maxHeight: '280px',
    overflowY: 'auto',
  },
  searchItem: {
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-light)',
  },
  searchSymbol: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  searchName: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  searchPriceContainer: {
    textAlign: 'right',
  },
  searchPrice: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  searchChange: {
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  noResult: {
    padding: '12px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  hamburgerBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  loginBtn: {
    background: 'none',
    border: '1px solid var(--border-light)',
    color: 'var(--text-primary)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  profileWrapper: {
    position: 'relative',
  },
  avatarBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.85rem',
  },
  profileDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'var(--bg-dropdown)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    width: '200px',
    marginTop: '6px',
    boxShadow: 'var(--shadow-premium)',
    zIndex: 100,
  },
  profileHeader: {
    padding: '12px',
    borderBottom: '1px solid var(--border-light)',
  },
  profileName: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  profileEmail: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  profileMenu: {
    padding: '6px',
  },
  profileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    borderRadius: '6px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 10px',
    fontSize: '0.8rem',
    color: '#ef4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
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
    gap: '10px',
  },
  mobileHeading: {
    fontSize: '0.72rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '8px',
  },
  mobileLink: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    textDecoration: 'none',
  },
  trialModalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  trialModal: {
    maxWidth: '440px',
    width: '100%',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '24px',
  }
};
