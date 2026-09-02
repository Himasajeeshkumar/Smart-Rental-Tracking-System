import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { emailService } from '../../services/emailService';
import { Badge } from '../../components/common/Badge';
import { DynamicSiteMap } from '../../components/common/DynamicSiteMap';
import { CatLogo } from '../../components/common/CatLogo';
import {
  HardHat,
  Calendar,
  Truck,
  MapPin,
  Percent,
  LogOut,
  Shield,
  Clock,
  ExternalLink,
  Layers,
  ChevronDown,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Sparkles
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { session, logout } = useAuth();
  const operatorId = session?.operatorId || 'OP3457';
  const customerEmail = session?.email || 'himasajeesh2005@gmail.com';

  const customerData = useMemo(() => {
    return dataService.getCustomerData(operatorId);
  }, [operatorId]);

  const [selectedRentalIndex, setSelectedRentalIndex] = useState(0);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState('Hydraulic Pressure Anomaly');
  const [issueSeverity, setIssueSeverity] = useState<'critical' | 'warning'>('warning');
  const [issueDescription, setIssueDescription] = useState('');
  const [alertDispatchedMessage, setAlertDispatchedMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!customerData || !customerData.operator) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--cat-dark-900)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
      >
        <div className="cat-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '450px' }}>
          <Shield size={36} color="#EF4444" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800 }}>
            Operator Record Not Found
          </h2>
          <p style={{ color: 'var(--cat-text-secondary)', fontSize: '0.85rem' }}>
            No operational rental association found for Operator ID {operatorId}. Please verify your credentials or contact the fleet dispatcher.
          </p>
          <button onClick={logout} className="cat-btn-primary" style={{ marginTop: '1rem' }}>
            <LogOut size={16} />
            <span>Return to Login</span>
          </button>
        </div>
      </div>
    );
  }

  const { operator, allPermittedRentals, equipment, site } = customerData;
  const currentRental = allPermittedRentals.length > 0 ? allPermittedRentals[selectedRentalIndex] || customerData.primaryRental : customerData.primaryRental;

  const handleSendStatusTestAlert = async () => {
    setIsSending(true);
    await emailService.dispatchAlertEmail({
      recipientEmail: customerEmail,
      subject: `[CAT Operator Alert] Equipment Status for ${equipment.id} (${operator.name})`,
      severity: 'info',
      alertType: 'OPERATOR_STATUS_SYNC',
      equipmentId: equipment.id,
      equipmentType: equipment.type,
      siteId: site.siteId,
      siteName: site.name,
      operatorName: operator.name,
      reason: `Automated equipment telemetry sync requested by ${operator.name} (Operator ID ${operator.operatorId}). Machine is operating at ${currentRental.utilizationPercent || 86.5}% utilization with expected check-in on ${currentRental.expectedReturnDate || '2026-10-15'}.`,
      recommendedAction: 'Keep telemetry active and review safety checklist.'
    });

    setAlertDispatchedMessage(`Real-time status alert automatically sent to ${customerEmail}!`);
    setIsSending(false);
    setTimeout(() => setAlertDispatchedMessage(null), 4000);
  };

  const handleReportIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    dataService.addNotification({
      type: 'anomaly',
      title: `Operator Issue Filed: ${issueType}`,
      message: `Operator ${operator.name} (${operator.operatorId}) reported: "${issueDescription || issueType}" on ${equipment.id} at ${site.name}.`,
      equipmentId: equipment.id,
      siteId: site.siteId,
      severity: issueSeverity === 'critical' ? 'critical' : 'warning'
    });

    // Automatically send real alert email directly to the customer's login email
    await emailService.dispatchAlertEmail({
      recipientEmail: customerEmail,
      subject: `[MAINTENANCE ALERT] ${issueType} Reported on ${equipment.id}`,
      severity: issueSeverity,
      alertType: 'OPERATOR_MAINTENANCE_REQUEST',
      equipmentId: equipment.id,
      equipmentType: equipment.type,
      siteId: site.siteId,
      siteName: site.name,
      operatorName: operator.name,
      reason: issueDescription || `Operator reported ${issueType} during active shift operations.`,
      signalData: `OPERATOR_ID=${operator.operatorId} | REPORTED_ISSUE=${issueType} | STATUS=MAINTENANCE_PENDING`,
      recommendedAction: 'Company fleet maintenance dispatch notified. Stand by for technician dispatch or equipment swap.'
    });

    setIsSending(false);
    setShowIssueModal(false);
    setIssueDescription('');
    setAlertDispatchedMessage(`Maintenance alert filed! Copy automatically dispatched to ${customerEmail}.`);
    setTimeout(() => setAlertDispatchedMessage(null), 5000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--cat-dark-900)', display: 'flex', flexDirection: 'column' }}>
      {/* Customer Header */}
      <header
        style={{
          backgroundColor: 'var(--cat-dark-800)',
          borderBottom: '1px solid var(--cat-border)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CatLogo size="sm" showSubtitle={false} />
          <div
            style={{
              backgroundColor: 'rgba(255, 205, 17, 0.1)',
              border: '1px solid rgba(255, 205, 17, 0.3)',
              color: '#FFCD11',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.725rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            Customer Portal
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="hide-on-mobile" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
              {operator.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#FFCD11', fontFamily: 'monospace' }}>
              Operator ID: {operator.operatorId}
            </div>
          </div>

          <button
            onClick={logout}
            className="cat-btn-danger"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Customer Content */}
      <main className="page-wrapper" style={{ flex: 1, padding: '1.5rem 1rem' }}>
        {/* Automatic Real-Time Email Alerts Indicator Banner */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={18} color="#34D399" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                Automated Alerts Active & Routing
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-secondary)' }}>
                All maintenance alerts, machine warnings & return notices are automatically sent to <strong style={{ color: '#FFCD11' }}>{customerEmail}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSendStatusTestAlert}
              disabled={isSending}
              className="cat-btn-secondary"
              style={{ fontSize: '0.725rem', padding: '0.35rem 0.75rem' }}
            >
              <Send size={12} />
              <span>Send My Status Alert</span>
            </button>
            <button
              onClick={() => setShowIssueModal(true)}
              className="cat-btn-primary"
              style={{ fontSize: '0.725rem', padding: '0.35rem 0.75rem' }}
            >
              <Wrench size={12} />
              <span>Report Machine Issue</span>
            </button>
          </div>
        </div>

        {alertDispatchedMessage && (
          <div
            style={{
              backgroundColor: 'rgba(255, 205, 17, 0.15)',
              border: '1px solid #FFCD11',
              color: '#FFFFFF',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            <CheckCircle2 size={16} color="#FFCD11" />
            <span>{alertDispatchedMessage}</span>
          </div>
        )}

        {/* Welcome Banner */}
        <div
          className="cat-card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--cat-dark-800)',
            borderLeft: '4px solid #FFCD11'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h1 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                Assigned Rental Overview
              </h1>
              <p style={{ color: 'var(--cat-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Permitted telemetry & site details for <strong>{operator.name}</strong> ({operator.certificationLevel}, {operator.experienceYears} yrs experience)
              </p>
            </div>

            {/* If Operator has multiple permitted rentals, allow switcher */}
            {allPermittedRentals.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>Switch Rental:</span>
                <select
                  className="cat-select font-mono"
                  value={selectedRentalIndex}
                  onChange={e => setSelectedRentalIndex(Number(e.target.value))}
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {allPermittedRentals.map((r, idx) => (
                    <option key={r.rentalId} value={idx}>
                      {r.rentalId} - {r.equipmentId} ({r.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 8 CRITICAL CUSTOMER DATA POINTS SPECIFIED IN REQUIREMENTS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          {/* 1 & 2. CHECK-IN / CHECK-OUT DATES */}
          <div className="cat-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#FFCD11' }}>
              <Calendar size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                1 & 2. Rental Timeline
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)', marginBottom: '0.5rem' }}>
              Check-Out Date:{' '}
              <strong style={{ color: '#FFFFFF' }} className="font-mono">
                {currentRental.checkOutDate || '2026-07-29'}
              </strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)' }}>
              Expected Check-In Return:{' '}
              <strong style={{ color: '#34D399' }} className="font-mono">
                {currentRental.expectedReturnDate || '2026-10-15'}
              </strong>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
              Operating Days Logged: <strong>{currentRental.operatingDays || 32} days</strong>
            </div>
          </div>

          {/* 3. OPERATOR ID */}
          <div className="cat-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#FFCD11' }}>
              <HardHat size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                3. Operator Verification
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
              {operator.operatorId}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)' }}>
              {operator.name} &bull; {operator.certificationLevel}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <Badge variant="active">Active Certified Operator</Badge>
            </div>
          </div>

          {/* 4 & 5. EQUIPMENT TYPE & ID */}
          <div className="cat-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#FFCD11' }}>
              <Truck size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                4 & 5. Assigned Equipment
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFCD11', marginBottom: '0.25rem' }}>
              {equipment.id}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
              {equipment.type} ({equipment.model})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginTop: '0.25rem' }}>
              Model Year: {equipment.manufactureYear || 2025} &bull; {equipment.ownershipType}
            </div>
          </div>

          {/* 7. UTILIZATION PERCENTAGE */}
          <div className="cat-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#FFCD11' }}>
              <Percent size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                7. Machine Utilization
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', marginBottom: '0.25rem' }}>
              {currentRental.utilizationPercent || 86.5}%
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--cat-dark-900)',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '0.5rem 0'
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, currentRental.utilizationPercent || 86.5)}%`,
                  height: '100%',
                  backgroundColor: '#10B981'
                }}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
              Engine: <strong>{currentRental.engineHoursPerDay || 7.2}h/day</strong> &bull; Idle: <strong>{currentRental.idleHoursPerDay || 1.1}h/day</strong>
            </div>
          </div>
        </div>

        {/* 6 & 8. SITE DETAILS & DEDICATED SITE MAP */}
        <div className="cat-card" style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.25rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--cat-border)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="font-mono" style={{ backgroundColor: '#FFCD11', color: '#000000', fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {site.siteId}
                </span>
                <span style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>6. Operating Site Details</span>
              </div>
              <h2 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {site.name}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)', marginTop: '2px' }}>
                Location: <strong>{site.location}</strong> ({site.category})
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cat-btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            >
              <span>Open Location in Google Maps</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* 8. Dedicated Site Map for THAT permitted site only */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              8. Dedicated Site Telemetry & Boundary Map
            </div>
            <DynamicSiteMap
              site={site}
              assignedEquipment={[equipment]}
              height="380px"
              showGoogleMapsButton={false}
            />
          </div>
        </div>
      </main>

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--cat-dark-800)',
              border: '1px solid var(--cat-border)',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--cat-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--cat-dark-700)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} color="#FFCD11" />
                <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 800 }}>
                  Report Equipment Issue & Dispatch Alert
                </h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReportIssueSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Target Equipment
                </label>
                <input
                  type="text"
                  readOnly
                  className="cat-input font-mono"
                  value={`${equipment.id} - ${equipment.type} (${site.name})`}
                  style={{ backgroundColor: 'var(--cat-dark-900)', color: '#FFCD11', fontWeight: 700 }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Issue Category
                </label>
                <select
                  className="cat-select"
                  value={issueType}
                  onChange={e => setIssueType(e.target.value)}
                >
                  <option value="Hydraulic Pressure Anomaly">Hydraulic Pressure Anomaly</option>
                  <option value="Engine Temperature Overheating">Engine Temperature Overheating</option>
                  <option value="High Engine Idle Alarm">High Engine Idle Alarm</option>
                  <option value="Brake / Steering Sensor Fault">Brake / Steering Sensor Fault</option>
                  <option value="Scheduled Maintenance Required">Scheduled Maintenance Required</option>
                  <option value="Physical Equipment Damage">Physical Equipment Damage</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Severity Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIssueSeverity('warning')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: issueSeverity === 'warning' ? '1px solid #F59E0B' : '1px solid var(--cat-border)',
                      backgroundColor: issueSeverity === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'var(--cat-dark-700)',
                      color: issueSeverity === 'warning' ? '#F59E0B' : 'var(--cat-text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Warning (Non-Halting)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueSeverity('critical')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: issueSeverity === 'critical' ? '1px solid #EF4444' : '1px solid var(--cat-border)',
                      backgroundColor: issueSeverity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'var(--cat-dark-700)',
                      color: issueSeverity === 'critical' ? '#EF4444' : 'var(--cat-text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Critical (Immediate Stop)
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Telemetry Observations / Notes
                </label>
                <textarea
                  required
                  rows={3}
                  className="cat-input"
                  placeholder="Describe abnormal noise, sensor readings, or operational symptom..."
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)', marginBottom: '1rem' }}>
                Dispatches immediately to both Company Operations and your authenticated email: <strong style={{ color: '#FFCD11' }}>{customerEmail}</strong>.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="cat-btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="cat-btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  {isSending ? 'Transmitting Alert...' : 'Submit & Send Email Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Footer */}
      <footer
        style={{
          padding: '1rem',
          backgroundColor: 'var(--cat-dark-800)',
          borderTop: '1px solid var(--cat-border)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--cat-text-muted)'
        }}
      >
        Caterpillar Smart Rental Customer Gateway &bull; Authenticated Operator Session: {operator.operatorId} &bull; Email Route: {customerEmail}
      </footer>
    </div>
  );
};
