import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  trend?: { value: string; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  subtitleColor,
  icon,
  accentColor = '#0535E9',
  trend,
}) => {
  const lightBg = accentColor === '#0535E9' ? 'rgba(5,53,233,0.07)'
    : accentColor === '#52c41a' ? 'rgba(82,196,26,0.09)'
    : accentColor === '#faad14' ? 'rgba(250,173,20,0.09)'
    : accentColor === '#ff4d4f' ? 'rgba(255,77,79,0.09)'
    : 'rgba(5,53,233,0.07)';

  return (
    <div
      className="stat-card"
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E4E9FF',
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'default',
        boxShadow: '0 2px 16px rgba(5,53,233,0.07)',
        transition: 'box-shadow 0.25s, transform 0.25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(5,53,233,0.13)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(5,53,233,0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Icon */}
        {icon && (
          <div
            style={{
              width: 44,
              height: 44,
              background: lightBg,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}

        {/* Trend badge */}
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '3px 8px',
              borderRadius: 100,
              background: trend.isPositive ? 'rgba(82,196,26,0.1)' : 'rgba(255,77,79,0.1)',
              fontSize: 11,
              fontWeight: 700,
              color: trend.isPositive ? '#52c41a' : '#ff4d4f',
            }}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#0A0F1E',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#64748B',
            marginTop: 4,
            letterSpacing: '0.2px',
          }}
        >
          {title}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: subtitleColor || '#94A3B8',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            paddingTop: 8,
            borderTop: '1px solid #EEF1FF',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
