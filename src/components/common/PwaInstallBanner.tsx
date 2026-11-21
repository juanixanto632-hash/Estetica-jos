import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('jos_pwa_dismissed') === 'true';
  });
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosInstructions, setShowIosInstructions] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si ya está ejecutándose como aplicación instalada (standalone)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);

    // Detectar si es iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capturar evento de instalación en Android y navegadores de escritorio (Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Error al solicitar instalación de PWA:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('jos_pwa_dismissed', 'true');
  };

  // Si ya está instalada o descartada, o no hay soporte listo y no es iOS, no mostrar banner
  if (isStandalone || isDismissed) {
    return null;
  }

  // En navegadores que soportan prompt o en iOS
  const canShow = !!deferredPrompt || (isIos && !isDismissed);
  if (!canShow) {
    return null;
  }

  return (
    <>
      <div
        className="glass-panel"
        style={{
          margin: '0 auto 1.5rem',
          maxWidth: '1140px',
          width: '100%',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-active)',
          background: 'linear-gradient(135deg, rgba(253, 248, 253, 0.85) 0%, rgba(247, 191, 216, 0.25) 100%)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 280px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--jos-700)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(129, 99, 139, 0.3)',
            }}
          >
            <Smartphone size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)' }}>
                Instala Estética Jos en tu Teléfono
              </strong>
              <span
                style={{
                  background: 'var(--badge-bg)',
                  color: 'var(--badge-text)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-pill)',
                  textTransform: 'uppercase',
                }}
              >
                App Oficial
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Accede a tus citas, catálogo y promociones al instante sin ocupar espacio de memoria.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Button
            variant="primary"
            size="sm"
            icon={<Download size={15} />}
            onClick={handleInstallClick}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.84rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(129, 99, 139, 0.25)',
            }}
          >
            Instalar App
          </Button>

          <button
            onClick={handleDismiss}
            aria-label="Cerrar aviso de instalación"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Modal de instrucciones para iOS (Safari) */}
      {showIosInstructions && (
        <div
          onClick={() => setShowIosInstructions(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface-elevated)',
              boxShadow: 'var(--shadow-modal)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--badge-bg)',
                color: 'var(--jos-700)',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share size={26} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--jos-700)', margin: '0 0 0.5rem' }}>
                Instalar en iPhone o iPad
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                En Safari de Apple no existe instalación automática con un toque. Para instalar la app de Estética Jos sigue estos dos pasos:
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--jos-700)' }}>1.</span>
                <span>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra de Safari.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--jos-700)' }}>2.</span>
                <span>Desliza hacia abajo y selecciona <strong>"Agregar a Inicio"</strong> (Add to Home Screen).</span>
              </div>
            </div>

            <Button variant="primary" size="md" onClick={() => setShowIosInstructions(false)} style={{ width: '100%' }}>
              Entendido
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
