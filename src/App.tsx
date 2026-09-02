import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

import { emailService } from './services/emailService';
import { EmailDispatchRecord } from './types';
import { Mail, CheckCircle2 } from 'lucide-react';

// Pages
import { LoginPage } from './pages/login/LoginPage';
import { CommandCenter } from './pages/company/CommandCenter';
import { AssetDashboard } from './pages/company/AssetDashboard';
import { SiteOperations } from './pages/company/SiteOperations';
import { CheckInOut } from './pages/company/CheckInOut';
import { EquipmentUsage } from './pages/company/EquipmentUsage';
import { UsageAnalytics } from './pages/company/UsageAnalytics';
import { DemandForecast } from './pages/company/DemandForecast';
import { AlertsAnomalies } from './pages/company/AlertsAnomalies';
import { RecommendationsQueue } from './pages/company/RecommendationsQueue';
import { CatIntelligenceChat } from './pages/company/CatIntelligenceChat';
import { CompanySettings } from './pages/company/CompanySettings';
import { CustomerPortal } from './pages/customer/CustomerPortal';

const AutoEmailToast: React.FC = () => {
  const [latestDispatch, setLatestDispatch] = useState<EmailDispatchRecord | null>(null);

  useEffect(() => {
    return emailService.subscribeToDispatches(record => {
      setLatestDispatch(record);
      const timer = setTimeout(() => {
        setLatestDispatch(null);
      }, 6000);
      return () => clearTimeout(timer);
    });
  }, []);

  if (!latestDispatch) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#1A1F2C',
        border: '1px solid #FFCD11',
        borderRadius: '8px',
        padding: '0.875rem 1.25rem',
        boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(255, 205, 17, 0.2)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '440px'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 205, 17, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Mail size={18} color="#FFCD11" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#FFCD11', textTransform: 'uppercase' }}>
            ⚡ Auto-Email Alert Dispatched
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)' }}>{latestDispatch.timestamp}</span>
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {latestDispatch.subject}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-secondary)' }}>
          To: <strong style={{ color: '#34D399' }}>{latestDispatch.recipientEmail}</strong>
        </div>
      </div>

      <button
        onClick={() => setLatestDispatch(null)}
        style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.25rem', padding: '0 0.25rem' }}
      >
        &times;
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { session, isAuthenticated, role } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronize route changes with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Redirect handling for root and legacy alias paths
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (role === 'company') {
        navigate('/company/overview');
      } else if (role === 'customer') {
        navigate('/customer/portal');
      }
    } else if (currentPath === '/dashboard') {
      navigate('/company/overview');
    }
  }, [currentPath, isAuthenticated, role]);

  // If not authenticated, always show Login page
  if (!isAuthenticated || currentPath === '/login') {
    return <LoginPage />;
  }

  // If Customer Role, show Customer Portal directly
  if (role === 'customer') {
    return (
      <ProtectedRoute allowedRole="customer">
        <CustomerPortal />
        <AutoEmailToast />
      </ProtectedRoute>
    );
  }

  // Company Portal Experience
  return (
    <ProtectedRoute allowedRole="company">
      <div className="app-container">
        {/* Company Sidebar */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={navigate}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <div className="main-content">
          {/* Top Navbar */}
          <Navbar
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          {/* Page Routing */}
          <div style={{ flex: 1 }}>
            {currentPath === '/company/overview' && <CommandCenter onNavigate={navigate} />}
            {currentPath === '/company/assets' && <AssetDashboard onNavigate={navigate} />}
            {currentPath === '/company/sites' && <SiteOperations onNavigate={navigate} />}
            {currentPath === '/company/checkin-checkout' && <CheckInOut />}
            {currentPath === '/company/equipment-usage' && <EquipmentUsage />}
            {currentPath === '/company/analytics' && <UsageAnalytics />}
            {currentPath === '/company/forecast' && <DemandForecast onNavigate={navigate} />}
            {currentPath === '/company/alerts' && <AlertsAnomalies onNavigate={navigate} />}
            {currentPath === '/company/recommendations' && <RecommendationsQueue />}
            {currentPath === '/company/chat' && <CatIntelligenceChat />}
            {currentPath === '/company/settings' && <CompanySettings />}

            {/* Fallback to Overview */}
            {![
              '/company/overview',
              '/company/assets',
              '/company/sites',
              '/company/checkin-checkout',
              '/company/equipment-usage',
              '/company/analytics',
              '/company/forecast',
              '/company/alerts',
              '/company/recommendations',
              '/company/chat',
              '/company/settings'
            ].includes(currentPath) && <CommandCenter onNavigate={navigate} />}
          </div>
        </div>

        {/* Global Real-Time Auto-Email Dispatch Toast */}
        <AutoEmailToast />
      </div>
    </ProtectedRoute>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
