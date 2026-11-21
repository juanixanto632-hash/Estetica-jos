import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, ExternalLink, CreditCard } from 'lucide-react';
import { Button, Card } from '../../components/common';

export const ContactScreen: React.FC = () => {
  const googleMapsUrl = 'https://maps.app.goo.gl/X5UC4cYbA2PccveB7';
  const whatsappUrl = 'https://wa.me/+584147518902?text=Hola%20Est%C3%A9tica%20Jos,%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20su%20ubicaci%C3%B3n%20y%20citas.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
      {/* Encabezado */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--badge-bg)',
            color: 'var(--badge-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          <MapPin size={14} /> Mérida, Venezuela
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--jos-700)' }}>
          Ubicación & Contacto
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Visítanos en nuestra sede en Mérida o contáctanos por WhatsApp para programar tu cita y aclarar cualquier duda.
        </p>
      </div>

      {/* Grid de Información y Mapa */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Tarjeta de Datos de Contacto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card enableTilt={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Dirección */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    color: 'var(--jos-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--jos-700)' }}>
                    Dirección de la Sede
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Urbanización La Mata, Centro Comercial Naranjo, Piso 2, Local 22.<br />
                    Mérida 5101, Estado Mérida, Venezuela.
                  </p>
                </div>
              </div>

              {/* Teléfono / WhatsApp */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    color: 'var(--jos-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--jos-700)' }}>
                    Atención por WhatsApp
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    +58 414-7518902
                  </p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    Respuesta rápida y confirmación de citas
                  </span>
                </div>
              </div>

              {/* Horario */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    color: 'var(--jos-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--jos-700)' }}>
                    Horario de Atención
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    Lunes a Sábado: 8:30 AM – 5:30 PM
                  </p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    Domingos: Previa cita programada
                  </span>
                </div>
              </div>

              {/* Medios de Pago */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    color: 'var(--jos-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CreditCard size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--jos-700)' }}>
                    Métodos de Pago
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Pago Móvil Banesco vía WhatsApp (tasa BCV). Efectivo y Punto de Venta presencial en cabina (CC Naranjo). Zelle y Binance a convenir por WhatsApp.
                  </p>
                </div>
              </div>

              {/* Botón WhatsApp Directo */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
                  <Button
                    variant="primary"
                    size="md"
                    style={{ width: '100%' }}
                    icon={<MessageCircle size={18} />}
                  >
                    Escribir por WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Mapa de Google Embebido */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            className="glass-panel-elevated"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'var(--shadow-floating)',
            }}
          >
            {/* Header del Mapa */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <MapPin size={18} color="var(--jos-700)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Centro Comercial Naranjo, Urb. La Mata
              </span>
            </div>

            {/* Iframe Embebido de Google Maps */}
            <div style={{ width: '100%', height: '360px', position: 'relative' }}>
              <iframe
                title="Ubicación de Estética Jos en Mérida"
                src="https://www.google.com/maps?q=Urbanizacion+La+Mata+Centro+Comercial+Naranjo+Merida+Venezuela&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Footer con enlace directo */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📍 Piso 2, Local 22 · Estacionamiento disponible
              </span>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" icon={<ExternalLink size={14} />}>
                  Ver en Google Maps
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
