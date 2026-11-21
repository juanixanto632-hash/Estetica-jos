import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Mail,
  Gift,
  Tag,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { Button, Card, Stepper, Input } from '../../components/common';
import { SERVICES_DATA, PROFESSIONALS_DATA, Service, Professional } from '../../data/mockData';
import { APPS_SCRIPT_URL } from '../../config/appsScript';
import { syncAppointment } from '../../utils/sheetService';
import { getOfficialBcvRate, formatBs, BcvRateInfo } from '../../utils/bcvService';
import { PAYMENT_ACCOUNTS } from '../../data/paymentAccounts';

export interface AppointmentRecord {
  id: string;
  services: string[];
  serviceNames: string;
  professional: string;
  date: string;
  time: string;
  totalPrice: number;
  paymentMethod: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  createdAt: string;
  giftCardCode?: string;
  discountApplied?: number;
}

interface AppointmentBookingScreenProps {
  initialServiceId?: string;
  initialProfessionalId?: string;
  cartServiceIds?: string[];
  onAppointmentCreated?: (appointment: AppointmentRecord) => void;
  onNavigateHome?: () => void;
  onNavigateToMyAppointments?: () => void;
}

export const AppointmentBookingScreen: React.FC<AppointmentBookingScreenProps> = ({
  initialServiceId,
  initialProfessionalId,
  cartServiceIds,
  onAppointmentCreated,
  onNavigateHome,
  onNavigateToMyAppointments,
}) => {
  // Pasos del Stepper
  const [currentStep, setCurrentStep] = useState(1);

  // Scroll automático arriba al cambiar de paso
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Datos seleccionados en el flujo (sincronizados con carrito si existen)
  const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
    if (cartServiceIds && cartServiceIds.length > 0) {
      const found = SERVICES_DATA.filter((s) => cartServiceIds.includes(s.id));
      if (found.length > 0) return found;
    }
    if (initialServiceId) {
      const found = SERVICES_DATA.find((s) => s.id === initialServiceId);
      if (found) return [found];
    }
    return [];
  });

  // Mantener sincronizado si cambian los servicios seleccionados desde fuera
  useEffect(() => {
    if (cartServiceIds && cartServiceIds.length > 0) {
      const found = SERVICES_DATA.filter((s) => cartServiceIds.includes(s.id));
      setSelectedServices(found);
    } else if (initialServiceId) {
      const found = SERVICES_DATA.find((s) => s.id === initialServiceId);
      if (found) setSelectedServices([found]);
    }
  }, [cartServiceIds, initialServiceId]);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'facial' | 'corporal' | 'nutricion'>('all');

  const [selectedProfessional, setSelectedProfessional] = useState<Professional>(() => {
    if (initialProfessionalId) {
      const found = PROFESSIONALS_DATA.find((p) => p.id === initialProfessionalId);
      return found || PROFESSIONALS_DATA[0];
    }
    return PROFESSIONALS_DATA[0];
  });

  // Fecha por defecto: día de mañana (si mañana es domingo, avanza al lunes)
  const getNextAvailableDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1); // Evitar domingos por defecto
    }
    return d.toISOString().split('T')[0];
  };

  const isSunday = (dateStr: string) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.getDay() === 0;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getNextAvailableDate());
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [clientName, setClientName] = useState<string>(() => localStorage.getItem('jos_patient_name') || '');
  const [clientPhone, setClientPhone] = useState<string>(() => localStorage.getItem('jos_patient_phone') || '');
  const [clientEmail, setClientEmail] = useState<string>(() => localStorage.getItem('jos_patient_email') || '');
  const [paymentMethod, setPaymentMethod] = useState<string>('PAGO MÓVIL');

  const [validationError, setValidationError] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<AppointmentRecord | null>(null);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);

  // Tasa de cambio oficial BCV
  const [bcvInfo, setBcvInfo] = useState<BcvRateInfo | null>(null);
  useEffect(() => {
    getOfficialBcvRate().then(setBcvInfo).catch(console.warn);
  }, []);

  // Estado para cupón / Gift Card
  const [giftCardInput, setGiftCardInput] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<{
    code: string;
    discount: number;
    title: string;
  } | null>(null);
  const [giftCardMessage, setGiftCardMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Estado para copiar datos de pago
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyPaymentInfo = (textToCopy: string, fieldId: string) => {
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // Fallback silencioso
    }
  };

  // Opciones de Horarios en cabina de Mérida
  const availableTimeSlots = [
    '08:30 AM',
    '09:30 AM',
    '10:30 AM',
    '11:30 AM',
    '01:30 PM',
    '02:30 PM',
    '03:30 PM',
    '04:30 PM',
  ];

  // Métodos de Pago: Pago móvil directo + demás presenciales o vía WhatsApp
  const paymentMethods = [
    { id: 'PAGO MÓVIL', label: 'Pago Móvil (Banesco - Tasa BCV)' },
    { id: 'EFECTIVO', label: 'Efectivo Divisas (Presencial en Cabina)' },
    { id: 'TARJETA', label: 'Punto de Venta / Tarjeta (Presencial en Cabina)' },
    { id: 'ZELLE', label: 'Zelle / Binance / Transferencia (Por WhatsApp)' },
  ];

  const stepperSteps = [
    { id: 1, label: 'Tratamiento', subtitle: 'Servicio' },
    { id: 2, label: 'Especialista', subtitle: 'Profesional' },
    { id: 3, label: 'Horario', subtitle: 'Turno en Mérida' },
    { id: 4, label: 'Confirmar', subtitle: 'WhatsApp' },
  ];

  const baseTotalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discountAmount = appliedGiftCard ? appliedGiftCard.discount : 0;
  const finalTotalAmount = Math.max(0, baseTotalAmount - discountAmount);
  const totalAmount = finalTotalAmount;
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const serviceNamesText = selectedServices.map((s) => s.name).join(', ');

  const handleApplyGiftCard = () => {
    setGiftCardMessage(null);
    const code = giftCardInput.trim().toUpperCase();
    if (!code) {
      setGiftCardMessage({ type: 'error', text: 'Por favor ingresa un código de Gift Card.' });
      return;
    }

    // 1. Buscar en tarjetas de localStorage
    let foundCard: any = null;
    try {
      const stored = localStorage.getItem('jos_gift_cards');
      if (stored) {
        const cards = JSON.parse(stored);
        foundCard = cards.find((c: any) => c.code?.toUpperCase() === code);
      }
    } catch {}

    if (foundCard) {
      if (foundCard.status === 'Canjeado') {
        setGiftCardMessage({ type: 'error', text: 'Esta Gift Card ya fue canjeada anteriormente.' });
        return;
      }
      const cardVal = Number(foundCard.service?.price) || 25;
      const discount = Math.min(baseTotalAmount, cardVal);
      setAppliedGiftCard({
        code: foundCard.code,
        discount,
        title: `Gift Card (${foundCard.service?.name || 'Tratamiento'} - $${cardVal} USD)`,
      });
      setGiftCardMessage({
        type: 'success',
        text: `¡Código válido! Se aplicó un descuento de $${discount} USD.`,
      });
      return;
    }

    // 2. Formato estándar GIFT-XXXXXX (ej: GIFT-AB1234)
    const codePattern = /^GIFT-[A-Z0-9]{4,10}$/i;
    if (codePattern.test(code)) {
      const discount = Math.min(baseTotalAmount, 25);
      setAppliedGiftCard({
        code,
        discount,
        title: `Gift Card Oficial ($25 USD)`,
      });
      setGiftCardMessage({
        type: 'success',
        text: `¡Código ${code} verificado! Descuento de $${discount} USD aplicado.`,
      });
      return;
    }

    setGiftCardMessage({
      type: 'error',
      text: 'Código de Gift Card no reconocido. Verifica el formato (ejemplo: GIFT-ABC123).',
    });
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardInput('');
    setGiftCardMessage(null);
  };

  const handleToggleService = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // Manejo de avance por pasos con validación
  const handleNextStep = () => {
    setValidationError('');
    if (currentStep === 1) {
      if (selectedServices.length === 0) {
        setValidationError('Por favor selecciona al menos un servicio.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedProfessional) {
        setValidationError('Por favor selecciona un profesional.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDate) {
        setValidationError('Por favor selecciona la fecha de tu cita.');
        return;
      }
      if (isSunday(selectedDate)) {
        setValidationError('Nuestra sede en Mérida permanece cerrada los domingos. Por favor selecciona una fecha de lunes a sábado.');
        return;
      }
      if (!selectedTime) {
        setValidationError('Por favor selecciona la hora de tu cita.');
        return;
      }
      if (!clientName.trim()) {
        setValidationError('Por favor ingresa tu nombre completo.');
        return;
      }
      if (!clientPhone.trim()) {
        setValidationError('Por favor ingresa tu número de WhatsApp para confirmar.');
        return;
      }
      setCurrentStep(4);
    }
  };

  // Guardar cita como Agendada y abrir WhatsApp
  const handleConfirmWhatsApp = async () => {
    setIsSubmittingAppointment(true);
    setSubmissionNotice(null);

    const appointmentId = `CITA-${Date.now().toString().slice(-6)}`;
    const formattedDate = `${selectedDate} a las ${selectedTime}`;

    // Mapear exactamente a los valores permitidos en Google Sheets:
    // BINANCE, PAYPAL, PAGO MÓVIL, ZELLE, EFECTIVO, TARJETA, TRANSFERENCIA
    const validMethods = ['BINANCE', 'PAYPAL', 'PAGO MÓVIL', 'ZELLE', 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
    let cleanPayment = validMethods.includes(paymentMethod) ? paymentMethod : 'PAGO MÓVIL';
    if (appliedGiftCard && finalTotalAmount === 0) {
      cleanPayment = 'GIFT CARD';
    }

    const newAppointment: AppointmentRecord = {
      id: appointmentId,
      services: selectedServices.map((s) => s.id),
      serviceNames: serviceNamesText,
      professional: selectedProfessional.name,
      date: selectedDate,
      time: selectedTime,
      totalPrice: finalTotalAmount,
      paymentMethod: appliedGiftCard
        ? (finalTotalAmount === 0 ? 'GIFT CARD (100% Cubierto)' : `${cleanPayment} + Gift Card (${appliedGiftCard.code})`)
        : cleanPayment,
      clientName,
      clientPhone,
      clientEmail,
      status: 'Confirmada',
      createdAt: new Date().toISOString(),
      giftCardCode: appliedGiftCard?.code,
      discountApplied: discountAmount > 0 ? discountAmount : undefined,
    };

    // 1. Envío a Google Sheets mediante el Web App de Apps Script
    const notesText = appliedGiftCard
      ? `Agendado vía PWA | Gift Card: ${appliedGiftCard.code} (-$${discountAmount} USD)`
      : 'Agendado vía PWA';

    const bookPayload = {
      action: 'book_appointment',
      fecha: selectedDate,
      hora: selectedTime,
      cliente: clientName.trim(),
      tratamiento: serviceNamesText,
      profesional: selectedProfessional.name,
      cantidad: selectedServices.length || 1,
      forma_pago: cleanPayment,
      notas: notesText,
      correo: clientEmail.trim().toLowerCase(),
    };

    if (APPS_SCRIPT_URL) {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(bookPayload),
        });
        const result = await res.json();
        if (!result.success) {
          console.warn('[AppsScript Cita Aviso]:', result.error);
        }
      } catch (err: any) {
        console.warn('[AppsScript Cita Error]:', err);
        setSubmissionNotice('Se abrirá WhatsApp para tu confirmación directa. Google Sheets tuvo una intermitencia temporal de red.');
      }
    } else {
      // Fallback local
      syncAppointment({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        serviceName: serviceNamesText,
        professionalName: selectedProfessional.name,
        date: selectedDate,
        time: selectedTime,
        price: finalTotalAmount,
        paymentMethod: cleanPayment,
        notes: notesText,
      }).catch((err) => console.warn('[Sheets Sync]:', err));
    }

    // 2. Guardar en almacenamiento local
    try {
      const existing = JSON.parse(localStorage.getItem('jos_appointments') || '[]');
      existing.unshift(newAppointment);
      localStorage.setItem('jos_appointments', JSON.stringify(existing));
      localStorage.setItem('jos_patient_name', clientName.trim());
      localStorage.setItem('jos_patient_phone', clientPhone.trim());
      if (clientEmail.trim()) {
        localStorage.setItem('jos_patient_email', clientEmail.trim().toLowerCase());
      }

      // Si se usó una gift card local, marcarla como canjeada
      if (appliedGiftCard) {
        const storedCards = localStorage.getItem('jos_gift_cards');
        if (storedCards) {
          const cards = JSON.parse(storedCards);
          const updatedCards = cards.map((c: any) =>
            c.code?.toUpperCase() === appliedGiftCard.code ? { ...c, status: 'Canjeado' } : c
          );
          localStorage.setItem('jos_gift_cards', JSON.stringify(updatedCards));
        }
      }
    } catch {
      // Manejo silencioso de localStorage
    }

    setConfirmedAppointment(newAppointment);
    onAppointmentCreated?.(newAppointment);

    // 3. Abrir WhatsApp con el mensaje prellenado estructurado
    let paymentText = cleanPayment;
    if (cleanPayment === 'PAGO MÓVIL') {
      paymentText = 'Pago Móvil Banesco (04147518902 - C.I. 12350227). Adjunto comprobante por aquí';
    } else if (cleanPayment === 'EFECTIVO') {
      paymentText = 'Efectivo en Divisas (Pago presencial en cabina CC Naranjo)';
    } else if (cleanPayment === 'TARJETA') {
      paymentText = 'Punto de Venta / Tarjeta (Pago presencial en cabina)';
    } else if (cleanPayment === 'ZELLE') {
      paymentText = 'Zelle / Binance / Transferencia (Deseo coordinar datos por aquí)';
    }

    let rawMessage = `Hola Estética Jos, quiero agendar: ${serviceNamesText} con ${selectedProfessional.name} el ${formattedDate}.`;
    if (appliedGiftCard) {
      rawMessage += `\n🎁 Gift Card aplicada: ${appliedGiftCard.code} (Descuento: -$${discountAmount} USD).`;
      rawMessage += `\n💰 Monto final: $${finalTotalAmount} USD.`;
      rawMessage += `\n💳 Forma de pago: ${finalTotalAmount === 0 ? 'GIFT CARD (100% Cubierto)' : paymentText}.`;
    } else {
      rawMessage += `\n💰 Monto: $${finalTotalAmount} USD.`;
      rawMessage += `\n💳 Forma de pago: ${paymentText}.`;
    }

    if (bcvInfo && cleanPayment === 'PAGO MÓVIL' && finalTotalAmount > 0) {
      const bsMonto = formatBs(finalTotalAmount, bcvInfo.rate);
      rawMessage += `\n💵 Monto en Bolívares: ${bsMonto} (Tasa BCV: Bs. ${bcvInfo.rate.toFixed(2)}).`;
    }
    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/+584147518902?text=${encodedMessage}`;

    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobileDevice) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    setIsSubmittingAppointment(false);
  };

  // Pantalla de Cita Confirmada / Mensaje Enviado
  if (confirmedAppointment) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%', padding: '1rem 0' }}>
        <Card enableTilt={false}>
          <div
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.25)',
              }}
            >
              <CheckCircle2 size={42} />
            </div>

            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(34, 197, 94, 0.18)',
                  color: '#15803d',
                  padding: '0.25rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}
              >
                ESTADO: AGENDADA EN SISTEMA
              </div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--jos-700)', margin: '0 0 0.5rem' }}>
                ¡Cita Agendada Exitosamente!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '520px', margin: '0 auto' }}>
                Tu solicitud ha sido guardada en nuestra base de datos con el código <strong>{confirmedAppointment.id}</strong>. Ya se abrió tu WhatsApp oficial para conectar con nuestro equipo en Mérida.
              </p>
            </div>

            {/* Ficha Resumen de la Cita */}
            <div
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
              }}
            >
              <div>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'block' }}>Paciente:</span>
                <strong>{confirmedAppointment.clientName}</strong> ({confirmedAppointment.clientPhone})
              </div>
              <div>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'block' }}>Servicio(s):</span>
                <strong>{confirmedAppointment.serviceNames}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'block' }}>Especialista:</span>
                <strong>{confirmedAppointment.professional}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'block' }}>Fecha y Hora:</span>
                  <strong>{confirmedAppointment.date} · {confirmedAppointment.time}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'block' }}>Método de Pago:</span>
                  <strong>{confirmedAppointment.paymentMethod}</strong>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Total Estimado:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--jos-700)' }}>${confirmedAppointment.totalPrice} USD</strong>
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              ℹ️ <strong>Importante:</strong> Nuestro equipo en el Centro Comercial Naranjo, Urb. La Mata, te responderá por WhatsApp para confirmar manualmente tu turno y enviarte las recomendaciones previas a tu llegada.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '440px', marginTop: '0.5rem' }}>
              {onNavigateToMyAppointments && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<CalendarIcon size={18} />}
                  onClick={() => {
                    setConfirmedAppointment(null);
                    setCurrentStep(1);
                    onNavigateToMyAppointments();
                  }}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-floating)',
                  }}
                >
                  Ver Mis Citas Agendadas
                </Button>
              )}

              <Button
                variant={onNavigateToMyAppointments ? 'secondary' : 'primary'}
                size={onNavigateToMyAppointments ? 'md' : 'lg'}
                onClick={() => {
                  setConfirmedAppointment(null);
                  setCurrentStep(1);
                  onNavigateHome?.();
                }}
                style={{
                  width: '100%',
                  padding: onNavigateToMyAppointments ? '0.75rem' : '1rem',
                  fontSize: '0.96rem',
                  fontWeight: 600,
                }}
              >
                Volver al Inicio
              </Button>

              <Button
                variant="outline"
                size="md"
                icon={<MessageCircle size={18} />}
                onClick={() => {
                  const raw = `Hola Estética Jos, quiero confirmar mi cita: ${confirmedAppointment.serviceNames} con ${confirmedAppointment.professional} el ${confirmedAppointment.date} a las ${confirmedAppointment.time}. Monto: $${confirmedAppointment.totalPrice} USD. Método de pago: ${confirmedAppointment.paymentMethod}.`;
                  const url = `https://wa.me/+584147518902?text=${encodeURIComponent(raw)}`;
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  if (isMobile) {
                    window.location.href = url;
                  } else {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                }}
                style={{ width: '100%' }}
              >
                Volver a Abrir WhatsApp
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '920px', margin: '0 auto', width: '100%' }}>
      {/* Encabezado del Flujo */}
      <div style={{ textAlign: 'center' }}>
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
          <CalendarIcon size={14} /> Agendamiento Inteligente
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--jos-700)' }}>
          Reserva tu Cita en Estética Jos
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto' }}>
          Elige tu tratamiento, especialista y horario en Mérida.
        </p>
      </div>

      {/* Stepper Visual de 4 Pasos */}
      <div className="glass-panel" style={{ padding: '0.65rem 0.65rem', borderRadius: 'var(--radius-lg)' }}>
        <Stepper
          steps={stepperSteps}
          currentStep={currentStep}
          onStepClick={(stepId) => {
            if (stepId === 1) setCurrentStep(1);
            if (stepId === 2 && selectedServices.length > 0) setCurrentStep(2);
            if (stepId === 3 && selectedServices.length > 0 && selectedProfessional) setCurrentStep(3);
            if (stepId === 4 && selectedServices.length > 0 && selectedProfessional && clientName.trim() && clientPhone.trim()) setCurrentStep(4);
          }}
        />
      </div>

      {/* Mensaje de validación si existe */}
      {validationError && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#b91c1c',
            fontSize: '0.88rem',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          ⚠️ {validationError}
        </div>
      )}

      {/* PASO 1: SELECCIÓN DE SERVICIO */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem', color: 'var(--jos-700)' }}>
                Paso 1: Selecciona tus Tratamientos
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Puedes elegir uno o varios servicios para tu misma sesión.
              </p>
            </div>

            {/* Filtros de categoría */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {(['all', 'facial', 'corporal', 'nutricion'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: selectedCategoryFilter === cat ? 'var(--jos-700)' : 'var(--bg-card)',
                    color: selectedCategoryFilter === cat ? '#ffffff' : 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {cat === 'all' ? 'Todos' : cat === 'facial' ? 'Faciales' : cat === 'corporal' ? 'Corporales' : 'Nutrición'}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de Totales y Continuar Superior (Acceso Rápido) */}
          <div
            className="glass-panel"
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              border: '1.5px solid var(--border-medium)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {selectedServices.length} {selectedServices.length === 1 ? 'servicio' : 'servicios'} · Total:{' '}
                <strong style={{ color: 'var(--jos-700)', fontSize: '1.15rem' }}>${totalAmount} USD</strong>
              </span>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              onClick={handleNextStep}
              disabled={selectedServices.length === 0}
              className={selectedServices.length === 0 ? 'opacity-50 pointer-events-none' : ''}
              style={{
                opacity: selectedServices.length === 0 ? 0.5 : 1,
                pointerEvents: selectedServices.length === 0 ? 'none' : 'auto',
                cursor: selectedServices.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Continuar con Especialista →
            </Button>
          </div>

          {/* Grid de Servicios */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
            {SERVICES_DATA.filter(
              (s) => selectedCategoryFilter === 'all' || s.category === selectedCategoryFilter
            ).map((service) => {
              const isSelected = selectedServices.some((s) => s.id === service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => handleToggleService(service)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                    border: isSelected ? '2px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                    boxShadow: isSelected ? 'var(--shadow-floating)' : 'var(--shadow-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        padding: '0.22rem 0.65rem',
                        borderRadius: 'var(--radius-pill)',
                        background: isSelected ? 'var(--jos-700)' : 'var(--bg-card)',
                        color: isSelected ? '#ffffff' : 'var(--jos-700)',
                        border: isSelected ? '1px solid var(--jos-700)' : '1px solid var(--border-medium)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {isSelected ? '✓ Seleccionado' : '+ Seleccionar'}
                    </span>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--badge-bg)',
                        color: 'var(--badge-text)',
                      }}
                    >
                      {service.category === 'facial' ? 'Facial' : service.category === 'corporal' ? 'Corporal' : 'Nutrición'}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.08rem', margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
                      {service.name}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                      {service.shortDescription}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} color="var(--jos-500)" /> {service.durationMinutes} min
                    </span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--jos-700)' }}>
                      ${service.price} USD
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de Totales y Continuar */}
          <div
            className="glass-panel-elevated"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {selectedServices.length} servicio(s) seleccionado(s) · {totalDuration} min aprox.
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--jos-700)' }}>
                Total: ${totalAmount} USD
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              onClick={handleNextStep}
              disabled={selectedServices.length === 0}
              className={selectedServices.length === 0 ? 'opacity-50 pointer-events-none' : ''}
              style={{
                opacity: selectedServices.length === 0 ? 0.5 : 1,
                pointerEvents: selectedServices.length === 0 ? 'none' : 'auto',
                cursor: selectedServices.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Continuar con Especialista →
            </Button>
          </div>
        </div>
      )}

      {/* PASO 2: SELECCIÓN DE PROFESIONAL */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem', color: 'var(--jos-700)' }}>
              Paso 2: Elige tu Especialista
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Profesionales certificados con amplia trayectoria clínica en Mérida.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
            {PROFESSIONALS_DATA.map((pro) => {
              const isSelected = selectedProfessional.id === pro.id;

              return (
                <div
                  key={pro.id}
                  onClick={() => setSelectedProfessional(pro)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                    border: isSelected ? '2px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                    boxShadow: isSelected ? 'var(--shadow-floating)' : 'var(--shadow-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.85rem',
                  }}
                >
                  {pro.image ? (
                    <img
                      src={pro.image}
                      alt={pro.name}
                      style={{
                        width: '88px',
                        height: '88px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isSelected ? '3px solid var(--jos-700)' : '2px solid var(--jos-500)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '88px',
                        height: '88px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--jos-700) 0%, var(--jos-500) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        border: isSelected ? '3px solid var(--jos-700)' : '2px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 4px 12px rgba(129, 99, 139, 0.25)',
                      }}
                    >
                      {pro.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.2rem', color: 'var(--text-main)' }}>
                      {pro.name}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--jos-700)', fontWeight: 600, display: 'block' }}>
                      {pro.role}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {pro.specialty}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      background: isSelected ? 'var(--jos-700)' : 'var(--bg-card)',
                      color: isSelected ? '#ffffff' : 'var(--text-light)',
                    }}
                  >
                    {isSelected ? '✓ Seleccionado' : 'Elegir'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 w-full step2-nav-container mt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto py-2.5 px-4 text-center text-sm font-semibold step2-secondary-btn"
            >
              ← Volver a Tratamientos
            </button>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              onClick={handleNextStep}
              className="w-full sm:w-auto py-3.5 text-center step2-primary-btn"
            >
              Continuar a Fecha y Hora
            </Button>
          </div>
        </div>
      )}

      {/* PASO 3: FECHA, HORA Y DATOS DE CONTACTO */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem', color: 'var(--jos-700)' }}>
              Paso 3: Fecha, Turno y Datos del Paciente
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Atención presencial en CC Naranjo, Urb. La Mata, Mérida.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {/* Columna Izquierda: Fecha y Horario */}
            <Card enableTilt={false} header={<h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--jos-700)' }}>Día y Hora Deseada</h4>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    Fecha de Atención
                  </label>
                  <input
                    type="date"
                    min={getNextAvailableDate()}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (isSunday(e.target.value)) {
                        setValidationError('Nuestra sede en CC Naranjo permanece cerrada los domingos. Por favor selecciona de lunes a sábado.');
                      } else {
                        setValidationError('');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSunday(selectedDate) ? '1.5px solid #ef4444' : '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem',
                    }}
                  />
                  {isSunday(selectedDate) ? (
                    <span style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '0.35rem', display: 'block', fontWeight: 600 }}>
                      ⚠️ Cerrado los domingos. Selecciona de lunes a sábado.
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>
                      📅 Atención presencial: Lunes a Sábado de 8:30 AM a 5:30 PM
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    Bloque de Hora Preferido
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {availableTimeSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          style={{
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            background: isSelected ? 'var(--jos-700)' : 'var(--bg-card)',
                            color: isSelected ? '#ffffff' : 'var(--text-main)',
                            border: isSelected ? '1px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Columna Derecha: Datos de Contacto */}
            <Card enableTilt={false} header={<h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--jos-700)' }}>Tus Datos para la Confirmación</h4>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Nombre Completo *"
                  placeholder="Ej. Sofía Mendoza"
                  guide="Como deseas que te llamemos en tu cita"
                  icon={<User size={18} />}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />

                <Input
                  label="Número de WhatsApp *"
                  placeholder="Ej. +58 414 7518902"
                  guide="Aquí te enviaremos la confirmación manual y recordatorio"
                  icon={<MessageCircle size={18} />}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />

                <Input
                  label="Correo Electrónico (Opcional)"
                  type="email"
                  placeholder="tu.correo@ejemplo.com"
                  guide="Para registrarte en la base de datos y sincronizar con Google Calendar"
                  icon={<Mail size={18} />}
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />

                <div
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ShieldCheck size={18} color="var(--jos-500)" style={{ flexShrink: 0 }} />
                  <span>Tu cita será revisada y confirmada por una persona real de nuestro equipo.</span>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => setCurrentStep(2)}>
              Volver a Especialista
            </Button>
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right" onClick={handleNextStep}>
              Ver Resumen de Cita
            </Button>
          </div>
        </div>
      )}

      {/* PASO 4: CONFIRMACIÓN Y WHATSAPP */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem', color: 'var(--jos-700)' }}>
              Paso 4: Revisa y Confirma tu Cita
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Revisa los detalles de tu turno y confirma directamente por WhatsApp.
            </p>
          </div>

          {/* Card de Resumen de Cita */}
          <Card
            enableTilt={false}
            variant="elevated"
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--jos-700)', textTransform: 'uppercase' }}>
                  Ficha Resumen de Cita
                </span>
                <span
                  style={{
                    background: 'rgba(34, 197, 94, 0.18)',
                    color: '#15803d',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Estado: Agendada
                </span>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Servicios y Profesional */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>
                    Tratamiento(s) Seleccionado(s):
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)', display: 'block' }}>
                    {serviceNamesText}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ⏱️ Duración estimada: {totalDuration} min
                  </span>
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>
                    Especialista Asignado:
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)', display: 'block' }}>
                    {selectedProfessional.name}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedProfessional.role}
                  </span>
                </div>
              </div>

              {/* Fecha, Hora y Sede */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>
                    Turno Pautado:
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>
                    📅 {selectedDate} a las {selectedTime}
                  </strong>
                </div>

                <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>
                    Sede de Atención:
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={15} color="var(--jos-500)" /> CC Naranjo, Urb. La Mata, Mérida
                  </strong>
                </div>
              </div>

              {/* Paciente */}
              <div style={{ padding: '0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.2rem' }}>
                  Paciente:
                </span>
                <strong>{clientName}</strong> · WhatsApp: <strong>{clientPhone}</strong>
                {clientEmail && (
                  <span style={{ display: 'block', marginTop: '0.2rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    ✉️ {clientEmail}
                  </span>
                )}
              </div>

              {/* Sección de Canje de Gift Card o Cupón */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1.5px dashed var(--border-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Gift size={16} color="var(--jos-500)" /> ¿Tienes una Gift Card o Cupón?
                  </span>
                  {appliedGiftCard && (
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#15803d',
                        background: 'rgba(34, 197, 94, 0.18)',
                        padding: '0.15rem 0.6rem',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    >
                      ✓ Descuento Aplicado
                    </span>
                  )}
                </div>

                {!appliedGiftCard ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Ej: GIFT-ABC123"
                      value={giftCardInput}
                      onChange={(e) => {
                        setGiftCardInput(e.target.value.toUpperCase());
                        if (giftCardMessage) setGiftCardMessage(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyGiftCard();
                        }
                      }}
                      style={{
                        flex: '1 1 200px',
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface-elevated)',
                        color: 'var(--text-main)',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        outline: 'none',
                      }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApplyGiftCard}
                      style={{ padding: '0.6rem 1.1rem' }}
                    >
                      Aplicar
                    </Button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(34, 197, 94, 0.12)',
                      padding: '0.75rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Tag size={14} /> Código: {appliedGiftCard.code}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#166534', display: 'block', marginTop: '0.1rem' }}>
                        {appliedGiftCard.title} (-${appliedGiftCard.discount} USD)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveGiftCard}
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: 'none',
                        color: '#b91c1c',
                        cursor: 'pointer',
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-pill)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <X size={13} /> Quitar
                    </button>
                  </div>
                )}

                {giftCardMessage && (
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: giftCardMessage.type === 'success' ? '#15803d' : '#b91c1c',
                      display: 'block',
                      fontWeight: 500,
                    }}
                  >
                    {giftCardMessage.type === 'success' ? '✓ ' : '⚠️ '}
                    {giftCardMessage.text}
                  </span>
                )}
              </div>

              {/* Selector de Método de Pago */}
              <div>
                <label style={{ fontSize: '0.86rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  {finalTotalAmount === 0
                    ? 'Método de Pago (Cubierto por Gift Card):'
                    : appliedGiftCard
                    ? `Selecciona cómo pagarás el saldo restante ($${finalTotalAmount} USD):`
                    : 'Selecciona tu Método de Pago:'}
                </label>
                {finalTotalAmount === 0 ? (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(34, 197, 94, 0.12)',
                      border: '1.5px solid rgba(34, 197, 94, 0.3)',
                      color: '#15803d',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={18} /> Tu cita queda 100% cancelada con tu tarjeta de regalo.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {paymentMethods.map((m) => {
                      const isSelected = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            textAlign: 'left',
                            background: isSelected ? 'var(--jos-700)' : 'var(--bg-card)',
                            color: isSelected ? '#ffffff' : 'var(--text-main)',
                            border: isSelected ? '1.5px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Ficha interactiva de datos bancarios con botón copiar */}
                {finalTotalAmount > 0 && PAYMENT_ACCOUNTS[paymentMethod] && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--jos-700)' }}>
                        📋 Datos oficiales para pagar por {PAYMENT_ACCOUNTS[paymentMethod].name}:
                      </strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'var(--badge-bg)',
                          color: 'var(--badge-text)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          fontWeight: 700,
                        }}
                      >
                        {PAYMENT_ACCOUNTS[paymentMethod].badge}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {PAYMENT_ACCOUNTS[paymentMethod].instructions}
                    </p>

                    {bcvInfo && (paymentMethod === 'PAGO MÓVIL' || paymentMethod === 'TRANSFERENCIA') && (
                      <div
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: 'rgba(129, 99, 139, 0.12)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'block' }}>
                            Monto exacto a transferir en Bolívares:
                          </span>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--jos-700)' }}>
                            {formatBs(finalTotalAmount, bcvInfo.rate)}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPaymentInfo((finalTotalAmount * bcvInfo.rate).toFixed(2), 'monto-bs')}
                          style={{
                            background: copiedField === 'monto-bs' ? '#22c55e' : 'var(--jos-700)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'background var(--transition-fast)',
                          }}
                        >
                          {copiedField === 'monto-bs' ? <Check size={13} /> : <Copy size={13} />}
                          {copiedField === 'monto-bs' ? '¡Monto Copiado!' : 'Copiar Monto'}
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
                      {PAYMENT_ACCOUNTS[paymentMethod].fields.map((f, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.65rem',
                            background: 'var(--bg-surface-elevated)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.82rem',
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--text-light)', marginRight: '0.4rem' }}>{f.label}:</span>
                            <strong style={{ color: 'var(--text-main)', letterSpacing: f.copyable ? '0.3px' : 'normal' }}>
                              {f.value}
                            </strong>
                          </div>
                          {f.copyable && (
                            <button
                              type="button"
                              onClick={() => handleCopyPaymentInfo(f.value, `${paymentMethod}-${f.label}`)}
                              style={{
                                background: copiedField === `${paymentMethod}-${f.label}` ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                                color: copiedField === `${paymentMethod}-${f.label}` ? '#15803d' : 'var(--jos-700)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              {copiedField === `${paymentMethod}-${f.label}` ? <Check size={13} /> : <Copy size={13} />}
                              {copiedField === `${paymentMethod}-${f.label}` ? 'Copiado' : 'Copiar'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Total Final */}
              <div
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--border-active)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>
                    Monto Total de la Cita:
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {finalTotalAmount === 0
                      ? 'Cubierto al 100% con Gift Card'
                      : 'Cancelas al momento de confirmar o en cabina'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {appliedGiftCard && appliedGiftCard.discount > 0 && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                      ${baseTotalAmount} USD
                    </div>
                  )}
                  <strong style={{ fontSize: '1.6rem', color: 'var(--jos-700)' }}>
                    ${finalTotalAmount} USD
                  </strong>
                  {bcvInfo && finalTotalAmount > 0 && (paymentMethod === 'PAGO MÓVIL' || paymentMethod === 'TRANSFERENCIA') && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--jos-700)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
                      ≈ {formatBs(finalTotalAmount, bcvInfo.rate)} (Tasa BCV)
                    </span>
                  )}
                </div>
              </div>

              {/* Aviso si hubo intermitencia al guardar */}
              {submissionNotice && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    color: '#b45309',
                    fontSize: '0.82rem',
                    textAlign: 'center',
                  }}
                >
                  ℹ️ {submissionNotice}
                </div>
              )}

              {/* Botón Principal: Confirmar por WhatsApp */}
              <Button
                variant="primary"
                size="lg"
                isLoading={isSubmittingAppointment}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.05rem',
                  background: '#25D366', // Color WhatsApp oficial
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                }}
                icon={<MessageCircle size={22} />}
                onClick={handleConfirmWhatsApp}
              >
                {isSubmittingAppointment
                  ? 'Agendando cita...'
                  : 'Confirmar Cita por WhatsApp'}
              </Button>
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => setCurrentStep(3)}>
              Volver a Horario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
