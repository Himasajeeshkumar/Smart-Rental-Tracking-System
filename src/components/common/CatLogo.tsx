import React from 'react';

interface CatLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const CatLogo: React.FC<CatLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div
        style={{
          width: size === 'sm' ? 32 : size === 'lg' ? 48 : 40,
          height: size === 'sm' ? 32 : size === 'lg' ? 48 : 40,
          backgroundColor: '#11141A',
          border: '1.5px solid #FFCD11',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 0 12px rgba(255, 205, 17, 0.25)',
          flexShrink: 0
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ width: '70%', height: '70%' }}
        >
          {/* Caterpillar Yellow Triangle */}
          <polygon points="15,85 50,20 85,85" fill="#FFCD11" />
          <polygon points="38,72 50,48 62,72" fill="#11141A" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              color: '#FFCD11',
              fontWeight: 900,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.06em',
              fontSize: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1.25rem',
              lineHeight: 1
            }}
          >
            CAT
          </span>
          <span
            style={{
              color: '#F3F4F6',
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.04em',
              fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1.05rem',
              lineHeight: 1
            }}
          >
            SMART RENTAL
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              color: '#9CA3AF',
              fontSize: size === 'sm' ? '0.65rem' : '0.725rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}
          >
            Operations & Telemetry
          </span>
        )}
      </div>
    </div>
  );
};
