import React from 'react';

interface BadgeProps {
  variant?: 'active' | 'rented' | 'idle' | 'available' | 'overdue' | 'critical' | 'anomaly' | 'maintenance' | 'returned' | 'default';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, size = 'md' }) => {
  const variantClasses: { [key: string]: string } = {
    active: 'badge-active',
    rented: 'badge-rented',
    idle: 'badge-idle',
    available: 'badge-available',
    overdue: 'badge-overdue',
    critical: 'badge-critical',
    anomaly: 'badge-anomaly',
    maintenance: 'badge-maintenance',
    returned: 'badge-returned',
    default: 'bg-gray-800 text-gray-300 border border-gray-700'
  };

  const currentClass = variantClasses[variant.toLowerCase()] || variantClasses.default;

  return (
    <span
      className={currentClass}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        lineHeight: 1
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {children}
    </span>
  );
};
