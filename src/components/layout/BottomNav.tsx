import React from 'react';
import { Home, Sparkles, UserCheck, Calendar } from 'lucide-react';

interface BottomNavProps {
  activeScreen: string;
  onSelectScreen: (screenId: string) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onSelectScreen,
  cartCount,
}) => {
  const items = [
    { id: 'inicio', label: 'Inicio', icon: <Home size={19} /> },
    { id: 'catalogo', label: 'Catálogo', icon: <Sparkles size={19} /> },
    {
      id: 'citas',
      label: 'Mi Cita',
      icon: <Calendar size={19} />,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { id: 'profesionales', label: 'Especialistas', icon: <UserCheck size={19} /> },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Navegación inferior móvil"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: 'var(--bg-surface)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0.2rem 0.5rem calc(0.25rem + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -4px 18px rgba(129, 99, 139, 0.08)',
      }}
    >
      {items.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectScreen(item.id)}
            aria-label={item.label}
            style={{
              flex: 1,
              maxWidth: '85px',
              minHeight: '40px',
              padding: '0.2rem 0.15rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.15rem',
              color: isActive ? 'var(--jos-700)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              transition: 'all var(--transition-fast)',
              userSelect: 'none',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span
                style={{
                  display: 'flex',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform var(--transition-fast)',
                  color: isActive ? 'var(--jos-700)' : 'currentColor',
                }}
              >
                {item.icon}
              </span>

              {item.badge !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-9px',
                    background: 'var(--jos-700)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: 'var(--radius-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '0.69rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
            >
              {item.label}
            </span>

            {/* Indicador sutil de pestaña activa */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  width: '16px',
                  height: '2px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--jos-700)',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
