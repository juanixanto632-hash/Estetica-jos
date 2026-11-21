import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  iconOn?: React.ReactNode;
  iconOff?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  iconOn,
  iconOff,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const isSmall = size === 'sm';
  const width = isSmall ? 44 : 52;
  const height = isSmall ? 24 : 28;
  const thumbSize = isSmall ? 18 : 22;
  const translateDistance = width - thumbSize - (isSmall ? 4 : 6);

  return (
    <label
      className={`jos-toggle ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: 'var(--radius-pill)',
          background: checked ? 'var(--jos-700)' : 'var(--bg-card)',
          border: '1.5px solid var(--border-subtle)',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          transition: 'background var(--transition-normal), border-color var(--transition-normal)',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div
          style={{
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            borderRadius: 'var(--radius-pill)',
            background: '#ffffff',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            transform: `translateX(${checked ? translateDistance : 2}px)`,
            transition: 'transform var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked ? iconOn : iconOff}
        </div>
      </div>

      {label && (
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>
          {label}
        </span>
      )}
    </label>
  );
};
