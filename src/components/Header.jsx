import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, TrendingUp, TrendingDown, Star, Activity, User, LogOut, Shield, Grid } from 'lucide-react';
import { searchStocks } from '../data/mockStocks';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import Logo from './Logo';

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
      
      // Clean query params
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
      <header className="header-main" style={headerStyles.header}>
      <div className="page-wrapper" style={headerStyles.wrapper}>
        
        {/* Left Side: Toggle & Logo */}
        <div style={headerStyles.leftContainer}>
          <button 
            style={headerStyles.hamburger}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <Link to="/" style={headerStyles.logoContainer}>
            <Logo size={32} />
            <span style={headerStyles.logoText}>
              Earn <span style={{ color: '#10b981' }}>With Us</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-only" style={headerStyles.nav}>
          <ul style={headerStyles.navList}>

            {/* Options Lab Dropdown */}
            <li style={headerStyles.navItem} onMouseEnter={() => setOptionsLabOpen(true)} onMouseLeave={() => setOptionsLabOpen(false)}>
              <span style={headerStyles.navLink}>
                Options Lab <ChevronDown size={14} style={{ marginLeft: 4, transform: optionsLabOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </span>
              {optionsLabOpen && (
                <div style={{ ...headerStyles.dropdown, width: 320 }}>
                  <div style={headerStyles.dropdownSection}>Core Tools</div>
                  {[
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

            {/* Market Internals Dropdown */}
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

            {/* Features Dropdown */}
            <li style={headerStyles.navItem} onMouseEnter={() => setFeaturesDropdownOpen(true)} onMouseLeave={() => setFeaturesDropdownOpen(false)}>
              <span style={headerStyles.navLink}>
                Features <ChevronDown size={14} style={{ marginLeft: 4, transform: featuresDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </span>
              {featuresDropdownOpen && (
                <div style={headerStyles.dropdown}>
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
                  <Link to="/features/futures-options" style={headerStyles.dropdownLink}>
                    <div style={headerStyles.dropdownTitle}>Futures & Options</div>
                    <div style={headerStyles.dropdownDesc}>OI insights & option chains</div>
                  </Link>
                  <Link to="/strategies" style={headerStyles.dropdownLink}>
                    <div style={headerStyles.dropdownTitle}>Strategies</div>
                    <div style={headerStyles.dropdownDesc}>Option strategy builder</div>
                  </Link>
                </div>
              )}
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
              <Link to="/tools" style={{ ...headerStyles.navLink, color: '#C2FA4F', fontWeight: 700 }}>🔧 Tools Hub</Link>
            </li>
            <li style={headerStyles.navItem}>
              <Link to="/paper-trade" style={headerStyles.navLink}>Paper Trade <span className="badge-glow" style={{marginLeft: '6px', fontSize: '0.65rem', padding: '2px 4px', backgroundColor: '#3b82f6'}}>NEW</span></Link>
            </li>
            <li style={headerStyles.navItem}>
              <Link to="/pricing" style={headerStyles.navLink}>Pricing</Link>
            </li>
            <li style={headerStyles.navItem}>
              <a href="https://chat.whatsapp.com/LO3eNiIvHRv1DNDaAmkPoG?s=cl&p=a&mlu=1" target="_blank" rel="noopener noreferrer" style={{ ...headerStyles.navLink, color: '#10b981', fontWeight: 600 }}>
                WhatsApp
              </a>
            </li>
          </ul>
        </nav>

        {/* Right Side: Search and Login CTAs */}
        <div style={headerStyles.rightContainer}>
          
          {/* Stock Search Bar */}
          <div ref={searchRef} style={headerStyles.searchContainer}>
            <div style={headerStyles.searchBar}>
              <Search size={16} style={headerStyles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search stocks (e.g., RELIANCE)..." 
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

          {/* Action CTAs */}
          <div className="desktop-only" style={headerStyles.actions}>
            {currentUser && isTrialActive && (
              <span className="badge-gold" style={{ marginRight: 12, fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', backgroundColor: '#eab308', color: '#07080d', fontWeight: 'bold', borderRadius: '4px' }}>
                Trial: {trialDaysLeft}d left
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
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {userProfile?.displayName || 'Trader'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {currentUser.email}
                      </div>
                      {isAdmin && (
                        <span className="badge-glow" style={{ fontSize: '0.6rem', marginTop: 6, display: 'inline-block', padding: '2px 6px' }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }}></div>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        style={headerStyles.profileLink}
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Shield size={12} style={{ marginRight: 6 }} /> Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => { logout(); setProfileDropdownOpen(false); }}
                      style={headerStyles.signOutBtn}
                    >
                      <LogOut size={12} style={{ marginRight: 6 }} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                  style={headerStyles.loginBtn}
                >
                  Login
                </button>
                <button 
                  onClick={() => { setAuthModalTab('signup'); setIsAuthModalOpen(true); }}
                  className="btn-primary" 
                  style={headerStyles.getStartedBtn}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div style={headerStyles.mobileDrawer}>
          <div style={headerStyles.mobileDrawerHeader}>
            <span style={headerStyles.logoText}>Earn <span style={{ color: '#10b981' }}>With Us</span></span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={headerStyles.drawerCloseBtn}
            >
              <X size={24} />
            </button>
          </div>
          <div style={headerStyles.mobileDrawerBody}>
            <div style={headerStyles.mobileHeading}>Options Lab</div>
            <Link to="/tools/option-chain" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Option Chain</Link>
            <Link to="/tools/open-interest" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Open Interest</Link>
            <Link to="/tools/put-call-ratio" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Put-Call Ratio</Link>
            <Link to="/tools/straddle-chart" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Straddle Chart</Link>
            <Link to="/tools/premium-decay" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Premium Decay</Link>
            <Link to="/tools/max-pain" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Max Pain</Link>
            <Link to="/tools/pe-ce-difference" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>PE-CE Difference</Link>
            <Link to="/tools/iv-analysis" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>IV / HV Analysis</Link>
            <Link to="/tools/gamma-exposure" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Gamma Exposure</Link>
            <Link to="/tools/price-vs-oi" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Price vs OI</Link>
            <Link to="/tools/multistrike" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>MultiStrike Chart</Link>

            <div style={headerStyles.mobileHeading}>Market</div>
            <Link to="/tools/market-movers" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Market Movers</Link>
            <Link to="/tools/advance-decline" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Advance / Decline</Link>
            <Link to="/tools/index-contributors" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Index Contributors</Link>
            <Link to="/tools/fii-dii-history" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>FII/DII History</Link>

            <div style={headerStyles.mobileHeading}>Features</div>
            <Link to="/features/scanners" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Scanners</Link>
            <Link to="/features/heatmaps" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Heatmaps</Link>
            <Link to="/features/rrg" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Relative Rotation Graph (RRG)</Link>
            <Link to="/features/sentiment" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Sentiment Indicators</Link>
            <Link to="/features/futures-options" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Futures & Options</Link>
            <Link to="/strategies" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Strategies</Link>
            
            <div style={headerStyles.mobileHeading}>Company</div>
            <Link to="/about-us" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>About Us</Link>
            <Link to="/contact-us" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Contact Us</Link>
            <Link to="/privacy-policy" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Privacy Policy</Link>
            <Link to="/terms-conditions" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>T & C</Link>
            
            <div style={{ margin: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }} />
            
            <Link to="/paper-trade" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Paper Trade <span className="badge-glow" style={{marginLeft: '6px', fontSize: '0.65rem', padding: '2px 4px', backgroundColor: '#3b82f6'}}>NEW</span></Link>
            <Link to="/strategies" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Strategies</Link>
            <Link to="/pricing" onClick={handleMobileLinkClick} style={headerStyles.mobileLink}>Pricing</Link>
            <a 
              href="https://chat.whatsapp.com/LO3eNiIvHRv1DNDaAmkPoG?s=cl&p=a&mlu=1" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleMobileLinkClick} 
              style={{ ...headerStyles.mobileLink, color: '#10b981', fontWeight: 'bold' }}
            >
              💬 WhatsApp Group
            </a>
            
            <div style={headerStyles.drawerFooter}>
              {currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                      {userProfile?.displayName || 'Trader'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>
                      {currentUser.email}
                    </div>
                    {isAdmin && (
                      <span className="badge-glow" style={{ fontSize: '0.6rem', marginTop: 6, display: 'inline-block', padding: '2px 6px' }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={handleMobileLinkClick} 
                      className="btn-primary" 
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Shield size={14} style={{ marginRight: 6 }} /> Admin Panel
                    </Link>
                  )}
                  <button 
                    onClick={() => { logout(); handleMobileLinkClick(); }} 
                    style={headerStyles.mobileLoginBtn}
                  >
                    <LogOut size={14} style={{ marginRight: 6 }} /> Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => { setAuthModalTab('signup'); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} 
                    style={headerStyles.mobileLoginBtn}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      </header>

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
              <h2 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800, marginBottom: 12 }}>
                🎉 7-Day Free Trial Started!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                Welcome to <strong>Earn With Us</strong>! Your trial has successfully started. For the next 7 days, you have unrestricted access to all our pro capabilities:
              </p>
              
              <div style={{
                textAlign: 'left',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Real-Time Stock Scanners & Filters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Interactive Sector Performance Heatmaps
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Relative Rotation Graph (RRG) Visualizations
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Option Chain Matrix & Paper Trading
                </div>
              </div>
              
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


// Inline CSS Styles for absolute component fidelity
const headerStyles = {
  header: {
    backgroundColor: 'rgba(7, 8, 13, 0.85)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(16px)',
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '76px',
  },
  leftContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'none', // Managed by responsive CSS below or media queries
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    backgroundColor: '#10b981',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    fontSize: '1.4rem',
    color: '#ffffff',
    letterSpacing: '-0.03em',
  },
  nav: {
    marginLeft: '36px',
    flexGrow: 1,
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    gap: '24px',
  },
  navItem: {
    position: 'relative',
  },
  navLink: {
    color: '#94a3b8',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    width: '260px',
    padding: '12px',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    animation: 'fadeIn 0.2s ease',
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 200,
  },
  dropdownSection: {
    fontSize: '0.68rem',
    color: '#9470F8',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    padding: '8px 12px 4px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    marginTop: 4,
  },
  dropdownLink: {
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    display: 'block',
    transition: '0.15s ease',
  },
  dropdownTitle: {
    fontWeight: 600,
    color: '#ffffff',
  },
  dropdownDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
  },
  rightContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  searchContainer: {
    position: 'relative',
    width: '260px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '9999px',
    padding: '8px 16px',
    width: '100%',
  },
  searchIcon: {
    color: '#64748b',
    marginRight: '8px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '0.85rem',
    width: '100%',
  },
  searchResults: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    width: '320px',
    maxHeight: '380px',
    overflowY: 'auto',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
  },
  searchItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.15s ease',
  },
  searchSymbol: {
    fontWeight: 700,
    color: '#ffffff',
    fontSize: '0.9rem',
  },
  searchName: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
  },
  searchPriceContainer: {
    textAlign: 'right',
  },
  searchPrice: {
    fontWeight: 600,
    color: '#ffffff',
    fontSize: '0.85rem',
  },
  searchChange: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  noResult: {
    padding: '16px',
    color: '#64748b',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  loginBtn: {
    color: '#94a3b8',
    fontWeight: 500,
    fontSize: '0.9rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    fontFamily: 'inherit',
    transition: '0.15s ease',
  },
  getStartedBtn: {
    padding: '10px 20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
  },
  
  // Mobile Drawer
  mobileDrawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '300px',
    height: '100vh',
    backgroundColor: '#0a0b10',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
    zIndex: 200,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s ease',
  },
  mobileDrawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  drawerCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
  },
  mobileDrawerBody: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    flexGrow: 1,
  },
  mobileHeading: {
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '20px',
    marginBottom: '8px',
  },
  mobileLink: {
    color: '#ffffff',
    fontSize: '1.05rem',
    fontWeight: 500,
    padding: '10px 0',
    display: 'block',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingTop: '20px',
  },
  mobileLoginBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: 500,
    background: 'none',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
  },
  profileWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  avatarBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    border: '2px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)',
  },
  avatarText: {
    color: '#0d0f17',
    fontWeight: 800,
    fontSize: '0.95rem',
  },
  profileDropdown: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    width: '220px',
    padding: '8px',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  profileHeader: {
    padding: '12px 14px',
  },
  profileLink: {
    padding: '10px 14px',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    transition: '0.15s ease',
    textDecoration: 'none',
  },
  signOutBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: '0.15s ease',
  },
  trialModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 4, 7, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  trialModal: {
    maxWidth: '480px',
    width: '100%',
    padding: '36px',
    backgroundColor: '#0d0f17',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  }
};
