import React, { useState, useEffect } from 'react';
import {
  Gift,
  Sparkles,
  Mail,
  User,
  Heart,
  MessageCircle,
  ShieldCheck,
  Clock,
  MapPin,
} from 'lucide-react';
import { Button, Input, Card } from '../../components/common';
import { SERVICES_DATA, Service } from '../../data/mockData';
import { APPS_SCRIPT_URL } from '../../config/appsScript';

interface GiftCardScreenProps {
  onNavigateHome?: () => void;
  onGoToBooking?: () => void;
}

export interface GiftCardRequestRecord {
  code: string;
  senderName: string;
  recipientName: string;
  service: Service;
  deliveryOption: 'sender' | 'recipient';
  deliveryEmail: string;
  createdAt: string;
  status: 'Pendiente de Pago' | 'Confirmado';
}

/**
 * Componente interactivo 3D Tilt para la Gift Card (Estilo Apple Pay / Tarjeta Luxury)
 * Muestra la plantilla oficial 100% limpia sin textos superpuestos.
 * Manipulación directa del DOM con requestAnimationFrame para cero parpadeo y máxima fluidez (60/120 fps).
 */
export const InteractiveGiftCard: React.FC = () => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const glareRef = React.useRef<HTMLDivElement>(null);
  const rafId = React.useRef<number | null>(null);

  const handlePointer = (clientX: number, clientY: number, target: HTMLElement) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      const glare = glareRef.current;
      if (!card) return;

      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const px = (x / rect.width) * 2 - 1; // Rango de -1 a 1
      const py = (y / rect.height) * 2 - 1; // Rango de -1 a 1

      // Ángulo sutil de -5deg a 5deg
      const rotateY = px * 5;
      const rotateX = -py * 5;
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease-out';
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.boxShadow = '0 16px 32px -4px rgba(88, 28, 135, 0.22), 0 8px 16px -4px rgba(88, 28, 135, 0.12)';

      if (glare) {
        glare.style.opacity = '0.38';
        glare.style.background = `radial-gradient(circle 260px at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 75%)`;
      }
    });
  };

  const handleReset = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = '0 10px 25px -5px rgba(88, 28, 135, 0.15), 0 4px 10px -2px rgba(88, 28, 135, 0.08)';

    if (glare) {
      glare.style.opacity = '0';
    }
  };

  React.useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      className="w-full max-w-full"
      style={{
        perspective: '1000px',
        width: '100%',
        maxWidth: '100%',
        touchAction: 'pan-y',
        display: 'flex',
        justifyContent: 'center',
        padding: '0.25rem 0',
        boxSizing: 'border-box',
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={(e) => handlePointer(e.clientX, e.clientY, e.currentTarget)}
        onMouseLeave={handleReset}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) handlePointer(touch.clientX, touch.clientY, e.currentTarget);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) handlePointer(touch.clientX, touch.clientY, e.currentTarget);
        }}
        onTouchEnd={handleReset}
        onTouchCancel={handleReset}
        className="w-full aspect-[16/9] relative overflow-hidden rounded-2xl shadow-lg shadow-purple-900/15 select-none cursor-grab active:cursor-grabbing touch-pan-y transform-gpu"
        style={{
          width: '100%',
          maxWidth: '100%',
          aspectRatio: '16/9',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1rem',
          border: '1px solid rgba(129, 99, 139, 0.22)',
          background: 'transparent',
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          boxShadow: '0 10px 25px -5px rgba(88, 28, 135, 0.15), 0 4px 10px -2px rgba(88, 28, 135, 0.08)',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          willChange: 'transform, box-shadow',
          boxSizing: 'border-box',
        }}
      >
        {/* Imagen oficial 100% limpia sin textos superpuestos */}
        <img
          src="/gift-card-template.png"
          alt="Plantilla Gift Card Estética Jos"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
            borderRadius: '1rem',
          }}
          draggable={false}
        />

        {/* Reflejo holográfico interactivo sutil */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl overflow-hidden"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: '1rem',
            opacity: 0,
            transition: 'opacity 0.25s ease-out',
            mixBlendMode: 'overlay',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export const GiftCardScreen: React.FC<GiftCardScreenProps> = ({
  onNavigateHome,
}) => {
  // Datos del formulario
  const [senderName, setSenderName] = useState<string>(() => localStorage.getItem('jos_patient_name') || '');
  const [recipientName, setRecipientName] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => SERVICES_DATA[0]?.id || '');
  
  // Opción de entrega: 'sender' (a quien compra) o 'recipient' (directo a quien recibe)
  const [deliveryOption, setDeliveryOption] = useState<'sender' | 'recipient'>('sender');
  const [senderEmail, setSenderEmail] = useState<string>(() => localStorage.getItem('jos_patient_email') || '');
  const [recipientEmail, setRecipientEmail] = useState<string>('');

  // Estados de interfaz y envío
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedCard, setConfirmedCard] = useState<GiftCardRequestRecord | null>(null);

  // Tratamiento actual seleccionado
  const selectedService: Service =
    SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  // Correo efectivo según opción elegida
  const activeDeliveryEmail = deliveryOption === 'sender' ? senderEmail : recipientEmail;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activeDeliveryEmail.trim());
  const isFormValid =
    senderName.trim().length > 0 &&
    recipientName.trim().length > 0 &&
    isEmailValid;

  // Scroll arriba al montar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [confirmedCard]);

  // Validaciones antes de solicitar
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!senderName.trim()) {
      errs.senderName = 'Por favor ingresa tu nombre (quién regala).';
    }
    if (!recipientName.trim()) {
      errs.recipientName = 'Por favor ingresa el nombre de quien recibe el regalo.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (deliveryOption === 'sender') {
      if (!senderEmail.trim()) {
        errs.senderEmail = 'Ingresa tu correo para enviarte la Gift Card.';
      } else if (!emailRegex.test(senderEmail.trim())) {
        errs.senderEmail = 'Correo electrónico inválido.';
      }
    } else {
      if (!recipientEmail.trim()) {
        errs.recipientEmail = 'Ingresa el correo del beneficiario.';
      } else if (!emailRegex.test(recipientEmail.trim())) {
        errs.recipientEmail = 'Correo electrónico inválido.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Generador de código aleatorio de canje
  const generateGiftCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'GIFT-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Manejo de solicitud y guardado
  const handleRequestGiftCard = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const giftCode = generateGiftCode();
    const effectiveEmail = activeDeliveryEmail.trim().toLowerCase();

    const record: GiftCardRequestRecord = {
      code: giftCode,
      senderName: senderName.trim(),
      recipientName: recipientName.trim(),
      service: selectedService,
      deliveryOption,
      deliveryEmail: effectiveEmail,
      createdAt: new Date().toISOString(),
      status: 'Pendiente de Pago',
    };

    // 1. Guardar en almacenamiento local
    try {
      const existing = JSON.parse(localStorage.getItem('jos_gift_cards') || '[]');
      existing.unshift(record);
      localStorage.setItem('jos_gift_cards', JSON.stringify(existing));
      if (senderName.trim()) localStorage.setItem('jos_patient_name', senderName.trim());
      if (senderEmail.trim()) localStorage.setItem('jos_patient_email', senderEmail.trim().toLowerCase());
    } catch {
      // Silencioso
    }

    // 2. Registro en Google Sheets mediante Netlify Function /api/request-gift-card o Apps Script
    const giftPayload = {
      action: 'request_gift_card',
      codigo: giftCode,
      fecha: new Date().toLocaleDateString('es-VE'),
      de: senderName.trim(),
      para: recipientName.trim(),
      tratamiento: selectedService.name,
      precio: selectedService.price,
      correo_entrega: effectiveEmail,
      estado: 'Pendiente',
      honeypot: '',
      turnstileToken: 'turnstile_dev_mock_token',
    };

    try {
      const res = await fetch('/api/request-gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftPayload),
      });

      if (!res.ok && APPS_SCRIPT_URL) {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(giftPayload),
        });
      }
    } catch {
      if (APPS_SCRIPT_URL) {
        try {
          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(giftPayload),
          });
        } catch (sheetErr) {
          console.warn('[GiftCard] Error sincronizando con Google Sheets:', sheetErr);
        }
      }
    }

    setConfirmedCard(record);
    setIsLoading(false);

    // 3. Abrir WhatsApp hacia el número oficial con mensaje estructurado
    const rawMessage = `Hola Estética Jos, acabo de solicitar una Gift Card en la app 🎁\n• Código: ${giftCode}\n• De: ${senderName.trim()}\n• Para: ${recipientName.trim()}\n• Tratamiento: ${selectedService.name} ($${selectedService.price} USD)\n• Correo de entrega: ${effectiveEmail}\nEnvío mi comprobante para validar el pago y activar el envío digital por correo. ¡Gracias!`;
    const whatsappUrl = `https://wa.me/+584147518902?text=${encodeURIComponent(rawMessage)}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // ==========================================
  // PANTALLA DE CONFIRMACIÓN DE SOLICITUD
  // ==========================================
  if (confirmedCard) {
    return (
      <div
        className="w-full max-w-full overflow-x-hidden px-4 sm:px-0"
        style={{ maxWidth: '680px', margin: '0 auto', width: '100%', padding: '1rem 0', boxSizing: 'border-box' }}
      >
        <Card enableTilt={false}>
          <div
            className="w-full max-w-full overflow-x-hidden"
            style={{
              padding: '2.5rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1.25rem',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(234, 179, 8, 0.18)',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(234, 179, 8, 0.25)',
              }}
            >
              <Gift size={40} />
            </div>

            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(234, 179, 8, 0.2)',
                  color: '#b45309',
                  padding: '0.25rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}
              >
                ESTADO: PENDIENTE DE PAGO
              </div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--jos-700)', margin: '0 0 0.5rem' }}>
                ¡Solicitud de Gift Card Generada!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '520px', margin: '0 auto' }}>
                Tu código único es <strong>{confirmedCard.code}</strong>. Ya se abrió WhatsApp para que compartas tu comprobante de pago y activemos la entrega digital oficial.
              </p>
            </div>

            {/* Vista Previa Interactiva 3D de la Tarjeta Limpia Oficial */}
            <div className="w-full max-w-full my-1">
              <InteractiveGiftCard />
            </div>

            {/* Ficha Resumen de la Solicitud */}
            <div
              className="w-full max-w-full"
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="flex justify-between items-center gap-4"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
              >
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  Código de Canje: 
                </span>
                <strong
                  className="whitespace-nowrap"
                  style={{ color: 'var(--jos-700)', fontFamily: 'monospace', fontSize: '1.05rem', whiteSpace: 'nowrap' }}
                >
                  {confirmedCard.code}
                </strong>
              </div>
              <div
                className="flex justify-between items-start gap-4 text-right"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', textAlign: 'right' }}
              >
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  Tratamiento: 
                </span>
                <strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>
                  {confirmedCard.service.name}
                </strong>
              </div>
              <div
                className="flex justify-between items-start gap-4"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}
              >
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  De ➔ Para: 
                </span>
                <span style={{ textAlign: 'right' }}>
                  {confirmedCard.senderName} ➔ <strong>{confirmedCard.recipientName}</strong>
                </span>
              </div>
              <div
                className="flex justify-between items-start gap-4"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}
              >
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  Correo de entrega: 
                </span>
                <span style={{ textAlign: 'right', wordBreak: 'break-all' }}>
                  {confirmedCard.deliveryEmail}
                </span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600 }}>Monto a Validar:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--jos-700)' }}>
                  ${confirmedCard.service.price} USD
                </strong>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              Envía tu comprobante por WhatsApp para validar el pago y activar el envío digital por correo.
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}>
              <Button
                variant="primary"
                icon={<MessageCircle size={18} />}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
                }}
                onClick={() => {
                  const rawMessage = `Hola Estética Jos, acabo de solicitar una Gift Card en la app 🎁\n• Código: ${confirmedCard.code}\n• De: ${confirmedCard.senderName}\n• Para: ${confirmedCard.recipientName}\n• Tratamiento: ${confirmedCard.service.name} ($${confirmedCard.service.price} USD)\n• Correo de entrega: ${confirmedCard.deliveryEmail}\nEnvío mi comprobante para validar el pago y activar el envío digital por correo. ¡Gracias!`;
                  const url = `https://wa.me/+584147518902?text=${encodeURIComponent(rawMessage)}`;
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  if (isMobile) {
                    window.location.href = url;
                  } else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                Abrir WhatsApp Oficial
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setConfirmedCard(null);
                  onNavigateHome?.();
                }}
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ==========================================
  // PANTALLA PRINCIPAL: VISTA PREVIA Y FORMULARIO
  // ==========================================
  return (
    <div
      className="w-full max-w-full overflow-x-hidden px-4 sm:px-0"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Encabezado */}
      <div
        className="w-full max-w-full overflow-x-hidden"
        style={{
          textAlign: 'center',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
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
          <Gift size={14} /> Certificado de Regalo Exclusivo
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--jos-700)' }}>
          Gift Card Personalizada
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Regala una experiencia de bienestar y cuidado clínico en Mérida.
        </p>
      </div>

      {/* Cuadrícula Principal: Vista Previa Izquierda / Formulario Derecha */}
      <div
        className="w-full max-w-full overflow-x-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '2rem',
          alignItems: 'start',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* COLUMNA IZQUIERDA: VISTA PREVIA EN TIEMPO REAL */}
        <div
          className="w-full max-w-full overflow-x-hidden"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Contenedor interactivo 3D Tilt con perspectiva (tarjeta 100% limpia como protagonista) */}
          <InteractiveGiftCard />

          {/* Ficha Resumen en Vivo en Tiempo Real (debajo de la tarjeta limpia) */}
          <div
            className="glass-panel w-full"
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-lg, 16px)',
              background: 'var(--bg-card)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--border-subtle, rgba(129, 99, 139, 0.2))',
              boxShadow: '0 4px 16px rgba(129, 99, 139, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '0.88rem',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
                marginBottom: '0.15rem',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--jos-700)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={14} /> Resumen del Certificado
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>De: </span>
              <strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>
                {senderName.trim() || 'Tu Nombre (Quién regala)'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>Para: </span>
              <strong style={{ color: 'var(--jos-700)', textAlign: 'right' }}>
                {recipientName.trim() || 'Nombre de quien recibe'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>Vale por: </span>
              <strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>
                {selectedService.name} (${selectedService.price} USD)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>Correo de entrega: </span>
              <span style={{ color: 'var(--text-main)', textAlign: 'right', fontSize: '0.84rem', wordBreak: 'break-all' }}>
                {activeDeliveryEmail.trim() || (deliveryOption === 'sender' ? 'Tu correo registrado' : 'Correo de quien recibe')}
              </span>
            </div>
          </div>

          {/* Tira de Beneficios */}
          <div
            className="glass-panel"
            style={{
              padding: '0.9rem 1.15rem',
              borderRadius: 'var(--radius-md, 12px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--jos-500)" />
              <span><strong>Validez:</strong> 90 días continuos para canje</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--jos-500)" />
              <span><strong>Sede:</strong> Centro Comercial Naranjo, Piso 2, Mérida</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--jos-500)" />
              <span><strong>Canje Seguro:</strong> Activación oficial tras validar pago</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO DE PERSONALIZACIÓN */}
        <Card enableTilt={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
            {/* Campo 1: DE (Quién regala) */}
            <Input
              label="De (Quién regala)"
              placeholder="Ej. Carlos Morales"
              icon={<User size={18} />}
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              error={errors.senderName}
              style={{ minHeight: '48px', height: '48px' }}
            />

            {/* Campo 2: PARA (Para quién es el regalo) */}
            <Input
              label="Para (Nombre de quien recibe)"
              placeholder="Nombre de quien recibe"
              icon={<Heart size={18} />}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              error={errors.recipientName}
              style={{ minHeight: '48px', height: '48px' }}
            />

            {/* Campo 3: TRATAMIENTO A REGALAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Tratamiento a Regalar
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  height: '48px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.92rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {SERVICES_DATA.map((service) => (
                  <option key={service.id} value={service.id} style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}>
                    {service.name} — ${service.price} USD ({service.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Campo 4: CORREO ELECTRÓNICO DE ENTREGA (OPCIONES TIPO PILL) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                ¿A dónde enviamos la Gift Card digital?
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setDeliveryOption('sender')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    minHeight: '44px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    background: deliveryOption === 'sender' ? 'var(--jos-700)' : 'var(--bg-card)',
                    color: deliveryOption === 'sender' ? '#ffffff' : 'var(--text-main)',
                    border: deliveryOption === 'sender' ? '1.5px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                >
                  Enviar a mi correo
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryOption('recipient')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    minHeight: '44px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    background: deliveryOption === 'recipient' ? 'var(--jos-700)' : 'var(--bg-card)',
                    color: deliveryOption === 'recipient' ? '#ffffff' : 'var(--text-main)',
                    border: deliveryOption === 'recipient' ? '1.5px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                >
                  Directo a quien recibe
                </button>
              </div>

              {/* Input condicional de correo */}
              {deliveryOption === 'sender' ? (
                <Input
                  label="Tu Correo Electrónico"
                  type="email"
                  placeholder="tu.correo@ejemplo.com"
                  icon={<Mail size={18} />}
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  error={errors.senderEmail}
                  style={{ minHeight: '48px', height: '48px' }}
                />
              ) : (
                <Input
                  label="Correo del Beneficiario"
                  type="email"
                  placeholder="correo.del.amigo@ejemplo.com"
                  icon={<Mail size={18} />}
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  error={errors.recipientEmail}
                  style={{ minHeight: '48px', height: '48px' }}
                />
              )}
            </div>

            {/* Aviso de activación */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(129, 99, 139, 0.08)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
                textAlign: 'center',
              }}
            >
              ✨ Activación inmediata al confirmar tu pago vía WhatsApp
            </div>

            {/* Botón Principal de Solicitud */}
            <Button
              variant="primary"
              disabled={!isFormValid || isLoading}
              isLoading={isLoading}
              icon={<Gift size={18} />}
              onClick={handleRequestGiftCard}
              className={`w-full py-3.5 px-6 text-base font-semibold rounded-xl ${!isFormValid ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
              style={{
                width: '100%',
                minHeight: '48px',
                height: '48px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.96rem',
                fontWeight: 600,
                borderRadius: '0.75rem',
                boxShadow: isFormValid ? '0 4px 14px rgba(129, 99, 139, 0.3)' : 'none',
                opacity: !isFormValid ? 0.5 : 1,
                pointerEvents: !isFormValid ? 'none' : 'auto',
                cursor: !isFormValid ? 'not-allowed' : 'pointer',
              }}
            >
              Regalar Gift Card · ${selectedService.price} USD
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
