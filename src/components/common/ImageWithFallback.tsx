import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'treatment' | 'avatar';
  initials?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackType = 'treatment',
  initials = 'EJ',
  style,
  className,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  // Si no hay src o falló la carga, mostramos el fallback elegante con la paleta lila
  if (!src || hasError) {
    if (fallbackType === 'avatar') {
      return (
        <div
          className={className}
          style={{
            width: style?.width || '88px',
            height: style?.height || '88px',
            borderRadius: style?.borderRadius || '50%',
            background: 'linear-gradient(135deg, var(--jos-700) 0%, var(--jos-500) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            boxShadow: '0 4px 14px rgba(129, 99, 139, 0.25)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            userSelect: 'none',
            flexShrink: 0,
            ...style,
          }}
        >
          {initials}
        </div>
      );
    }

    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '160px',
          background: 'linear-gradient(135deg, rgba(218, 201, 223, 0.4) 0%, rgba(247, 191, 216, 0.25) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--jos-700)',
          border: '1px solid var(--border-subtle)',
          borderRadius: style?.borderRadius || 'var(--radius-md)',
          userSelect: 'none',
          ...style,
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <Sparkles size={20} color="var(--jos-500)" />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', textAlign: 'center', padding: '0 1rem' }}>
          {alt || 'Estética Jos'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};
