import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AlertCircle, Download, X } from 'lucide-react';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import StockModal from './components/StockModal';

// Context
import { AuthProvider } from './context/AuthContext';
import { PaperTradeProvider } from './context/PaperTradeContext';

// Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Scanners from './pages/Scanners';
import Heatmaps from './pages/Heatmaps';
import RRG from './pages/RRG';
import Sentiment from './pages/Sentiment';
import FuturesOptions from './pages/FuturesOptions';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Strategies from './pages/Strategies';
import AdminDashboard from './pages/AdminDashboard';
import PaperTrade from './pages/PaperTrade';

// Helper component to auto-scroll window to top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainApp() {
  const [selectedStockForModal, setSelectedStockForModal] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [simulatedInstallSuccess, setSimulatedInstallSuccess] = useState(false);

  // Monitor PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also show install option on mobile viewports after 5 seconds as a simulated highlight
    const isMobile = window.innerWidth <= 768;
    const timer = setTimeout(() => {
      if (isMobile && !localStorage.getItem('pwa_installed')) {
        setShowInstallBanner(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback/Simulated PWA Installation
      setSimulatedInstallSuccess(true);
      localStorage.setItem('pwa_installed', 'true');
      setTimeout(() => {
        setShowInstallBanner(false);
        setSimulatedInstallSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="app-container">
      <ScrollToTop />
      
      {/* Mobile App Install Banner */}
      {showInstallBanner && (
        <div style={appStyles.installBanner}>
          <div style={appStyles.bannerContent}>
            <Download size={18} color="#10b981" />
            <span style={appStyles.bannerText}>
              {simulatedInstallSuccess 
                ? "🎉 Earn With Us installed to Home Screen!"
                : "Install Earn With Us App on your mobile for real-time alerts!"
              }
            </span>
          </div>
          <div style={appStyles.bannerActions}>
            {!simulatedInstallSuccess && (
              <button onClick={handleInstallApp} className="badge-glow" style={appStyles.bannerBtn}>
                Install
              </button>
            )}
            <button onClick={() => setShowInstallBanner(false)} style={appStyles.bannerClose}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Header setSelectedStockForModal={setSelectedStockForModal} />

      {/* Pages Container */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home setSelectedStockForModal={setSelectedStockForModal} />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features/scanners" element={<Scanners setSelectedStockForModal={setSelectedStockForModal} />} />
          <Route path="/features/heatmaps" element={<Heatmaps setSelectedStockForModal={setSelectedStockForModal} />} />
          <Route path="/features/rrg" element={<RRG setSelectedStockForModal={setSelectedStockForModal} />} />
          <Route path="/features/sentiment" element={<Sentiment />} />
          <Route path="/features/futures-options" element={<FuturesOptions setSelectedStockForModal={setSelectedStockForModal} />} />
          <Route path="/paper-trade" element={<PaperTrade />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Common Stock Details Modal */}
      {selectedStockForModal && (
        <StockModal 
          stock={selectedStockForModal} 
          onClose={() => setSelectedStockForModal(null)} 
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PaperTradeProvider>
          <MainApp />
        </PaperTradeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const appStyles = {
  installBanner: {
    backgroundColor: '#0d0f17',
    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '10px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
    position: 'sticky',
    top: 0,
    animation: 'fadeIn 0.3s ease',
    flexWrap: 'wrap',
    gap: '8px',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bannerText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#ffffff',
  },
  bannerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bannerBtn: {
    border: 'none',
    cursor: 'pointer',
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  bannerClose: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  }
};
