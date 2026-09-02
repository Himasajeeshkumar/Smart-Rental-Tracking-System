import React, { useState } from 'react';
import { dataService } from '../../services/dataService';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Radio,
  CheckCircle,
  Truck,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';

export const CheckInOut: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'checkin'>('checkout');

  // Checkout Form State
  const [checkoutEqId, setCheckoutEqId] = useState('EQX10000');
  const [checkoutOpId, setCheckoutOpId] = useState('OP3457');
  const [checkoutSiteId, setCheckoutSiteId] = useState('S003');
  const [checkOutDate, setCheckOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [initialCondition, setInitialCondition] = useState('Certified Ready / Grade A');
  const [checkoutNotes, setCheckoutNotes] = useState('Standard 14-day commercial civil project allocation.');

  // Checkin Form State
  const [checkinEqId, setCheckinEqId] = useState('EQX12520');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [finalCondition, setFinalCondition] = useState('Excellent Condition');
  const [loggedEngineHours, setLoggedEngineHours] = useState(148.5);
  const [checkinNotes, setCheckinNotes] = useState('Completed earthwork phase. Machine washed and safety inspected.');

  // Status message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Simulated Scanning State
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [isReadingRFID, setIsReadingRFID] = useState(false);

  const simulateQRScan = (type: 'checkout' | 'checkin') => {
    setIsScanningQR(true);
    setTimeout(() => {
      setIsScanningQR(false);
      if (type === 'checkout') {
        setCheckoutEqId('EQX11487');
      } else {
        setCheckinEqId('EQX14317');
      }
      setMessage({ type: 'success', text: 'Simulated QR Barcode scanned successfully! Machine ID populated.' });
    }, 1200);
  };

  const simulateRFIDTap = (type: 'checkout' | 'checkin') => {
    setIsReadingRFID(true);
    setTimeout(() => {
      setIsReadingRFID(false);
      if (type === 'checkout') {
        setCheckoutOpId('OP4013');
      }
      setMessage({ type: 'success', text: 'Simulated RFID telemetry tag detected on Near-Field Reader.' });
    }, 1000);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = dataService.checkOutEquipment({
      equipmentId: checkoutEqId,
      operatorId: checkoutOpId,
      siteId: checkoutSiteId,
      checkOutDate,
      expectedReturnDate,
      initialCondition,
      notes: checkoutNotes
    });

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch {}
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = dataService.checkInEquipment({
      equipmentId: checkinEqId,
      checkInDate,
      finalCondition,
      loggedEngineHours,
      notes: checkinNotes
    });

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch {}
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Equipment Lifecycle Operations
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            Traceable Asset Hand-off & Return Protocol
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Check-Out / Check-In Dispatch Workflow
        </h1>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--cat-dark-800)',
          padding: '0.35rem',
          borderRadius: '8px',
          border: '1px solid var(--cat-border)',
          width: 'fit-content'
        }}
      >
        <button
          onClick={() => {
            setActiveTab('checkout');
            setMessage(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'checkout' ? '#FFCD11' : 'transparent',
            color: activeTab === 'checkout' ? '#000000' : 'var(--cat-text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          <Zap size={16} />
          <span>1. Equipment Check-Out</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('checkin');
            setMessage(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'checkin' ? '#FFCD11' : 'transparent',
            color: activeTab === 'checkin' ? '#000000' : 'var(--cat-text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          <RotateCcw size={16} />
          <span>2. Equipment Check-In & Return</span>
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          style={{
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: message.type === 'success' ? '#34D399' : '#F87171',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem'
          }}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Workflow Form Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Left: Input Form */}
        <div className="cat-card" style={{ padding: '1.5rem' }}>
          {activeTab === 'checkout' ? (
            <form onSubmit={handleCheckoutSubmit}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
                DISPATCH NEW ASSET
              </div>

              {/* Equipment ID & QR Simulator */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', textTransform: 'uppercase' }}>
                    Equipment ID
                  </label>
                  <button
                    type="button"
                    onClick={() => simulateQRScan('checkout')}
                    disabled={isScanningQR}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FFCD11',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <QrCode size={13} />
                    <span>{isScanningQR ? 'Scanning Camera...' : 'Simulate QR Scan'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  className="cat-input font-mono"
                  value={checkoutEqId}
                  onChange={e => setCheckoutEqId(e.target.value.toUpperCase())}
                  placeholder="e.g. EQX10000"
                />
              </div>

              {/* Operator ID & RFID Simulator */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', textTransform: 'uppercase' }}>
                    Assign Operator ID
                  </label>
                  <button
                    type="button"
                    onClick={() => simulateRFIDTap('checkout')}
                    disabled={isReadingRFID}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60A5FA',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Radio size={13} />
                    <span>{isReadingRFID ? 'Reading RFID...' : 'Simulate RFID Tap'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  className="cat-input font-mono"
                  value={checkoutOpId}
                  onChange={e => setCheckoutOpId(e.target.value.toUpperCase())}
                  placeholder="e.g. OP3457"
                />
              </div>

              {/* Destination Site ID */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Destination Site ID
                </label>
                <select
                  className="cat-select font-mono"
                  value={checkoutSiteId}
                  onChange={e => setCheckoutSiteId(e.target.value)}
                >
                  {Array.from({ length: 50 }, (_, i) => `S${String(i + 1).padStart(3, '0')}`).map(sid => (
                    <option key={sid} value={sid}>
                      {sid} - {dataService.getSiteById(sid)?.name || `Site ${sid}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    required
                    className="cat-input"
                    value={checkOutDate}
                    onChange={e => setCheckOutDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    required
                    className="cat-input"
                    value={expectedReturnDate}
                    onChange={e => setExpectedReturnDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Condition */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Dispatch Inspection Condition
                </label>
                <select
                  className="cat-select"
                  value={initialCondition}
                  onChange={e => setInitialCondition(e.target.value)}
                >
                  <option value="Certified Ready / Grade A">Certified Ready / Grade A</option>
                  <option value="Operational / Normal Wear">Operational / Normal Wear</option>
                  <option value="Refurbished Service">Refurbished Service</option>
                </select>
              </div>

              <button type="submit" className="cat-btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                <Zap size={16} />
                <span>Confirm Check-Out & Generate Rental Record</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleCheckinSubmit}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
                RECEIVE RETURN & FINAL INSPECTION
              </div>

              {/* Equipment ID & QR Simulator */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', textTransform: 'uppercase' }}>
                    Returning Equipment ID
                  </label>
                  <button
                    type="button"
                    onClick={() => simulateQRScan('checkin')}
                    disabled={isScanningQR}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FFCD11',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <QrCode size={13} />
                    <span>{isScanningQR ? 'Scanning Camera...' : 'Simulate QR Scan'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  className="cat-input font-mono"
                  value={checkinEqId}
                  onChange={e => setCheckinEqId(e.target.value.toUpperCase())}
                  placeholder="e.g. EQX12520"
                />
              </div>

              {/* Checkin Date */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Actual Check-In Date
                </label>
                <input
                  type="date"
                  required
                  className="cat-input"
                  value={checkInDate}
                  onChange={e => setCheckInDate(e.target.value)}
                />
              </div>

              {/* Final Engine Hours Logged */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Total Shift Engine Hours Logged
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="cat-input font-mono"
                  value={loggedEngineHours}
                  onChange={e => setLoggedEngineHours(parseFloat(e.target.value))}
                />
              </div>

              {/* Return Condition */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Return Condition Assessment
                </label>
                <select
                  className="cat-select"
                  value={finalCondition}
                  onChange={e => setFinalCondition(e.target.value)}
                >
                  <option value="Excellent Condition">Excellent Condition (Ready to Reassign)</option>
                  <option value="Minor Wear">Minor Wear (Passed Check)</option>
                  <option value="Needs Maintenance">Needs Maintenance (Send to Shop)</option>
                </select>
              </div>

              <button type="submit" className="cat-btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                <CheckCircle size={16} />
                <span>Complete Check-In & Close Rental</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Operational Audit Protocol Lifecycle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="cat-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFCD11', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Four-Phase Asset Traceability Lifecycle
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(255, 205, 17, 0.15)', padding: '0.5rem', borderRadius: '6px', color: '#FFCD11' }}>
                  <QrCode size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>01. CHECK OUT</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)' }}>
                    Scan asset QR or tap RFID tag. Register baseline engine hours and condition inspection.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '0.5rem', borderRadius: '6px', color: '#60A5FA' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>02. ASSIGN & TRACK</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)' }}>
                    Associate authenticated operator credentials and bind telemetry feed to target site coordinates.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '6px', color: '#34D399' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>03. LOG TELEMETRY</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)' }}>
                    Continuously measure engine run-hours, idle ratio, fuel consumption, and anomaly signals.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '0.5rem', borderRadius: '6px', color: '#FBBF24' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>04. CHECK IN & AUDIT</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)' }}>
                    Final return condition verified. Rental billing closed with zero unaccounted equipment loss.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
