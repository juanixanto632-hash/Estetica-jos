import React from 'react';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Accordion, Button } from '../../components/common';

export const FaqScreen: React.FC = () => {
  const faqData = [
    {
      id: 'faq-1',
      title: '¿Cómo funciona el proceso de agendamiento y confirmación?',
      content:
        'Seleccionas tu servicio facial o corporal, eliges el especialista y el horario preferido aquí mismo en nuestra app. El sistema registra tu cita en estado "Pendiente" y te lleva a WhatsApp con el mensaje prellenado. Nuestro equipo confirma manualmente la disponibilidad en nuestra agenda de Mérida para asegurarte la hora exacta.',
    },
    {
      id: 'faq-2',
      title: '¿Qué diferencia hay entre la Limpieza Facial Profunda y el Pink Glow?',
      content:
        'La Limpieza Facial Profunda se enfoca en la higiene, descongestión de poros y exfoliación celular. Pink Glow es una mesoterapia despigmentante y biorrevitalizante de alta gama formulada con glutatión y ácido hialurónico, diseñada para iluminar la piel y tratar manchas y fotoenvejecimiento.',
    },
    {
      id: 'faq-3',
      title: '¿El tratamiento con PDRN (polinucleótidos) es doloroso?',
      content:
        'No. Aplicamos crema anestésica tópica de grado médico 20 a 30 minutos antes del procedimiento. La microinyección es sumamente superficial y muy bien tolerada.',
    },
    {
      id: 'faq-4',
      title: '¿Qué métodos de pago reciben en la sede de Mérida?',
      content:
        'Aceptamos Pago Móvil Banesco (0414-7518902, C.I. 12350227 a tasa oficial BCV) con comprobante directo vía WhatsApp. Los demás métodos de pago se realizan de manera presencial en cabina el día de tu turno: Efectivo en divisas (USD / EUR) y punto de venta para tarjetas de débito y crédito. Para Zelle, Binance o transferencias, se coordinan directamente por nuestro WhatsApp oficial.',
    },
    {
      id: 'faq-5',
      title: '¿Con cuánta anticipación debo llegar a mi cita?',
      content:
        'Recomendamos llegar 10 a 15 minutos antes de la hora pautada a nuestro consultorio en el Centro Comercial Naranjo, Urb. La Mata, para completar tu ficha clínica de valoración cutánea con calma.',
    },
    {
      id: 'faq-6',
      title: '¿Puedo realizarme un masaje relajante y una limpieza facial el mismo día?',
      content:
        '¡Sí! Muchos de nuestros clientes en Mérida reservan paquetes combinados de bienestar corporal y facial. Puedes agregar ambos servicios a tu cita en el carrito.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      {/* Encabezado */}
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
          <HelpCircle size={14} /> Respuestas Rápidas
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--jos-700)' }}>
          Preguntas Frecuentes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Todo lo que necesitas saber sobre nuestros tratamientos médicos, estéticos y el método de confirmación en Mérida.
        </p>
      </div>

      {/* Acordeón Principal */}
      <Accordion items={faqData} defaultOpenId="faq-1" />

      {/* Banner de Contacto directo si tiene más dudas */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', color: 'var(--jos-700)', margin: 0 }}>
          ¿Tienes una duda específica sobre tu caso?
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '520px', margin: 0 }}>
          Escríbenos directamente a nuestro WhatsApp oficial y nuestro equipo de especialistas responderá tus consultas personalizadas.
        </p>
        <a
          href="https://wa.me/+584147518902?text=Hola%20Est%C3%A9tica%20Jos,%20tengo%20una%20consulta%20sobre%20sus%20tratamientos"
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: '100%', maxWidth: '340px', textDecoration: 'none' }}
        >
          <Button
            variant="primary"
            icon={<MessageCircle size={18} />}
            style={{ width: '100%', maxWidth: '100%', justifyContent: 'center' }}
          >
            Consultar por WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
};
