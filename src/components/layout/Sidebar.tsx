import React from 'react';
import { X, Sparkles, UserCheck, HelpCircle, MapPin, Calendar, CalendarCheck, Home, ShoppingBag, UserPlus, Moon, Sun, Gift } from 'lucide-react';
import { SocialLinks, Toggle } from '../common';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string;
  onSelect: (id: string) => void;
  cartCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: (isDark: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeId,
  onSelect,
  cartCount = 0,
  theme = 'light',
  onToggleTheme,
}) => {
  const navItems: NavItem[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home size={18} /> },
    { id: 'catalogo', label: 'Catálogo', icon: <Sparkles size={18} /> },
    { id: 'profesionales', label: 'Especialistas', icon: <UserCheck size={18} /> },
    { id: 'citas', label: 'Agendar Cita', icon: <Calendar size={18} /> },
    { id: 'miscitas', label: 'Mis Citas', icon: <CalendarCheck size={18} /> },
    { id: 'giftcard', label: 'Gift Card', icon: <Gift size={18} /> },
    { id: 'carrito', label: 'Mi Cita / Carrito', icon: <ShoppingBag size={18} />, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'registro', label: 'Registro de Paciente', icon: <UserPlus size={18} /> },
    { id: 'faqs', label: 'Preguntas Frecuentes', icon: <HelpCircle size={18} /> },
    { id: 'contacto', label: 'Ubicación & Contacto', icon: <MapPin size={18} /> },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 90,
            transition: 'opacity var(--transition-normal)',
          }}
        />
      )}

      {/* Panel lateral estilo macOS */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '290px',
          background: 'var(--bg-surface-elevated)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: isOpen ? 'var(--shadow-floating)' : 'none',
          zIndex: 95,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-normal)',
          display: 'flex',
          flexDirection: 'column',
          padding: 'calc(env(safe-area-inset-top, 0px) + 1.15rem) 1rem calc(env(safe-area-inset-bottom, 0px) + 0.85rem) 1rem',
        }}
      >
        {/* Cabecera del Sidebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/branding/logos/logo-circular.png"
              alt="Logo Estética Jos"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-subtle)',
              }}
            />
            <div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--jos-700)', display: 'block' }}>
                Estética Jos
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 500 }}>
                Mérida, Venezuela
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegación estilo macOS sidebar con padding optimizado */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.52rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--jos-700)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: isActive ? '#ffffff' : 'var(--jos-500)', display: 'flex' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    style={{
                      background: isActive ? '#ffffff' : 'var(--badge-bg)',
                      color: isActive ? 'var(--jos-700)' : 'var(--badge-text)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '0.12rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Selector de Modo Oscuro en Sidebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            margin: '0.65rem 0 0.35rem 0',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {theme === 'dark' ? <Moon size={16} color="var(--jos-500)" /> : <Sun size={16} color="#f59e0b" />}
            <span>Modo Oscuro</span>
          </div>
          {onToggleTheme && (
            <Toggle
              checked={theme === 'dark'}
              onChange={onToggleTheme}
              iconOn={<Moon size={13} color="#81638b" />}
              iconOff={<Sun size={13} color="#f59e0b" />}
              size="sm"
            />
          )}
        </div>

        {/* Footer del Sidebar con Redes */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.85rem',
            marginTop: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', fontWeight: 600 }}>
            Síguenos en nuestras redes
          </span>
          <SocialLinks variant="compact" />
        </div>
      </aside>
    </>
  );
};
