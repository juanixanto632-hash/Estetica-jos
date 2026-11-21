import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../common';
import { CartItem } from '../common/Cart';

interface StickyAppointmentBarProps {
  items: CartItem[];
  onOpenBooking: () => void;
  onOpenWhatsApp?: () => void;
}

export const StickyAppointmentBar: React.FC<StickyAppointmentBarProps> = ({
  items,
  onOpenBooking,
}) => {
  if (items.length === 0) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const count = items.length;

  return (
    <div
      className="sticky-appointment-bar"
      style={{
        position: 'fixed',
        zIndex: 55,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 1.5rem)',
        maxWidth: '520px',
        background: 'var(--bg-surface-elevated)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1.5px solid var(--border-medium)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: 'var(--shadow-floating)',
        padding: '0.55rem 0.85rem 0.55rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        animation: 'slideUpBar 220ms var(--spring-ease)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--jos-700)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(129, 99, 139, 0.3)',
          }}
        >
          <ShoppingBag size={17} />
        </div>

        <div>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--jos-700)', lineHeight: 1.2 }}>
            {count} {count === 1 ? 'tratamiento' : 'tratamientos'} · ${totalAmount} USD
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Listo para agendar en Mérida
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Button
          variant="primary"
          size="sm"
          icon={<ArrowRight size={15} />}
          iconPosition="right"
          onClick={onOpenBooking}
          style={{
            padding: '0.45rem 1rem',
            fontSize: '0.84rem',
            boxShadow: '0 4px 12px rgba(129, 99, 139, 0.25)',
          }}
        >
          Ver mi cita
        </Button>
      </div>
    </div>
  );
};
