import React, { InputHTMLAttributes, forwardRef, useState } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  guide?: string; // Placeholder guía o tip explicativo
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, guide, error, icon, style, className = '', disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
        {label && (
          <label
            style={{
              fontSize: '0.86rem',
              fontWeight: 600,
              color: error ? '#d93838' : isFocused ? 'var(--jos-700)' : 'var(--text-main)',
              transition: 'color var(--transition-fast)',
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </label>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            width: '100%',
          }}
        >
          {icon && (
            <div
              style={{
                position: 'absolute',
                left: '1rem',
                color: isFocused ? 'var(--jos-500)' : 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                transition: 'color var(--transition-fast)',
              }}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={`jos-input ${className}`}
            style={{
              width: '100%',
              padding: icon ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem',
              fontSize: '0.92rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              border: error
                ? '1.5px solid #d93838'
                : isFocused
                ? '1.5px solid var(--jos-500)'
                : '1px solid var(--border-subtle)',
              outline: 'none',
              boxShadow: isFocused ? '0 0 0 3px var(--border-glow)' : 'var(--shadow-subtle)',
              transition: 'all var(--transition-fast)',
              ...style,
            }}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>

        {/* Guía o error */}
        {error ? (
          <span style={{ fontSize: '0.75rem', color: '#d93838', fontWeight: 500 }}>
            {error}
          </span>
        ) : guide ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
            💡 {guide}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
