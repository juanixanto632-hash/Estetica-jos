import React from 'react';
import { X, Trash2, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { Button } from './Button';

import { ServiceCategory } from '../../data/mockData';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
}

export interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onExploreCatalog?: () => void;
}

export const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onCheckout,
  onExploreCatalog,
}) => {
  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);
  const totalMinutes = items.reduce((acc, item) => acc + item.durationMinutes, 0);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-overlay)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Drawer */}
      <div
        className="glass-panel-elevated"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 105,
          borderRadius: 0,
          borderLeft: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
          animation: 'slideInRight 260ms var(--spring-ease) forwards',
        }}
      >
        {/* Header con Safe Area para Notch/Island en iPhone */}
        <div
          style={{
            padding: 'calc(env(safe-area-inset-top, 0px) + 1.15rem) 1.5rem 1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShoppingBag size={20} color="var(--jos-500)" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--jos-700)', margin: 0 }}>
              Mi Cita ({items.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar carrito"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-pill)',
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

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '70%',
                textAlign: 'center',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--jos-500)',
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  No tienes servicios seleccionados
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Explora nuestro catálogo facial y corporal y añade tu tratamiento favorito.
                </p>
              </div>

              {/* Botón morado principal para explorar catálogo */}
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onExploreCatalog?.();
                }}
                style={{
                  padding: '0.65rem 1.6rem',
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: '0 4px 14px rgba(129, 99, 139, 0.3)',
                  fontWeight: 600,
                }}
              >
                Explorar Catálogo
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {item.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} color="var(--jos-500)" />
                        {item.durationMinutes} min
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--jos-700)' }}>
                        ${item.price} USD
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Eliminar ${item.name}`}
                    style={{
                      padding: '0.5rem',
                      color: 'var(--text-light)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-light)')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con Safe Area Inferior para iPhone */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem calc(1.25rem + env(safe-area-inset-bottom, 0px)) 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tiempo estimado:</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, marginLeft: '0.4rem', color: 'var(--text-main)' }}>
                  {totalMinutes} min
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>Total Estimado:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--jos-700)' }}>
                  ${totalPrice} USD
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              onClick={() => {
                onCheckout();
                onClose();
              }}
            >
              Agendar Cita
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
