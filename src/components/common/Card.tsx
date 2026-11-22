import React, { useState } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'flat' | 'bordered';
  enableTilt?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  enableTilt = true,
  padding = 'md',
  header,
  footer,
  badge,
  style,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const paddingStyles: Record<string, string> = {
    none: '0',
    sm: '0.85rem',
    md: '1.25rem',
    lg: '1.75rem',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    glass: {
      background: 'var(--bg-surface)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: isHovered ? '1px solid var(--jos-500)' : '1px solid var(--border-subtle)',
      boxShadow: isHovered ? 'var(--shadow-floating)' : 'var(--shadow-card)',
    },
    elevated: {
      background: 'var(--bg-surface-elevated)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: isHovered ? '1px solid var(--jos-500)' : '1px solid var(--border-medium)',
      boxShadow: isHovered ? 'var(--shadow-floating)' : 'var(--shadow-floating)',
    },
    flat: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-subtle)',
    },
    bordered: {
      background: 'var(--bg-surface)',
      border: '1.5px solid var(--border-active)',
      boxShadow: 'var(--shadow-card)',
    },
  };

  return (
    <div
      onMouseEnter={() => enableTilt && setIsHovered(true)}
      onMouseLeave={() => enableTilt && setIsHovered(false)}
      className={`jos-card ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        transform: isHovered && enableTilt ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {badge && (
        <div
          className="absolute right-3 top-3 z-10 pointer-events-none"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {badge}
        </div>
      )}

      {header && (
        <div
          style={{
            padding: `${paddingStyles[padding]} ${paddingStyles[padding]} 0.5rem`,
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {header}
        </div>
      )}

      <div style={{ padding: paddingStyles[padding], flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {footer && (
        <div
          style={{
            padding: `0.75rem ${paddingStyles[padding]} ${paddingStyles[padding]}`,
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 'auto',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
