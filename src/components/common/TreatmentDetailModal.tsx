import React from 'react';
import { X, Clock, Sparkles, Check, Calendar } from 'lucide-react';
import { Service } from '../../data/mockData';
import { ImageWithFallback } from './ImageWithFallback';
import { Button } from './Button';

interface TreatmentDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (service: Service) => void;
  isAdded: boolean;
  onGoToBooking?: () => void;
}

export const TreatmentDetailModal: React.FC<TreatmentDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onAddToCart,
  isAdded,
  onGoToBooking,
}) => {
  if (!isOpen || !service) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
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
          transition: 'opacity var(--transition-normal)',
        }}
      />

      {/* Sheet / Modal Container */}
      <div
        className="treatment-detail-container"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-surface-elevated)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderTop: '1px solid var(--border-medium)',
          borderLeft: '1px solid var(--border-medium)',
          borderRight: '1px solid var(--border-medium)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 121,
          animation: 'slideUpSheet 260ms var(--spring-ease)',
        }}
      >
        {/* Handle de arrastre visual para móvil */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.65rem 0 0.25rem' }}>
          <div
            style={{
              width: '42px',
              height: '4px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--border-medium)',
            }}
          />
        </div>

        {/* Botón Cerrar Flotante */}
        <button
          onClick={onClose}
          aria-label="Cerrar detalles del tratamiento"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <X size={18} />
        </button>

        {/* Contenido con scroll suave */}
        <div style={{ overflowY: 'auto', padding: '0.5rem 1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Imagen de Cabecera */}
          <div
            style={{
              height: '210px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <ImageWithFallback
              src={service.image}
              alt={service.name}
              fallbackType="treatment"
            />
            {service.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: '0.85rem',
                  left: '0.85rem',
                  background: 'var(--jos-700)',
                  color: '#ffffff',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {service.badge}
              </span>
            )}
          </div>

          {/* Título & Badges Clave */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--jos-500)',
                  background: 'var(--badge-bg)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {service.category === 'facial' ? 'Tratamiento Facial' : service.category === 'corporal' ? 'Bienestar Corporal' : 'Nutrición Clínica'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <Clock size={14} color="var(--jos-700)" />
                {service.durationMinutes} minutos aprox.
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--jos-700)', lineHeight: 1.25, margin: 0 }}>
              {service.name}
            </h2>
          </div>

          {/* Precio & Inversión */}
          <div
            style={{
              padding: '0.85rem 1.15rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-light)', display: 'block' }}>Inversión oficial</span>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--jos-700)' }}>
                ${service.price} USD
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                Aceptamos Bolívares (BCV),
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Divisas, Zelle & USDT
              </span>
            </div>
          </div>

          {/* Descripción Completa */}
          <div>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--jos-700)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ¿En qué consiste el protocolo?
            </h4>
            <p style={{ color: 'var(--text-main)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
              {service.fullDescription}
            </p>
          </div>

          {/* Beneficios / Valor agregado */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(129, 99, 139, 0.08)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--jos-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} /> Beneficios & Garantía Estética Jos
            </span>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <li>Valoración y diagnóstico previo personalizado.</li>
              <li>Insumos descartables y aparatología de última generación.</li>
              <li>Atención en cabina climatizada con privacidad absoluta en CC Naranjo, Mérida.</li>
              {service.defaultProfessional && (
                <li>Especialista recomendada: <strong>{service.defaultProfessional}</strong>.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Fijo con Botón de Acción Principal y Safe Area */}
        <div
          style={{
            padding: '1rem 1.5rem calc(1rem + env(safe-area-inset-bottom, 0px)) 1.5rem',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <Button
            variant={isAdded ? 'secondary' : 'primary'}
            size="lg"
            icon={isAdded ? <Check size={18} color="#22c55e" /> : <Sparkles size={18} />}
            onClick={() => onAddToCart(service)}
            style={{ flex: 1 }}
          >
            {isAdded ? 'Agregado a tu cita ✓' : '+ Agregar a mi cita'}
          </Button>

          {onGoToBooking && isAdded && (
            <Button
              variant="primary"
              size="lg"
              icon={<Calendar size={18} />}
              onClick={() => {
                onClose();
                onGoToBooking();
              }}
            >
              Ir a Citas
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
