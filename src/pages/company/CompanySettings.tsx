import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { emailService } from '../../services/emailService';
import { EmailDispatchRecord, CompanyAccount } from '../../types';
import {
  Mail,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Shield,
  Server,
  Info,
  ExternalLink,
  Laptop,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Layers,
  Globe,
  UserPlus,
  Users,
  KeyRound,
  Lock,
  Edit2
} from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const {
    session,
    notificationPreferences,
    updateNotificationPreferences,
    authorizedCompanyAccounts,
    addCompanyMember,
    updateCompanyMember,
    removeCompanyMember,
    resetCompanyAccountsToDefault
  } = useAuth();

  const [testSent, setTestSent] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailDispatchRecord[]>([]);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<EmailDispatchRecord | null>(null);
  const [hasDesktopPermission, setHasDesktopPermission] = useState<boolean>(emailService.hasNotificationPermission());
  const [customWebhook, setCustomWebhook] = useState<string>(notificationPreferences.webhookUrl || '');
  const [ccList, setCcList] = useState<string>(notificationPreferences.ccEmails || '');

  // Add Member Modal / Form state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberTitle, setNewMemberTitle] = useState('Fleet Operations Specialist');
  const [newMemberDept, setNewMemberDept] = useState('Heavy Equipment Operations');

  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setEmailHistory(emailService.getEmailHistory());
  }, []);

  const togglePasswordVisibility = (emailKey: string) => {
    setVisiblePasswords(prev => ({ ...prev, [emailKey]: !prev[emailKey] }));
  };

  const handleToggle = (key: keyof typeof notificationPreferences) => {
    updateNotificationPreferences({ [key]: !notificationPreferences[key] });
    setSaveMessage('Notification preferences updated.');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const handleEnableDesktopNotifications = async () => {
    const granted = await emailService.requestNotificationPermission();
    setHasDesktopPermission(granted);
    if (granted) {
      emailService.triggerDesktopPush(
        'CAT Notifications Enabled',
        'You will now receive desktop pop-up alerts for all heavy equipment anomalies.'
      );
      setSaveMessage('Desktop push notifications activated!');
    } else {
      setSaveMessage('Desktop notification permission was not granted by your browser.');
    }
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSendTestNotification = async () => {
    setTestSent(true);
    const targetEmail = notificationPreferences.email || session?.email || 'himasajeesh2005@gmail.com';

    const record = await emailService.sendDiagnosticTestEmail(targetEmail, {
      ...notificationPreferences,
      ccEmails: ccList
    });

    dataService.addNotification({
      type: 'anomaly',
      title: 'Diagnostic Test Alert Dispatched',
      message: `Diagnostic telemetry alert routed to authenticated address: ${targetEmail}`,
      severity: 'info'
    });

    setEmailHistory(emailService.getEmailHistory());
    setSelectedEmailPreview(record);
    setSaveMessage(`Test alert successfully dispatched to ${targetEmail}!`);
    setTimeout(() => {
      setTestSent(false);
      setSaveMessage(null);
    }, 4000);
  };

  const handleSaveEndpoints = () => {
    updateNotificationPreferences({
      webhookUrl: customWebhook.trim(),
      ccEmails: ccList.trim()
    });
    setSaveMessage('Email routing and webhook settings saved.');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const handleClearHistory = () => {
    if (confirm('Clear local email dispatch audit log?')) {
      emailService.clearHistory();
      setEmailHistory([]);
      setSaveMessage('Email history cleared.');
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberPassword || !newMemberName) {
      alert('Please fill all required member details.');
      return;
    }

    addCompanyMember({
      email: newMemberEmail.trim(),
      password: newMemberPassword.trim(),
      name: newMemberName.trim(),
      title: newMemberTitle.trim() || 'Operations Lead',
      badge: 'AUTHORIZED OPS',
      department: newMemberDept.trim() || 'Fleet Command'
    });

    setShowAddMemberModal(false);
    setNewMemberEmail('');
    setNewMemberPassword('');
    setNewMemberName('');
    setSaveMessage(`Authorized member ${newMemberName} added! They can now log into Company Operations.`);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleRemoveMember = (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === 'himasajeesh2005@gmail.com') {
      alert('Cannot remove the primary System Admin account.');
      return;
    }
    if (confirm(`Remove ${emailToRemove} from authorized company logins?`)) {
      removeCompanyMember(emailToRemove);
      setSaveMessage(`Removed ${emailToRemove} from authorized company accounts.`);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            System Configuration & Access Control
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            Corporate Personnel Directory & Alert Routing
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Company Profile & Access Management
        </h1>
      </div>

      {saveMessage && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34D399',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* SECTION 1: AUTHORIZED COMPANY PERSONNEL DIRECTORY (EDITABLE ACCESS LIST) */}
      <div className="cat-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#FFCD11" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Authorized Company Personnel & Logins ({authorizedCompanyAccounts.length} Active Accounts)
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Only individuals in this private list can sign into the Company Portal. Add new members or update passwords here.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => resetCompanyAccountsToDefault()}
              className="cat-btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              title="Reset accounts to initial system defaults"
            >
              <RefreshCw size={13} />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="cat-btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            >
              <UserPlus size={14} />
              <span>+ Add Company Member</span>
            </button>
          </div>
        </div>

        {/* Authorized Accounts Table */}
        <div className="cat-table-wrapper">
          <table className="cat-table">
            <thead>
              <tr>
                <th>Personnel Name</th>
                <th>Authorized Corporate Email</th>
                <th>Access Password</th>
                <th>Title / Department</th>
                <th>Role Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authorizedCompanyAccounts.map(acc => {
                const isPassVisible = !!visiblePasswords[acc.email];
                const isCurrentSession = session?.email.toLowerCase() === acc.email.toLowerCase();

                return (
                  <tr key={acc.email}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
                        {acc.name}
                      </div>
                      {isCurrentSession && (
                        <span style={{ fontSize: '0.65rem', color: '#34D399', fontWeight: 700 }}>
                          (Active Logged-In User)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono" style={{ color: '#FFCD11', fontSize: '0.8rem', fontWeight: 600 }}>
                        {acc.email}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.8rem', color: '#E5E7EB', letterSpacing: isPassVisible ? 'normal' : '0.15em' }}>
                          {isPassVisible ? acc.password : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(acc.email)}
                          style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '0.2rem' }}
                          title={isPassVisible ? 'Hide Password' : 'Show Password'}
                        >
                          {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.775rem', color: '#D1D5DB' }}>{acc.title}</div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--cat-text-muted)' }}>{acc.department}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          backgroundColor: 'rgba(255, 205, 17, 0.12)',
                          color: '#FFCD11',
                          border: '1px solid rgba(255, 205, 17, 0.3)'
                        }}
                      >
                        {acc.badge}
                      </span>
                    </td>
                    <td>
                      {acc.email.toLowerCase() !== 'himasajeesh2005@gmail.com' ? (
                        <button
                          onClick={() => handleRemoveMember(acc.email)}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#F87171',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.675rem',
                            cursor: 'pointer'
                          }}
                          title="Remove Access"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Layout: Notification Target & Preferences */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Left: Authenticated Profile & Live Email Delivery */}
        <div className="cat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="#FFCD11" />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                  Authenticated Email Destination
                </h2>
              </div>
              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                Active Target
              </span>
            </div>

            {/* Current Primary Target Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Active Logged-in Recipient (Bound to Session)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  readOnly
                  className="cat-input"
                  value={notificationPreferences.email || session?.email || 'himasajeesh2005@gmail.com'}
                  style={{
                    backgroundColor: 'var(--cat-dark-900)',
                    color: '#FFCD11',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: '1px solid rgba(255, 205, 17, 0.4)'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)', marginTop: '0.35rem' }}>
                All high-priority operational telemetry alarms will be routed to this active address.
              </div>
            </div>

            {/* CC Secondary Emails */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                CC Secondary Notification Emails (Optional)
              </label>
              <input
                type="text"
                className="cat-input"
                placeholder="supervisor@site.com, maintenance@fleet.com"
                value={ccList}
                onChange={e => setCcList(e.target.value)}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)', marginTop: '0.25rem' }}>
                Comma-separated list of secondary site personnel to copy on alert emails.
              </div>
            </div>

            {/* Desktop Pop-Up Push Notifications */}
            <div
              style={{
                backgroundColor: 'var(--cat-dark-900)',
                border: '1px solid var(--cat-border)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Laptop size={15} color="#60A5FA" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Desktop Pop-Up Push Alerts
                  </span>
                </div>
                {hasDesktopPermission ? (
                  <span style={{ fontSize: '0.675rem', color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={12} /> ENABLED
                  </span>
                ) : (
                  <button
                    onClick={handleEnableDesktopNotifications}
                    className="cat-btn-secondary"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  >
                    Enable Browser Pop-ups
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.725rem', color: 'var(--cat-text-secondary)', margin: 0 }}>
                Displays native operating system alerts instantly whenever critical machinery faults occur.
              </p>
            </div>
          </div>

          {/* Test Dispatch Button */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSendTestNotification}
              disabled={testSent}
              className="cat-btn-primary"
              style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.825rem' }}
            >
              <Send size={15} />
              <span>{testSent ? 'Transmitting Alert...' : 'Send Diagnostic Test Alert Email'}</span>
            </button>
            <button
              onClick={handleSaveEndpoints}
              className="cat-btn-secondary"
              style={{ padding: '0.65rem 1rem', fontSize: '0.825rem' }}
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Right: Operational Event Subscriptions & Auto Dispatch */}
        <div className="cat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#FFCD11" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                Alert Routing Rules & Subscriptions
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#FFCD11', fontWeight: 600 }}>
              Auto-Routing Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                key: 'enableAutoEmailDispatch' as const,
                title: '⚡ Instant Auto-Email Dispatch',
                desc: 'Automatically generate & send telemetry emails upon anomaly detection',
                highlight: true
              },
              {
                key: 'overdueAlerts' as const,
                title: 'Overdue Equipment Alerts',
                desc: 'Instant dispatch when a machine exceeds expected return date without check-in'
              },
              {
                key: 'criticalAnomalies' as const,
                title: 'Critical Telemetry Anomalies',
                desc: 'Alerts on high idle (>4.5h/day), zero runtime, or sensor fault signals'
              },
              {
                key: 'returnReminders' as const,
                title: '24-Hour Return Reminders',
                desc: 'Advance notice to site supervisors before scheduled rental expiration'
              },
              {
                key: 'highIdleAlerts' as const,
                title: 'High Idle Fuel Waste Alerts',
                desc: 'Trigger when machine idle engine hours exceed 40% of daily shift'
              },
              {
                key: 'demandGapAlerts' as const,
                title: 'Site Machinery Deficit Alerts',
                desc: 'Forecast notifications when a site requires additional machinery allocation'
              }
            ].map(item => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: item.highlight ? 'rgba(255, 205, 17, 0.08)' : 'var(--cat-dark-700)',
                  borderRadius: '6px',
                  border: item.highlight ? '1px solid rgba(255, 205, 17, 0.3)' : '1px solid var(--cat-border)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: item.highlight ? '#FFCD11' : '#FFFFFF' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-secondary)', marginTop: '2px' }}>
                    {item.desc}
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', flexShrink: 0, marginLeft: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(notificationPreferences[item.key])}
                    onChange={() => handleToggle(item.key)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: notificationPreferences[item.key] ? '#FFCD11' : '#374151',
                      borderRadius: '22px',
                      transition: '0.2s'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: '16px',
                        width: '16px',
                        left: notificationPreferences[item.key] ? '22px' : '3px',
                        bottom: '3px',
                        backgroundColor: notificationPreferences[item.key] ? '#000000' : '#9CA3AF',
                        borderRadius: '50%',
                        transition: '0.2s'
                      }}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Webhook & Custom Integrations (Optional) */}
      <div className="cat-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Globe size={16} color="#60A5FA" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Custom Webhook / External Relay Endpoint (Optional)
          </h3>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', margin: '0 0 0.75rem 0' }}>
          Connect Zapier, Make, Formspree, Slack or your internal dispatch endpoint to receive raw JSON alert payloads in real time.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="url"
            className="cat-input"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={customWebhook}
            onChange={e => setCustomWebhook(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={handleSaveEndpoints} className="cat-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
            Save Webhook
          </button>
        </div>
      </div>

      {/* Live Email Dispatch Audit History */}
      <div className="cat-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#FFCD11" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              Live Email Dispatch Audit Log ({emailHistory.length} Dispatched Alerts)
            </h2>
          </div>
          {emailHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Trash2 size={13} />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {emailHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cat-text-muted)' }}>
            <Mail size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--cat-text-secondary)' }}>
              No email alerts dispatched yet. Click "Send Diagnostic Test Alert Email" above or trigger an alert.
            </div>
          </div>
        ) : (
          <div className="cat-table-wrapper">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Recipient Email</th>
                  <th>Alert Subject</th>
                  <th>Machine / Site</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emailHistory.map(record => (
                  <tr key={record.id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>{record.timestamp}</td>
                    <td>
                      <span className="font-mono" style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 600 }}>
                        {record.recipientEmail}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>{record.subject}</td>
                    <td style={{ fontSize: '0.75rem', color: '#60A5FA' }}>
                      {record.equipmentId ? `${record.equipmentId} (Site ${record.siteId || 'Ops'})` : 'Diagnostic'}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          backgroundColor: record.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: record.severity === 'critical' ? '#EF4444' : '#60A5FA',
                          border: `1px solid ${record.severity === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}
                      >
                        {record.severity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.725rem', color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={13} />
                        <span>{record.status}</span>
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => setSelectedEmailPreview(record)}
                          className="cat-btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                          title="Preview HTML Template"
                        >
                          <Eye size={12} />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => emailService.launchMailClient(record, 'gmail')}
                          className="cat-btn-primary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                          title="Open Draft in Gmail"
                        >
                          <ExternalLink size={12} />
                          <span>Gmail</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Authorized Company Member */}
      {showAddMemberModal && (
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
                <UserPlus size={18} color="#FFCD11" />
                <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 800 }}>
                  Add Authorized Company Member
                </h3>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="cat-input"
                  placeholder="e.g. Robert Smith"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Authorized Corporate Email (Login Address)
                </label>
                <input
                  type="email"
                  required
                  className="cat-input"
                  placeholder="robert.smith@caterpillar-rentals.com"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Security Password (for Company Login)
                </label>
                <input
                  type="text"
                  required
                  className="cat-input font-mono"
                  placeholder="e.g. CatOps2026! or custom password"
                  value={newMemberPassword}
                  onChange={e => setNewMemberPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="cat-input"
                    placeholder="e.g. Regional Fleet Manager"
                    value={newMemberTitle}
                    onChange={e => setNewMemberTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    className="cat-input"
                    placeholder="e.g. Fleet Command"
                    value={newMemberDept}
                    onChange={e => setNewMemberDept(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)', marginBottom: '1.25rem' }}>
                Once added, this user can immediately log in on the Company Operations login page using these credentials.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="cat-btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cat-btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  Authorize Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Live Email Preview */}
      {selectedEmailPreview && (
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
            {/* Modal Header */}
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
                  Live Telemetry Email Preview
                </div>
                <h3 style={{ margin: '0.2rem 0 0 0', color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 800 }}>
                  {selectedEmailPreview.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmailPreview(null)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Content - HTML Email rendering iframe */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#0D1117' }}>
              <div
                style={{
                  backgroundColor: '#12151C',
                  border: '1px solid var(--cat-border)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: selectedEmailPreview.htmlBody }} />
              </div>
            </div>

            {/* Modal Footer Actions */}
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
                Target: <span style={{ color: '#FFCD11', fontWeight: 600 }}>{selectedEmailPreview.recipientEmail}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => emailService.launchMailClient(selectedEmailPreview, 'mailto')}
                  className="cat-btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  <span>Default Mail App</span>
                </button>
                <button
                  onClick={() => emailService.launchMailClient(selectedEmailPreview, 'gmail')}
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
