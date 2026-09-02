import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { emailService } from '../../services/emailService';
import { AnomalyReport, RentalTransaction, EmailDispatchRecord } from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  AlertTriangle,
  Clock,
  Zap,
  CheckCircle,
  Truck,
  RotateCcw,
  Phone,
  ArrowRight,
  ShieldAlert,
  Search,
  SlidersHorizontal,
  Mail,
  ExternalLink,
  Eye,
  Check
} from 'lucide-react';

interface AlertsAnomaliesProps {
  onNavigate: (path: string) => void;
}

type OverdueRentalItem = RentalTransaction & { daysOverdue: number; siteName: string; operatorName: string };

export const AlertsAnomalies: React.FC<AlertsAnomaliesProps> = ({ onNavigate }) => {
  const { session, notificationPreferences } = useAuth();
  const [overdueList, setOverdueList] = useState<OverdueRentalItem[]>(dataService.getOverdueRentals());
  const [anomalies, setAnomalies] = useState(dataService.getAnomalies());
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'idle' | 'zero' | 'operator'>('all');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [dispatchedEmailIds, setDispatchedEmailIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; record?: EmailDispatchRecord } | null>(null);
  const [activePreviewRecord, setActivePreviewRecord] = useState<EmailDispatchRecord | null>(null);

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setOverdueList(dataService.getOverdueRentals());
      setAnomalies(dataService.getAnomalies());
    });
    return unsub;
  }, []);

  const recipientEmail = notificationPreferences.email || session?.email || 'himasajeesh2005@gmail.com';

  const handleResolveAction = (id: string, actionName: string) => {
    setResolvedIds(prev => [...prev, id]);
    dataService.addNotification({
      type: 'anomaly',
      title: 'Alert Action Initiated',
      message: `Action "${actionName}" dispatched for alert reference ${id}.`,
      severity: 'info'
    });
  };

  const handleDispatchEmailForOverdue = async (rental: OverdueRentalItem) => {
    const record = await emailService.dispatchAlertEmail(
      {
        recipientEmail,
        ccEmails: notificationPreferences.ccEmails,
        subject: `[CRITICAL OVERDUE] Equipment ${rental.equipmentId} Overdue by ${rental.daysOverdue || 5} Days`,
        severity: (rental.daysOverdue || 0) > 5 ? 'critical' : 'warning',
        alertType: 'OVERDUE RETURN NOTICE',
        equipmentId: rental.equipmentId,
        equipmentType: rental.type,
        siteId: rental.siteId,
        siteName: rental.siteName,
        operatorName: rental.operatorName,
        reason: `Contract expected return date was ${rental.expectedReturnDate || 'past'}. Machine has exceeded scheduled check-in window without contract renewal.`,
        signalData: `CHECKOUT_DATE=${rental.checkOutDate} | EXPECTED_RETURN=${rental.expectedReturnDate} | DAYS_OVERDUE=+${rental.daysOverdue}`,
        recommendedAction: 'Immediate operator outreach required. Trigger check-in return or contract extension in CheckInOut module.'
      },
      notificationPreferences
    );

    setDispatchedEmailIds(prev => [...prev, rental.rentalId]);
    setToastMessage({
      text: `Alert email dispatched to ${recipientEmail}`,
      record
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDispatchEmailForAnomaly = async (anom: AnomalyReport) => {
    const record = await emailService.dispatchAlertEmail(
      {
        recipientEmail,
        ccEmails: notificationPreferences.ccEmails,
        subject: `[TELEMETRY ANOMALY] ${anom.anomalyType} on ${anom.equipmentId} (Site ${anom.siteId})`,
        severity: anom.severity === 'Critical' ? 'critical' : 'warning',
        alertType: anom.anomalyType.toUpperCase(),
        equipmentId: anom.equipmentId,
        equipmentType: anom.equipmentType,
        siteId: anom.siteId,
        operatorName: anom.operatorId || 'Assigned Crew',
        reason: anom.reason,
        signalData: anom.signalData,
        recommendedAction: anom.recommendedAction
      },
      notificationPreferences
    );

    setDispatchedEmailIds(prev => [...prev, anom.id]);
    setToastMessage({
      text: `Anomaly alert dispatched to ${recipientEmail}`,
      record
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const filteredAnomalies = anomalies.filter(anom => {
    if (activeFilter === 'idle') return anom.anomalyType === 'High Idle';
    if (activeFilter === 'zero') return anom.anomalyType === 'Zero Runtime';
    if (activeFilter === 'operator') return anom.anomalyType === 'Missing Operator';
    return true;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Operational Risk Engine & Telemetry Dispatch
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            Active Recipient: <strong style={{ color: '#FFCD11' }}>{recipientEmail}</strong>
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Overdue Rental Alerts & Telemetry Anomalies
        </h1>
      </div>

      {/* Real-Time Toast Notification Bar */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: 'var(--cat-dark-800)',
            border: '1px solid #FFCD11',
            borderRadius: '8px',
            padding: '0.75rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 25px rgba(0,0,0,0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={18} color="#FFCD11" />
            <span style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600 }}>
              {toastMessage.text}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {toastMessage.record && (
              <>
                <button
                  onClick={() => setActivePreviewRecord(toastMessage.record!)}
                  className="cat-btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
                >
                  <Eye size={12} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => emailService.launchMailClient(toastMessage.record!, 'gmail')}
                  className="cat-btn-primary"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
                >
                  <ExternalLink size={12} />
                  <span>Open in Gmail</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--cat-dark-800)',
          padding: '0.35rem',
          borderRadius: '8px',
          border: '1px solid var(--cat-border)',
          width: 'fit-content'
        }}
      >
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeFilter === 'all' ? '#FFCD11' : 'transparent',
            color: activeFilter === 'all' ? '#000000' : 'var(--cat-text-secondary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          All Issues ({overdueList.length + anomalies.length})
        </button>

        <button
          onClick={() => setActiveFilter('overdue')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeFilter === 'overdue' ? '#EF4444' : 'transparent',
            color: activeFilter === 'overdue' ? '#FFFFFF' : 'var(--cat-text-secondary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Overdue Returns ({overdueList.length})
        </button>

        <button
          onClick={() => setActiveFilter('idle')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeFilter === 'idle' ? '#F59E0B' : 'transparent',
            color: activeFilter === 'idle' ? '#000000' : 'var(--cat-text-secondary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          High Idle ({anomalies.filter(a => a.anomalyType === 'High Idle').length})
        </button>

        <button
          onClick={() => setActiveFilter('zero')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeFilter === 'zero' ? '#3B82F6' : 'transparent',
            color: activeFilter === 'zero' ? '#FFFFFF' : 'var(--cat-text-secondary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Zero Runtime ({anomalies.filter(a => a.anomalyType === 'Zero Runtime').length})
        </button>
      </div>

      {/* 1. OVERDUE RENTALS SECTION */}
      {(activeFilter === 'all' || activeFilter === 'overdue') && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#EF4444" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Overdue Equipment Return Alerts ({overdueList.length} Units)
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>
              1-Click Email Dispatch to <span style={{ color: '#FFCD11' }}>{recipientEmail}</span>
            </div>
          </div>

          <div className="cat-table-wrapper">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Equipment ID</th>
                  <th>Type</th>
                  <th>Site Name</th>
                  <th>Operator</th>
                  <th>Expected Return</th>
                  <th>Overdue Duration</th>
                  <th>Severity</th>
                  <th>Email Alert</th>
                  <th>Resolution Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueList.map(r => {
                  const isResolved = resolvedIds.includes(r.rentalId);
                  const isEmailSent = dispatchedEmailIds.includes(r.rentalId);

                  return (
                    <tr key={r.rentalId}>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 700, color: '#FFCD11' }}>
                          {r.equipmentId}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.type}</td>
                      <td style={{ color: '#60A5FA' }}>{r.siteName}</td>
                      <td style={{ color: '#D1D5DB' }}>{r.operatorName}</td>
                      <td style={{ color: '#EF4444', fontWeight: 600 }}>{r.expectedReturnDate || '2026-08-15'}</td>
                      <td>
                        <span className="font-mono" style={{ color: '#EF4444', fontWeight: 700 }}>
                          +{r.daysOverdue} Days
                        </span>
                      </td>
                      <td>
                        <Badge variant="overdue">
                          {r.daysOverdue > 5 ? 'CRITICAL' : 'HIGH'}
                        </Badge>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDispatchEmailForOverdue(r)}
                          className={isEmailSent ? 'cat-btn-secondary' : 'cat-btn-primary'}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title={`Dispatch telemetry email alert to ${recipientEmail}`}
                        >
                          <Mail size={12} />
                          <span>{isEmailSent ? 'Re-send Email' : 'Email Alert'}</span>
                        </button>
                      </td>
                      <td>
                        {isResolved ? (
                          <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={14} />
                            <span>Action Dispatched</span>
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => {
                                handleResolveAction(r.rentalId, 'Trigger Immediate Return');
                                onNavigate('/company/checkin-checkout');
                              }}
                              className="cat-btn-primary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                              title="Initiate Return"
                            >
                              <RotateCcw size={12} />
                              <span>Return</span>
                            </button>

                            <button
                              onClick={() => handleResolveAction(r.rentalId, 'Operator Contacted')}
                              className="cat-btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                              title="Contact Operator"
                            >
                              <Phone size={12} />
                              <span>Contact</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. EXPLAINABLE ANOMALIES SECTION */}
      {(activeFilter === 'all' || activeFilter !== 'overdue') && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#F59E0B" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Explainable Telemetry Anomaly Reports ({filteredAnomalies.length} Flagged)
              </h2>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1rem'
            }}
          >
            {filteredAnomalies.map(anom => {
              const isResolved = resolvedIds.includes(anom.id);
              const isEmailSent = dispatchedEmailIds.includes(anom.id);

              return (
                <div
                  key={anom.id}
                  className="cat-card cat-card-glow-yellow"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Top Anomaly Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className="font-mono" style={{ fontWeight: 800, color: '#FFCD11', fontSize: '0.9rem' }}>
                            {anom.equipmentId}
                          </span>
                          <Badge variant={anom.severity === 'Critical' ? 'critical' : 'idle'}>
                            {anom.anomalyType}
                          </Badge>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)' }}>
                          {anom.equipmentType} &bull; Site <strong>{anom.siteId}</strong>
                        </div>
                      </div>

                      <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
                        {anom.detectedAt}
                      </span>
                    </div>

                    {/* Explainable Diagnostic Reason */}
                    <div
                      style={{
                        backgroundColor: 'var(--cat-dark-900)',
                        border: '1px solid var(--cat-border)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Diagnostic Cause (Why it was flagged):
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--cat-text-primary)', lineHeight: 1.35 }}>
                        {anom.reason}
                      </div>
                    </div>

                    {/* Underlying Data Signals */}
                    <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)', marginBottom: '1rem' }}>
                      <strong style={{ color: '#D1D5DB' }}>Signal Data: </strong>
                      <span className="font-mono">{anom.signalData}</span>
                    </div>
                  </div>

                  {/* Recommended Action, Email Dispatch & Resolution Trigger */}
                  <div style={{ borderTop: '1px solid var(--cat-border)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', marginBottom: '0.5rem' }}>
                      {anom.recommendedAction}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDispatchEmailForAnomaly(anom)}
                        className="cat-btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title={`Send formatted telemetry report to ${recipientEmail}`}
                      >
                        <Mail size={12} color="#FFCD11" />
                        <span>{isEmailSent ? 'Re-send Email' : 'Email Alert'}</span>
                      </button>

                      {isResolved ? (
                        <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={14} />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolveAction(anom.id, anom.recommendedAction)}
                          className="cat-btn-primary"
                          style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', flexShrink: 0 }}
                        >
                          <Zap size={12} />
                          <span>Dispatch Fix</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Live Email Preview */}
      {activePreviewRecord && (
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
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
              <div>
                <div style={{ fontSize: '0.725rem', color: '#FFCD11', fontWeight: 800, textTransform: 'uppercase' }}>
                  Dispatched Telemetry Email Alert
                </div>
                <h3 style={{ margin: '0.2rem 0 0 0', color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 800 }}>
                  {activePreviewRecord.subject}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewRecord(null)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
              >
                &times;
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#0D1117' }}>
              <div
                style={{
                  backgroundColor: '#12151C',
                  border: '1px solid var(--cat-border)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: activePreviewRecord.htmlBody }} />
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--cat-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--cat-dark-700)'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>
                Dispatched to: <span style={{ color: '#FFCD11', fontWeight: 600 }}>{activePreviewRecord.recipientEmail}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => emailService.launchMailClient(activePreviewRecord, 'gmail')}
                  className="cat-btn-primary"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  <ExternalLink size={13} />
                  <span>Open in Gmail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
