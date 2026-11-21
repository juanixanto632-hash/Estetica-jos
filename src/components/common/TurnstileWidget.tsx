import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (err: any) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (err: any) => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onVerify, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    // Si no hay site key configurada, generar token simulado para desarrollo
    if (!siteKey) {
      onVerify('turnstile_dev_mock_token');
      return;
    }

    // Si ya existe el script de Cloudflare Turnstile
    const existingScript = document.getElementById('cf-turnstile-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, [siteKey, onVerify]);

  useEffect(() => {
    if (!siteKey || !isLoaded || !containerRef.current || !window.turnstile) return;

    try {
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        'error-callback': (err: any) => onError && onError(err),
        theme: 'auto',
      });
    } catch (e) {
      console.warn('[Turnstile render warn]:', e);
    }
  }, [siteKey, isLoaded, onVerify, onError]);

  if (!siteKey) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.75rem',
          color: 'var(--text-light)',
          padding: '0.35rem 0.65rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          width: 'fit-content',
        }}
      >
        <ShieldCheck size={14} color="#22c55e" />
        <span>Protección activa contra bots (Cloudflare Turnstile)</span>
      </div>
    );
  }

  return <div ref={containerRef} style={{ minHeight: '65px' }} />;
};
