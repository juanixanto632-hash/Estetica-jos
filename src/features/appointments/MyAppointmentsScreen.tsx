import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  MessageCircle,
  CalendarPlus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import { AppointmentRecord } from './AppointmentBookingScreen';

interface MyAppointmentsScreenProps {
  onNavigateToBooking: () => void;
  onNavigateHome?: () => void;
}

export const MyAppointmentsScreen: React.FC<MyAppointmentsScreenProps> = ({
  onNavigateToBooking,
  onNavigateHome,
}) => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [filter, setFilter] = useState<'todas' | 'proximas' | 'pasadas'>('todas');
  const [notification, setNotification] = useState<string | null>(null);

  // Cargar citas desde localStorage
  const loadAppointments = () => {
    try {
      const stored = localStorage.getItem('jos_appointments');
      if (stored) {
        const parsed: AppointmentRecord[] = JSON.parse(stored);
        setAppointments(parsed);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.warn('Error al leer jos_appointments:', err);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Eliminar o archivar una cita localmente
  const handleDeleteAppointment = (id: string) => {
    const confirmed = window.confirm(
      '¿Deseas eliminar este registro de tu lista local? (Si deseas cancelar tu turno formalmente, por favor avísanos por WhatsApp).'
    );
    if (!confirmed) return;

    try {
      const updated = appointments.filter((a) => a.id !== id);
      localStorage.setItem('jos_appointments', JSON.stringify(updated));
      setAppointments(updated);
      setNotification('Cita eliminada de tu historial local.');
      setTimeout(() => setNotification(null), 3500);
    } catch {
      // Manejo silencioso
    }
  };

  // Generador de enlace para Google Calendar
  const getGoogleCalendarUrl = (appt: AppointmentRecord) => {
    try {
      // Fecha en formato YYYY-MM-DD
      const dateParts = appt.date.split('-');
      if (dateParts.length !== 3) return null;

      // Hora aproximada (ej: "10:30 AM" -> HH:mm)
      let hours = 10;
      let minutes = 0;
      const timeMatch = appt.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const meridiem = timeMatch[3]?.toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
      }

      const pad = (n: number) => n.toString().padStart(2, '0');
      const startDateTimeStr = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T${pad(hours)}${pad(minutes)}00`;
      // Duración estimada 60 minutos
      const endHours = hours + 1;
      const endDateTimeStr = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T${pad(endHours)}${pad(minutes)}00`;

      const title = encodeURIComponent(`Cita en Estética Jos: ${appt.serviceNames}`);
      const details = encodeURIComponent(
        `Tratamiento: ${appt.serviceNames}\nEspecialista: ${appt.professional}\nCódigo: ${appt.id}\nSede: Centro Comercial Naranjo, Piso 2, Mérida.\nWhatsApp: +58 414-7518902`
      );
      const location = encodeURIComponent('Centro Comercial Naranjo, Urb. La Mata, Mérida, Venezuela');

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTimeStr}/${endDateTimeStr}&details=${details}&location=${location}`;
    } catch {
      return null;
    }
  };

  // Abrir WhatsApp con consulta específica sobre la cita
  const handleOpenWhatsApp = (appt: AppointmentRecord) => {
    const raw = `Hola Estética Jos 👋 Quiero consultar el estado de mi cita:\n• Código: ${appt.id}\n• Servicio: ${appt.serviceNames}\n• Especialista: ${appt.professional}\n• Fecha y Hora: ${appt.date} a las ${appt.time}\n• Paciente: ${appt.clientName}`;
    const url = `https://wa.me/+584147518902?text=${encodeURIComponent(raw)}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filtrado de citas
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'proximas') return a.date >= todayStr;
    if (filter === 'pasadas') return a.date < todayStr;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* Botón Volver al Inicio */}
      {onNavigateHome && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={onNavigateHome}
          >
            Volver al Inicio
          </Button>
        </div>
      )}

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
          <CalendarIcon size={14} /> Control de Paciente
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--jos-700)' }}>
          Mis Citas Agendadas
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '600px', margin: '0 auto' }}>
          Consulta tus turnos confirmados, agenda en tu calendario o contáctanos directamente para cualquier ajuste.
        </p>
      </div>

      {/* Notificación temporal */}
      {notification && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#15803d',
            fontSize: '0.86rem',
            textAlign: 'center',
          }}
        >
          ✓ {notification}
        </div>
      )}

      {/* Barra de Filtros y Acción Nueva Cita */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['todas', 'proximas', 'pasadas'] as const).map((tab) => {
            const isActive = filter === tab;
            const labels = { todas: 'Todas', proximas: 'Próximas', pasadas: 'Pasadas' };
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  background: isActive ? 'var(--jos-700)' : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  border: isActive ? '1px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Sparkles size={16} />}
          onClick={onNavigateToBooking}
        >
          Agendar Nueva Cita
        </Button>
      </div>

      {/* Lista de Citas */}
      {filteredAppointments.length === 0 ? (
        /* Estado Vacío */
        <Card enableTilt={false}>
          <div
            style={{
              padding: '3.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--bg-card)',
                color: 'var(--jos-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarIcon size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0 0 0.4rem' }}>
                {filter === 'proximas'
                  ? 'No tienes citas próximas agendadas'
                  : filter === 'pasadas'
                  ? 'No hay citas registradas en el historial anterior'
                  : 'Aún no tienes citas agendadas'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                Reserva un tratamiento facial o corporal en nuestra sede de Mérida y vive la experiencia Estética Jos.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight size={17} />}
              onClick={onNavigateToBooking}
              style={{ marginTop: '0.5rem' }}
            >
              Explorar Catálogo y Agendar
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredAppointments.map((appt) => {
            const calUrl = getGoogleCalendarUrl(appt);
            const isPast = appt.date < todayStr;

            return (
              <Card
                key={appt.id}
                enableTilt={false}
                variant="elevated"
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--jos-700)' }}>
                        {appt.id}
                      </span>
                      <span
                        style={{
                          background: isPast ? 'rgba(107, 114, 128, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: isPast ? '#4b5563' : '#15803d',
                          padding: '0.15rem 0.6rem',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        {isPast ? 'Completada / Pasada' : 'Agendada en Sistema'}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                      Registrada: {new Date(appt.createdAt).toLocaleDateString('es-VE')}
                    </span>
                  </div>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {/* Tratamiento & Especialista */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.15rem' }}>
                        Tratamiento(s):
                      </span>
                      <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', display: 'block' }}>
                        {appt.serviceNames}
                      </strong>
                    </div>

                    <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.15rem' }}>
                        Especialista:
                      </span>
                      <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={15} color="var(--jos-500)" /> {appt.professional}
                      </strong>
                    </div>
                  </div>

                  {/* Fecha, Hora, Monto y Pago */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.15rem' }}>
                        Fecha y Hora:
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={15} color="var(--jos-500)" /> {appt.date} · {appt.time}
                      </strong>
                    </div>

                    <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.15rem' }}>
                        Monto & Forma de Pago:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{appt.paymentMethod}</span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--jos-700)' }}>${appt.totalPrice} USD</strong>
                      </div>
                    </div>
                  </div>

                  {/* Sede */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <MapPin size={15} color="var(--jos-500)" />
                    <span>Centro Comercial Naranjo, Piso 2, Urb. La Mata, Mérida.</span>
                  </div>

                  {/* Botones de Acción */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.9rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.6rem',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<MessageCircle size={16} />}
                        onClick={() => handleOpenWhatsApp(appt)}
                        style={{ background: '#25D366', color: '#fff', border: 'none' }}
                      >
                        Consultar por WhatsApp
                      </Button>

                      {calUrl && (
                        <a
                          href={calUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <Button variant="outline" size="sm" icon={<CalendarPlus size={16} />}>
                            Google Calendar
                          </Button>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteAppointment(appt.id)}
                      title="Eliminar registro de esta lista"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-light)',
                        cursor: 'pointer',
                        padding: '0.35rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                      }}
                    >
                      <Trash2 size={14} /> Quitar de la lista
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
