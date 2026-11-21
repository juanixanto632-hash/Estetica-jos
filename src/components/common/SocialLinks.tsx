import React from 'react';

export const INSTAGRAM_URL = 'https://www.instagram.com/estetica_jos?dlrf=MTdyZnI2b25zbzlsYg%3D%3D&utm_source=qr';
export const TIKTOK_URL = 'https://www.tiktok.com/@esteticajos?_r=1&_t=ZS-9BT6SjltaWj';

// Ícono Vector de Instagram en Fondo Claro
export const InstagramVectorIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <div
    style={{
      width: '28px',
      height: '28px',
      borderRadius: '7px',
      background: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      flexShrink: 0,
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E1306C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  </div>
);

// Ícono Vector de TikTok en Fondo Claro
export const TikTokVectorIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <div
    style={{
      width: '28px',
      height: '28px',
      borderRadius: '7px',
      background: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      flexShrink: 0,
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#000000"
      style={{ display: 'block' }}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  </div>
);

interface SocialLinksProps {
  variant?: 'footer' | 'compact' | 'cards';
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ variant = 'footer' }) => {
  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Estética Jos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <InstagramVectorIcon size={17} />
        </a>

        <a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok de Estética Jos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <TikTokVectorIcon size={15} />
        </a>
      </div>
    );
  }

  // Estilo de botones elegantes alineados
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap',
      }}
    >
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram de Estética Jos (@estetica_jos)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 1.1rem 0.45rem 0.65rem',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-main)',
          fontSize: '0.86rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-subtle)',
          transition: 'all var(--transition-fast)',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(225, 48, 108, 0.4)';
          e.currentTarget.style.background = 'var(--bg-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
      >
        <InstagramVectorIcon size={17} />
        <span>@estetica_jos</span>
      </a>

      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok de Estética Jos (@esteticajos)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 1.1rem 0.45rem 0.65rem',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-main)',
          fontSize: '0.86rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-subtle)',
          transition: 'all var(--transition-fast)',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--jos-700)';
          e.currentTarget.style.background = 'var(--bg-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
      >
        <TikTokVectorIcon size={15} />
        <span>@esteticajos</span>
      </a>
    </div>
  );
};
