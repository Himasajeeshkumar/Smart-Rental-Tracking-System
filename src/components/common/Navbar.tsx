import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { CatLogo } from './CatLogo';
import { Bell, LogOut, Shield, User, Menu, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { NotificationAlert } from '../../types';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { session, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    setNotifications(dataService.getNotifications());
    const unsub = dataService.subscribe(() => {
      setNotifications([...dataService.getNotifications()]);
    });
    return unsub;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    notifications.forEach(n => dataService.markNotificationAsRead(n.id));
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--cat-dark-800)',
        borderBottom: '1px solid var(--cat-border)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%'
      }}
    >
      {/* Left: Mobile Toggle & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cat-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: '6px'
            }}
            className="md:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        <CatLogo size="sm" showSubtitle={false} />

        {/* Operational Status Pill (Desktop only) */}
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            color: '#34D399',
            fontWeight: 600
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }}></span>
          <span>TELEMETRY ONLINE</span>
        </div>
      </div>

      {/* Right: Role, Alerts, Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: session?.role === 'company' ? 'rgba(255, 205, 17, 0.12)' : 'rgba(59, 130, 246, 0.12)',
            border: `1px solid ${session?.role === 'company' ? 'rgba(255, 205, 17, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.725rem',
            fontWeight: 700,
            color: session?.role === 'company' ? '#FFCD11' : '#60A5FA',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          <Shield size={13} />
          <span>{session?.role === 'company' ? 'Company Ops' : `Operator ${session?.operatorId || ''}`}</span>
        </div>

        {/* Company Notification Bell (Only for company role) */}
        {session?.role === 'company' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              style={{
                background: 'var(--cat-dark-700)',
                border: '1px solid var(--cat-border)',
                color: 'var(--cat-text-primary)',
                padding: '0.45rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              title="Operational Alerts"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--cat-dark-800)'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '320px',
                  backgroundColor: 'var(--cat-dark-800)',
                  border: '1px solid var(--cat-border)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--cat-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--cat-dark-700)'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Alert Notifications ({unreadCount} new)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: '#FFCD11', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => dataService.markNotificationAsRead(n.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid rgba(38, 46, 59, 0.4)',
                        backgroundColor: n.read ? 'transparent' : 'rgba(255, 205, 17, 0.04)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {n.severity === 'critical' ? (
                          <AlertTriangle size={15} color="#EF4444" />
                        ) : (
                          <Clock size={15} color="#F59E0B" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: n.read ? 'var(--cat-text-secondary)' : '#FFFFFF' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px' }}>
                          {n.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--cat-dark-700)',
                    borderTop: '1px solid var(--cat-border)'
                  }}
                >
                  <a
                    href="/company/alerts"
                    style={{ fontSize: '0.75rem', color: '#FFCD11', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View All Operational Alerts &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Info (Email) */}
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.65rem',
            backgroundColor: 'var(--cat-dark-700)',
            borderRadius: '6px',
            border: '1px solid var(--cat-border)'
          }}
        >
          <User size={14} color="#9CA3AF" />
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session?.email}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#F87171',
            padding: '0.45rem 0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
          title="Sign Out of Session"
        >
          <LogOut size={15} />
          <span className="hide-on-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
};
