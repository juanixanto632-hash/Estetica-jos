import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      disabled,
      style,
      className = '',
      ...props
    },
    ref
  ) => {
    // Definición de estilos por tamaño
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: '0.45rem 0.9rem',
        fontSize: '0.82rem',
        borderRadius: 'var(--radius-sm)',
        gap: '0.4rem',
      },
      md: {
        padding: '0.68rem 1.35rem',
        fontSize: '0.92rem',
        borderRadius: 'var(--radius-md)',
        gap: '0.55rem',
      },
      lg: {
        padding: '0.9rem 1.8rem',
        fontSize: '1.02rem',
        borderRadius: 'var(--radius-lg)',
        gap: '0.7rem',
      },
    };

    // Definición de estilos por variante
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--btn-primary-bg)',
        color: 'var(--btn-primary-text)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid transparent',
      },
      secondary: {
        background: 'var(--btn-secondary-bg)',
        color: 'var(--btn-secondary-text)',
        border: '1px solid var(--border-subtle)',
      },
      outline: {
        background: 'transparent',
        color: 'var(--jos-700)',
        border: '1.5px solid var(--jos-500)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-main)',
        border: '1px solid transparent',
      },
      glass: {
        background: 'var(--bg-surface)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
      },
    };

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      transition: 'all var(--transition-normal)',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      position: 'relative',
      overflow: 'hidden',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={baseStyle}
        className={`jos-button ${className}`}
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            if (variant === 'primary') {
              e.currentTarget.style.background = 'var(--btn-primary-hover)';
              e.currentTarget.style.boxShadow = 'var(--shadow-floating)';
            } else if (variant === 'secondary' || variant === 'glass') {
              e.currentTarget.style.borderColor = 'var(--border-active)';
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.transform = 'translateY(0)';
            if (variant === 'primary') {
              e.currentTarget.style.background = 'var(--btn-primary-bg)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            } else if (variant === 'secondary' || variant === 'glass') {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }
          }
        }}
        onMouseDown={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
          }
        }}
        onMouseUp={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
          }
        }}
        {...props}
      >
        {isLoading && <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />}
        {!isLoading && icon && iconPosition === 'left' && icon}
        {children}
        {!isLoading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
