import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  glowVariant?: 'yellow' | 'red' | 'green' | 'none';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glowVariant = 'none',
  onClick
}) => {
  const glowClass = {
    yellow: 'cat-card-glow-yellow',
    red: 'cat-card-glow-red',
    green: 'cat-card-glow-green',
    none: ''
  }[glowVariant];

  return (
    <div
      className={`cat-card ${glowClass} ${onClick ? 'cat-card-interactive cursor-pointer' : ''}`}
      onClick={onClick}
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            color: 'var(--cat-text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          {title}
        </span>
        <div
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            backgroundColor: 'var(--cat-dark-700)',
            color: '#FFCD11',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--cat-border)'
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div
          className="font-mono"
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem'
          }}
        >
          {value}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          {subtitle && (
            <span style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: trend.isNeutral ? 'var(--cat-text-secondary)' : trend.isPositive ? '#34D399' : '#F87171',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
