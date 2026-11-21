import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnectedToast) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.45rem 1rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: '0.82rem',
        fontWeight: 600,
        boxShadow: 'var(--shadow-floating)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all var(--transition-normal)',
        background: isOnline
          ? 'rgba(34, 197, 94, 0.92)'
          : 'rgba(239, 68, 68, 0.92)',
        color: '#ffffff',
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={15} />
          <span>¡Conexión restablecida! Datos sincronizados.</span>
        </>
      ) : (
        <>
          <WifiOff size={15} />
          <span>Modo sin conexión. Tus citas y catálogo siguen disponibles.</span>
        </>
      )}
    </div>
  );
};
