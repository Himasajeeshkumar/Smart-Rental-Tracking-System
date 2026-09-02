import React from 'react';
import {
  LayoutDashboard,
  Truck,
  MapPin,
  QrCode,
  Gauge,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Zap,
  MessageSquare,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CatLogo } from './CatLogo';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { logout, session } = useAuth();

  const navItems = [
    { path: '/company/overview', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
    { path: '/company/assets', label: 'Asset Dashboard', icon: <Truck size={18} /> },
    { path: '/company/sites', label: 'Site Operations & Map', icon: <MapPin size={18} /> },
    { path: '/company/checkin-checkout', label: 'Check-In / Check-Out', icon: <QrCode size={18} /> },
    { path: '/company/equipment-usage', label: 'Equipment Usage', icon: <Gauge size={18} /> },
    { path: '/company/analytics', label: 'Usage & Analytics', icon: <BarChart3 size={18} /> },
    { path: '/company/forecast', label: 'Demand Forecast', icon: <TrendingUp size={18} /> },
    { path: '/company/alerts', label: 'Alerts & Anomalies', icon: <AlertTriangle size={18} /> },
    { path: '/company/recommendations', label: 'Action Queue', icon: <Zap size={18} /> },
    { path: '/company/chat', label: 'CAT Intelligence', icon: <MessageSquare size={18} /> },
    { path: '/company/settings', label: 'Company Settings', icon: <Settings size={18} /> }
  ];

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
          className="md:hidden"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--cat-dark-800)',
          borderRight: '1px solid var(--cat-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 95,
          position: isOpenMobile ? 'fixed' : 'relative',
          top: isOpenMobile ? 0 : 'auto',
          bottom: isOpenMobile ? 0 : 'auto',
          left: isOpenMobile ? 0 : 'auto',
          height: '100vh',
          transform: isOpenMobile ? 'translateX(0)' : undefined
        }}
        className={isOpenMobile ? 'block' : 'hide-on-mobile'}
      >
        <div>
          {/* Mobile Header in Drawer */}
          {isOpenMobile && (
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid var(--cat-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <CatLogo size="sm" />
              <button
                onClick={onCloseMobile}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Section Header */}
          <div
            style={{
              padding: '1.25rem 1rem 0.5rem 1rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--cat-text-muted)',
              textTransform: 'uppercase'
            }}
          >
            Fleet Operations Suite
          </div>

          {/* Nav List */}
          <nav style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map(item => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#000000' : 'var(--cat-text-secondary)',
                    backgroundColor: isActive ? '#FFCD11' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 0 12px rgba(255, 205, 17, 0.35)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--cat-dark-700)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--cat-text-secondary)';
                    }
                  }}
                >
                  <span style={{ color: isActive ? '#000000' : '#FFCD11', display: 'flex' }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Session Section */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--cat-border)',
            backgroundColor: 'var(--cat-dark-900)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF' }}>
                COMPANY OPERATOR
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--cat-text-muted)',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {session?.email}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="cat-btn-danger"
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
