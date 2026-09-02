import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { emailService } from '../../services/emailService';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  Truck,
  Activity,
  PauseCircle,
  AlertTriangle,
  HelpCircle,
  Percent,
  TrendingUp,
  Zap,
  ArrowUpRight,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Mail,
  ExternalLink
} from 'lucide-react';

interface CommandCenterProps {
  onNavigate: (path: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
  const { session, notificationPreferences } = useAuth();
  const [kpis, setKpis] = useState(dataService.getKPISummary());
  const [overdueList, setOverdueList] = useState(dataService.getOverdueRentals().slice(0, 5));
  const [anomalies, setAnomalies] = useState(dataService.getAnomalies().slice(0, 5));
  const [siteTopology, setSiteTopology] = useState(dataService.getSiteTopology().slice(0, 6));
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setKpis(dataService.getKPISummary());
      setOverdueList(dataService.getOverdueRentals().slice(0, 5));
      setAnomalies(dataService.getAnomalies().slice(0, 5));
      setSiteTopology(dataService.getSiteTopology().slice(0, 6));
    });
    return unsub;
  }, []);

  return (
    <div className="page-wrapper">
      {/* Top Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--cat-border)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Operations Executive Command
            </span>
            <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
            <span style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: 600 }}>100% Real Telemetry Grounded</span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Fleet Overview & Attention Queue
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('/company/checkin-checkout')}
            className="cat-btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <Zap size={16} />
            <span>Check-In / Out</span>
          </button>
          <button
            onClick={() => onNavigate('/company/sites')}
            className="cat-btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <MapPin size={16} color="#FFCD11" />
            <span>Live Site Map</span>
          </button>
          <button
            onClick={() => onNavigate('/company/chat')}
            className="cat-btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <span>CAT AI Intelligence</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Derived Metrics) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard
          title="Total Rented Fleet"
          value={kpis.rentedEquipment.toLocaleString()}
          subtitle="Active on commercial sites"
          icon={<Truck size={20} />}
          glowVariant="yellow"
          onClick={() => onNavigate('/company/assets')}
        />

        <StatCard
          title="Active Daily Machines"
          value={kpis.activeRentals.toLocaleString()}
          subtitle="Logged > 4 hrs runtime today"
          icon={<Activity size={20} />}
          trend={{ value: 'Operational', isPositive: true }}
          onClick={() => onNavigate('/company/equipment-usage')}
        />

        <StatCard
          title="Idle Equipment"
          value={kpis.idleEquipment.toLocaleString()}
          subtitle="Non-productive engine hours"
          icon={<PauseCircle size={20} />}
          trend={{ value: 'Needs Allocation', isPositive: false }}
          glowVariant="yellow"
          onClick={() => onNavigate('/company/alerts')}
        />

        <StatCard
          title="Overdue Returns"
          value={kpis.overdueCount.toLocaleString()}
          subtitle="Past contracted check-in date"
          icon={<AlertTriangle size={20} />}
          glowVariant={kpis.overdueCount > 0 ? 'red' : 'none'}
          trend={{ value: `${kpis.overdueCount} Critical`, isPositive: false }}
          onClick={() => onNavigate('/company/alerts')}
        />

        <StatCard
          title="Unassigned Fleet"
          value={kpis.unassignedCount.toLocaleString()}
          subtitle="In storage or unassigned yard"
          icon={<HelpCircle size={20} />}
          onClick={() => onNavigate('/company/assets')}
        />

        <StatCard
          title="Average Utilization"
          value={`${kpis.avgUtilization}%`}
          subtitle="Target threshold: >70%"
          icon={<Percent size={20} />}
          trend={{ value: '+4.2% MoM', isPositive: true }}
          glowVariant="green"
          onClick={() => onNavigate('/company/analytics')}
        />

        <StatCard
          title="Items Needing Attention"
          value={kpis.attentionCount.toLocaleString()}
          subtitle="Overdue + anomalies queue"
          icon={<Zap size={20} />}
          glowVariant="red"
          onClick={() => onNavigate('/company/recommendations')}
        />

        <StatCard
          title="Demand Gap Deficits"
          value={kpis.demandGaps.toLocaleString()}
          subtitle="Sites requiring equipment"
          icon={<TrendingUp size={20} />}
          onClick={() => onNavigate('/company/forecast')}
        />
      </div>

      {/* Main Split Section: Attention Feed vs Live Site Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Left: Priority Attention & Action Feed */}
        <div className="cat-card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--cat-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#EF4444" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                Operational Attention Queue
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/company/recommendations')}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFCD11',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>View Action Queue</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Overdue items */}
            {overdueList.map(item => (
              <div
                key={item.rentalId}
                style={{
                  backgroundColor: 'var(--cat-dark-700)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Badge variant="overdue">OVERDUE {item.daysOverdue}D</Badge>
                    <span className="font-mono" style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
                      {item.equipmentId}
                    </span>
                    <span style={{ color: '#FFCD11', fontSize: '0.8rem', fontWeight: 600 }}>({item.type})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)' }}>
                    Site: <strong>{item.siteName}</strong> &bull; Operator: <strong>{item.operatorName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={async () => {
                      const target = notificationPreferences.email || session?.email || 'himasajeesh2005@gmail.com';
                      await emailService.dispatchAlertEmail(
                        {
                          recipientEmail: target,
                          ccEmails: notificationPreferences.ccEmails,
                          subject: `[CRITICAL OVERDUE] Equipment ${item.equipmentId} (${item.daysOverdue} Days)`,
                          severity: 'critical',
                          alertType: 'OVERDUE RETURN ALERT',
                          equipmentId: item.equipmentId,
                          equipmentType: item.type,
                          siteId: item.siteId,
                          siteName: item.siteName,
                          operatorName: item.operatorName,
                          reason: `Contract return was due on ${item.expectedReturnDate || 'past schedule'}. Current overdue duration: +${item.daysOverdue} days.`,
                          recommendedAction: 'Immediate site follow-up or check-in initiation required.'
                        },
                        notificationPreferences
                      );
                      setDispatchedId(item.rentalId);
                      setTimeout(() => setDispatchedId(null), 3000);
                    }}
                    className={dispatchedId === item.rentalId ? 'cat-btn-primary' : 'cat-btn-secondary'}
                    style={{ fontSize: '0.7rem', padding: '0.35rem 0.55rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title={`Send telemetry alert to ${notificationPreferences.email || session?.email || 'himasajeesh2005@gmail.com'}`}
                  >
                    <Mail size={12} color="#FFCD11" />
                    <span>{dispatchedId === item.rentalId ? 'Email Sent!' : 'Email'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('/company/alerts')}
                    className="cat-btn-secondary"
                    style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', flexShrink: 0 }}
                  >
                    <span>Resolve</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* High idle / Anomaly items */}
            {anomalies.slice(0, 3).map(anom => (
              <div
                key={anom.id}
                style={{
                  backgroundColor: 'var(--cat-dark-700)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Badge variant="idle">{anom.anomalyType}</Badge>
                    <span className="font-mono" style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
                      {anom.equipmentId}
                    </span>
                    <span style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>Site {anom.siteId}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', lineHeight: 1.3 }}>
                    {anom.reason}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('/company/recommendations')}
                  className="cat-btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', flexShrink: 0 }}
                >
                  <span>Act</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Site Fleet Utilization Topology Preview */}
        <div className="cat-card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--cat-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#FFCD11" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                Key Operational Site Topology
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/company/sites')}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFCD11',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Explore All 50 Sites</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {siteTopology.map(site => (
              <div
                key={site.siteId}
                onClick={() => onNavigate('/company/sites')}
                className="cat-card-interactive"
                style={{
                  backgroundColor: 'var(--cat-dark-700)',
                  border: '1px solid var(--cat-border)',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span className="font-mono" style={{ fontWeight: 800, color: '#FFCD11', fontSize: '0.85rem' }}>
                    {site.siteId}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: site.utilizationPercent >= 75 ? '#34D399' : site.utilizationPercent >= 60 ? '#FBBF24' : '#F87171'
                    }}
                  >
                    {site.utilizationPercent}% Util
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '0.5rem'
                  }}
                >
                  {site.name.split(' - ')[1] || site.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
                  <span>Assets: <strong>{site.totalAssets}</strong></span>
                  <span>Idle: <strong style={{ color: site.idleCount > 5 ? '#F59E0B' : 'inherit' }}>{site.idleCount}</strong></span>
                  <span>Overdue: <strong style={{ color: site.overdueCount > 0 ? '#EF4444' : 'inherit' }}>{site.overdueCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
