import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, MessageCircle, Mail, User } from 'lucide-react';
import { SERVICES_DATA, Service } from '../../data/mockData';
import { Button } from './Button';

interface GiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GiftCardModal: React.FC<GiftCardModalProps> = ({ isOpen, onClose }) => {
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState(() => localStorage.getItem('jos_patient_name') || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(SERVICES_DATA[0]?.id || 'fac-1');
  const [emailMode, setEmailMode] = useState<'registered' | 'custom'>('registered');
  const [emailInput, setEmailInput] = useState(() => localStorage.getItem('jos_patient_email') || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar correo registrado si cambia el toggle
  useEffect(() => {
    const registeredEmail = localStorage.getItem('jos_patient_email') || '';
    if (emailMode === 'registered') {
      setEmailInput(registeredEmail);
    } else {
      if (emailInput === registeredEmail) {
        setEmailInput('');
      }
    }
  }, [emailMode]);

  if (!isOpen) return null;

  const selectedService: Service = SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recipientName.trim()) {
      setErrorMsg('Por favor ingresa el nombre de la persona que recibirá la Gift Card.');
      return;
    }
    if (!senderName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre (quién envía el regalo).');
      return;
    }
    if (!emailInput.trim()) {
      setErrorMsg('Por favor indica el correo electrónico donde se enviará el vale digital.');
      return;
    }

    const message = encodeURIComponent(
      `Hola Estética Jos ✨, quiero solicitar una Gift Card personalizada:\n\n` +
      `🎁 Para: ${recipientName.trim()}\n` +
      `✍️ De: ${senderName.trim()}\n` +
      `✨ Vale por: ${selectedService.name} ($${selectedService.price} USD)\n` +
      `📧 Correo para envío: ${emailInput.trim()}\n\n` +
      `¿Cuáles son las opciones de pago para emitirla y activarla?`
    );

    window.open(`https://wa.me/+584147518902?text=${message}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
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

      {/* Modal Card */}
      <div
        className="glass-panel-elevated"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          background: 'var(--bg-surface-elevated)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 131,
          animation: 'fadeInScale 240ms var(--spring-ease)',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, var(--jos-700) 0%, var(--jos-500) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gift size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--jos-700)' }}>
                Regala una Gift Card
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Certificado digital de estética & bienestar en Mérida
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana de Gift Card"
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

        {/* Contenido con scroll */}
        <div style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* VISTA PREVIA EN TIEMPO REAL (Tarjeta Estilo Glassmorphism Pastel) */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(251, 213, 229, 0.75) 0%, rgba(218, 201, 223, 0.85) 50%, rgba(182, 149, 192, 0.6) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 12px 30px rgba(129, 99, 139, 0.22)',
              color: '#2b1832',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer decorativo de fondo */}
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.35)',
                filter: 'blur(35px)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img
                  src="/branding/logos/logo-circular.png"
                  alt="Estética Jos"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#59254f', display: 'block' }}>
                    Estética Jos
                  </span>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#81638b', fontWeight: 700 }}>
                    Vale de Regalo Exclusivo
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#59254f', fontWeight: 600, display: 'block' }}>Valor</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#59254f' }}>
                  ${selectedService.price} USD
                </span>
              </div>
            </div>

            {/* Datos dinámicos de la tarjeta */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#7b6285', fontWeight: 600 }}>Para:</span>
                <strong style={{ color: '#2b1832' }}>{recipientName.trim() || 'Nombre del agasajado'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#7b6285', fontWeight: 600 }}>De:</span>
                <strong style={{ color: '#2b1832' }}>{senderName.trim() || 'Tu nombre'}</strong>
              </div>

              <div style={{ borderTop: '1px dashed rgba(129, 99, 139, 0.25)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#7b6285', fontSize: '0.78rem', fontWeight: 600 }}>Tratamiento:</span>
                <span style={{ color: '#59254f', fontWeight: 700, fontSize: '0.86rem', textAlign: 'right' }}>
                  {selectedService.name}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#7b6285' }}>
              <span>Canjeable en cabina · Mérida, CC Naranjo</span>
              <span>Válido por 90 días</span>
            </div>
          </div>

          {/* Formulario Mobile-First */}
          <form onSubmit={handleSendWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errorMsg && (
              <div
                style={{
                  padding: '0.65rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 1. Para (Destinatario) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--jos-700)', marginBottom: '0.35rem' }}>
                1. ¿Para quién es el regalo? (Nombre completo) *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Ej: María Alejandra Ramírez"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 2. De (Remitente) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--jos-700)', marginBottom: '0.35rem' }}>
                2. ¿Quién lo regala? (Tu nombre) *
              </label>
              <div style={{ position: 'relative' }}>
                <Sparkles size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Ej: Carlos Gómez"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 3. Servicio a regalar */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--jos-700)', marginBottom: '0.35rem' }}>
                3. Tratamiento a obsequiar (Vale por) *
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {SERVICES_DATA.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — ${srv.price} USD ({srv.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Correo electrónico de envío + Toggle rápido */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--jos-700)' }}>
                  4. Correo de entrega digital *
                </label>
                {/* Selector rápido toggle */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setEmailMode('registered')}
                    style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: emailMode === 'registered' ? 'var(--jos-700)' : 'var(--bg-card)',
                      color: emailMode === 'registered' ? '#ffffff' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Mi correo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailMode('custom')}
                    style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: emailMode === 'custom' ? 'var(--jos-700)' : 'var(--bg-card)',
                      color: emailMode === 'custom' ? '#ffffff' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Destinatario
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder={emailMode === 'registered' ? 'Tu correo para recibir el certificado' : 'Correo de la persona que recibe el regalo'}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Acción Principal */}
            <div style={{ paddingTop: '0.5rem' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={<MessageCircle size={18} color="#22c55e" />}
                style={{ width: '100%', boxShadow: '0 8px 24px rgba(129, 99, 139, 0.35)' }}
              >
                Solicitar Gift Card por WhatsApp
              </Button>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', textAlign: 'center', display: 'block', marginTop: '0.45rem' }}>
                Se abrirá WhatsApp oficial con todos los datos prellenados para coordinar el pago.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
