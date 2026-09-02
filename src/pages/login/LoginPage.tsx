import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CatLogo } from '../../components/common/CatLogo';
import {
  Shield,
  KeyRound,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  HardHat,
  Check,
  User,
  UserPlus,
  LogIn,
  Lock
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    loginCompany,
    loginCustomer,
    registerCustomer,
    registeredCustomers
  } = useAuth();

  const [role, setRole] = useState<'company' | 'customer'>('company');
  const [customerMode, setCustomerMode] = useState<'signin' | 'register'>('signin');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [operatorId, setOperatorId] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect common email typos and provide instant fix
  const getEmailSuggestion = (val: string): string | null => {
    if (!val) return null;
    const trimmed = val.trim().toLowerCase();
    if (trimmed.includes('2gmil.com')) {
      return trimmed.replace('2gmil.com', '@gmail.com');
    }
    if (trimmed.includes('2gmail.com')) {
      return trimmed.replace('2gmail.com', '@gmail.com');
    }
    if (trimmed.includes('@gmil.com')) {
      return trimmed.replace('@gmil.com', '@gmail.com');
    }
    if (trimmed.includes('@gmai.com')) {
      return trimmed.replace('@gmai.com', '@gmail.com');
    }
    if (!trimmed.includes('@') && trimmed.includes('gmail.com')) {
      return trimmed.replace('gmail.com', '@gmail.com');
    }
    return null;
  };

  const emailSuggestion = getEmailSuggestion(email);

  // Quick fill customer sign in helper
  const handleSelectCustomerAccount = (acc: typeof registeredCustomers[0]) => {
    setEmail(acc.email);
    setOperatorId(acc.operatorId);
    setPassword(acc.password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (role === 'company') {
        const res = await loginCompany(email, password);
        if (res.success) {
          window.location.href = '/company/overview';
        } else {
          setError(res.error || 'Corporate authentication failed.');
        }
      } else if (customerMode === 'signin') {
        const res = await loginCustomer(email, password, operatorId);
        if (res.success) {
          window.location.href = '/customer/portal';
        } else {
          setError(res.error || 'Operator authentication failed.');
        }
      } else {
        // Customer Registration
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please verify and re-type.');
          setIsLoading(false);
          return;
        }

        const res = await registerCustomer({
          name: fullName,
          email,
          operatorId,
          password
        });

        if (res.success) {
          setSuccessMsg('Registration successful! Launching your Customer Portal...');
          setTimeout(() => {
            window.location.href = '/customer/portal';
          }, 1200);
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--cat-dark-900)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative'
      }}
      className="bg-industrial-grid"
    >
      {/* Top Hazard Accent Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px'
        }}
        className="cat-hazard-stripe"
      />

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--cat-dark-800)',
          border: '1px solid var(--cat-border)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(255, 205, 17, 0.08)',
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        {/* Header & Brand */}
        <div
          style={{
            padding: '1.75rem 2rem 1.25rem 2rem',
            textAlign: 'center',
            borderBottom: '1px solid var(--cat-border)',
            backgroundColor: 'var(--cat-dark-700)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
            <CatLogo size="lg" showSubtitle={false} />
          </div>
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '1.45rem',
              fontWeight: 800,
              margin: '0.4rem 0 0.2rem 0',
              letterSpacing: '-0.02em'
            }}
          >
            SMART RENTAL TRACKER
          </h1>
          <p
            style={{
              color: 'var(--cat-text-secondary)',
              fontSize: '0.825rem',
              margin: 0
            }}
          >
            Industrial Heavy Equipment Operations & Telemetry Gateway
          </p>
        </div>

        {/* Portal Selection Tabs */}
        <div style={{ padding: '1.25rem 2rem 0.5rem 2rem' }}>
          <div style={{ marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--cat-text-muted)',
                textTransform: 'uppercase'
              }}
            >
              Select Portal Type:
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              backgroundColor: 'var(--cat-dark-900)',
              padding: '0.35rem',
              borderRadius: '8px',
              border: '1px solid var(--cat-border)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole('company');
                setError(null);
                setSuccessMsg(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem',
                borderRadius: '6px',
                border: role === 'company' ? '1px solid #FFCD11' : '1px solid transparent',
                backgroundColor: role === 'company' ? '#FFCD11' : 'transparent',
                color: role === 'company' ? '#000000' : 'var(--cat-text-secondary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Shield size={16} />
              <span>Company Ops</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('customer');
                setError(null);
                setSuccessMsg(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem',
                borderRadius: '6px',
                border: role === 'customer' ? '1px solid #FFCD11' : '1px solid transparent',
                backgroundColor: role === 'customer' ? '#FFCD11' : 'transparent',
                color: role === 'customer' ? '#000000' : 'var(--cat-text-secondary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <HardHat size={16} />
              <span>Customer / Operator</span>
            </button>
          </div>
        </div>

        {/* CUSTOMER SUB-TABS: Sign In vs Register */}
        {role === 'customer' && (
          <div style={{ padding: '0.75rem 2rem 0 2rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                borderBottom: '1px solid var(--cat-border)',
                paddingBottom: '0.75rem'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('signin');
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: customerMode === 'signin' ? 'var(--cat-dark-700)' : 'transparent',
                  border: customerMode === 'signin' ? '1px solid #FFCD11' : '1px solid transparent',
                  color: customerMode === 'signin' ? '#FFCD11' : 'var(--cat-text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <LogIn size={15} />
                <span>Sign In (Existing)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomerMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: customerMode === 'register' ? 'var(--cat-dark-700)' : 'transparent',
                  border: customerMode === 'register' ? '1px solid #34D399' : '1px solid transparent',
                  color: customerMode === 'register' ? '#34D399' : 'var(--cat-text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <UserPlus size={15} />
                <span>Register (First Time)</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 2rem 1.75rem 2rem' }}>
          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34D399',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Check size={16} color="#34D399" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* REGISTER EXTRA FIELD: Full Name */}
          {role === 'customer' && customerMode === 'register' && (
            <div style={{ marginBottom: '1.1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  color: 'var(--cat-text-secondary)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Full Operator / Customer Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="cat-input"
                  placeholder="e.g. Himas Ajeesh or Marcus Vance"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User
                  size={16}
                  color="#6B7280"
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          )}

          {/* EMAIL INPUT */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: 'var(--cat-text-secondary)',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              {role === 'company'
                ? 'Authorized Company Operational Email'
                : customerMode === 'register'
                ? 'Your Email Address (For Telemetry Alerts)'
                : 'Registered Customer Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="cat-input"
                placeholder={
                  role === 'company'
                    ? 'ops.lead@caterpillar-rentals.com'
                    : 'himasajeesh2005@gmail.com'
                }
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={16}
                color="#6B7280"
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* Smart Email Suggestion Chip */}
            {emailSuggestion && (
              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>Did you mean:</span>
                <button
                  type="button"
                  onClick={() => setEmail(emailSuggestion)}
                  style={{
                    background: 'rgba(255, 205, 17, 0.15)',
                    border: '1px solid #FFCD11',
                    color: '#FFCD11',
                    borderRadius: '4px',
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {emailSuggestion} (Click to apply)
                </button>
              </div>
            )}
          </div>

          {/* CUSTOMER FIELD: Operator ID */}
          {role === 'customer' && (
            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label
                  style={{
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    color: '#FFCD11',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Operator ID {customerMode === 'register' ? '(Assign ID)' : ''}
                </label>
                <span style={{ fontSize: '0.675rem', color: 'var(--cat-text-muted)' }}>
                  e.g. OP3457, OP4013, OP1307
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="cat-input font-mono"
                  placeholder="OP3457"
                  value={operatorId}
                  onChange={e => setOperatorId(e.target.value.toUpperCase())}
                  style={{
                    paddingLeft: '2.5rem',
                    borderColor: 'rgba(255, 205, 17, 0.4)',
                    color: '#FFCD11',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                />
                <HardHat
                  size={16}
                  color="#FFCD11"
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          )}

          {/* PASSWORD INPUT */}
          <div style={{ marginBottom: customerMode === 'register' ? '1.1rem' : '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: 'var(--cat-text-secondary)',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              {customerMode === 'register' ? 'Create Secure Password' : 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="cat-input"
                placeholder={customerMode === 'register' ? 'Choose a password (min 4 chars)' : '••••••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <KeyRound
                size={16}
                color="#6B7280"
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* REGISTER EXTRA FIELD: Confirm Password */}
          {role === 'customer' && customerMode === 'register' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  color: 'var(--cat-text-secondary)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="cat-input"
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={16}
                  color="#6B7280"
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="cat-btn-primary"
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              backgroundColor: role === 'customer' && customerMode === 'register' ? '#10B981' : '#FFCD11',
              color: role === 'customer' && customerMode === 'register' ? '#FFFFFF' : '#000000'
            }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : role === 'company' ? (
              <>
                <span>Sign In to Company Operations</span>
                <ArrowRight size={18} />
              </>
            ) : customerMode === 'signin' ? (
              <>
                <span>Sign In to Customer Portal</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <span>Complete Registration & Enter</span>
                <Check size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Note */}
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--cat-dark-900)',
            borderTop: '1px solid var(--cat-border)',
            textAlign: 'center',
            fontSize: '0.7rem',
            color: 'var(--cat-text-muted)'
          }}
        >
          Protected System &bull; Secure Corporate Authentication &bull; Automatic Telemetry Dispatch
        </div>
      </div>
    </div>
  );
};
