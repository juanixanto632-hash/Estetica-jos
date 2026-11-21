import React, { useState } from 'react';
import { UserCheck, Mail, Phone, User, CheckCircle2, Heart, Eye, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Input, Card, Modal, TurnstileWidget } from '../../components/common';
import { generateWelcomeEmailHtml } from '../../templates/welcomeEmail';
import { APPS_SCRIPT_URL } from '../../config/appsScript';

interface RegisterScreenProps {
  onNavigate?: (screenId: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    interest: 'facial',
    notes: '',
  });

  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('turnstile_dev_mock_token');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [serverNotice, setServerNotice] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Por favor ingresa tu nombre y apellido.';
    } else if (formData.fullName.trim().length < 3) {
      errs.fullName = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Por favor ingresa tu teléfono o WhatsApp.';
    } else if (formData.phone.trim().length < 10) {
      errs.phone = 'Ingresa un número válido de contacto (ej. 0414 7518902).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'El correo electrónico es requerido.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Formato de correo electrónico inválido.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerNotice(null);
    if (!validate()) return;

    setIsLoading(true);

    const clientPayload = {
      action: 'register_client',
      nombre: formData.fullName.trim(),
      telefono: formData.phone.trim(),
      correo: formData.email.trim().toLowerCase(),
    };

    try {
      // 1. Envío directo al Web App de Google Apps Script si está configurada la constante
      if (APPS_SCRIPT_URL) {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(clientPayload),
        });

        const data = await response.json();

        if (!data.success) {
          if (data.alreadyExists) {
            setErrors({ email: 'Este correo ya se encuentra registrado en nuestra base de datos.' });
          } else {
            setServerNotice(data.error || 'Ocurrió un error al registrar en Google Sheets.');
          }
          setIsLoading(false);
          return;
        }
      } else {
        // Fallback a Netlify Function local si no se ha configurado la URL de Apps Script
        const response = await fetch('/api/register-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim().toLowerCase(),
            interest: formData.interest,
            notes: formData.notes.trim(),
            honeypot,
            turnstileToken,
          }),
        });

        if (!response.ok) {
          const resData = await response.json().catch(() => ({}));
          if (response.status === 409) {
            setErrors({ email: 'Este correo ya se encuentra registrado en nuestra base de datos.' });
          } else {
            setServerNotice(resData.error || 'Ocurrió un error al procesar tu registro.');
          }
          setIsLoading(false);
          return;
        }
      }

      // Guardar en almacenamiento local para recordar datos del paciente en el agendamiento
      localStorage.setItem('jos_patient_name', formData.fullName.trim());
      localStorage.setItem('jos_patient_phone', formData.phone.trim());
      localStorage.setItem('jos_patient_email', formData.email.trim().toLowerCase());

      setIsSubmitted(true);
    } catch (err: any) {
      console.warn('[Register] Error de red o conexión:', err);
      // Guardar en almacenamiento local para no bloquear la experiencia de usuario
      localStorage.setItem('jos_patient_name', formData.fullName.trim());
      localStorage.setItem('jos_patient_phone', formData.phone.trim());
      localStorage.setItem('jos_patient_email', formData.email.trim().toLowerCase());

      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
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
          <UserCheck size={14} /> Ficha de Paciente
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--jos-700)' }}>
          Registro de Paciente
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Crea tu ficha para agilizar tus citas y consultas en Mérida.
        </p>
      </div>

      {serverNotice && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.88rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{serverNotice}</span>
        </div>
      )}

      {isSubmitted ? (
        <Card enableTilt={false}>
          <div
            style={{
              padding: '2.5rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.25)',
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                ¡Te damos la bienvenida a Estética Jos, {formData.fullName.split(' ')[0]}!
              </h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto', lineHeight: 1.5 }}>
                Tu ficha clínica ha sido registrada exitosamente. Hemos preparado tu correo de bienvenida oficial con el resumen de nuestros servicios.
              </p>
            </div>

            {/* Tarjeta de Resumen */}
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '1.15rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.86rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Paciente: </span>
                <strong style={{ color: 'var(--text-main)' }}>{formData.fullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Correo: </span>
                <strong style={{ color: 'var(--text-main)' }}>{formData.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>WhatsApp: </span>
                <strong style={{ color: 'var(--text-main)' }}>{formData.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sede: </span>
                <strong style={{ color: 'var(--jos-700)' }}>CC Naranjo · Piso 2 · Mérida</strong>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px', marginTop: '0.5rem' }}>
              {onNavigate && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                  onClick={() => onNavigate('citas')}
                >
                  Agendar Mi Primera Cita
                </Button>
              )}

              <Button
                variant="outline"
                size="md"
                icon={<Eye size={17} />}
                onClick={() => setIsPreviewModalOpen(true)}
              >
                Ver Correo de Bienvenida Enviado
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ fullName: '', phone: '', email: '', interest: 'facial', notes: '' });
                }}
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                  textDecoration: 'underline',
                }}
              >
                Registrar otro paciente
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card enableTilt={false}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Nombre Completo *"
              placeholder="Ej. Valeria Carrillo"
              guide="Tal como deseas que figure en tu ficha y en tu mensaje de WhatsApp"
              icon={<User size={18} />}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
            />

            <Input
              label="Teléfono WhatsApp *"
              placeholder="0414 7518902"
              guide="Número donde recibirás la confirmación directa de tu cita"
              icon={<Phone size={18} />}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />

            <Input
              label="Correo Electrónico *"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              guide="Recibirás tu correo oficial de bienvenida y comprobantes clínicos"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />

            {/* Interés Principal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Área de Interés Principal
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'facial', label: 'Facial' },
                  { id: 'corporal', label: 'Corporal' },
                  { id: 'ambos', label: 'Ambos' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setFormData({ ...formData, interest: item.id })}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      background: formData.interest === item.id ? 'var(--jos-700)' : 'var(--bg-card)',
                      color: formData.interest === item.id ? '#ffffff' : 'var(--text-main)',
                      border: formData.interest === item.id ? '1px solid var(--jos-700)' : '1px solid var(--border-subtle)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas u observaciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Consulta Específica o Condición de Piel (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Deseo evaluar manchas solares, interés en Botox, piel sensible..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Campo Trampa Honeypot (Oculto a humanos, bloquea bots automáticos) */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="hp_register_field">No llenar este campo</label>
              <input
                id="hp_register_field"
                type="text"
                name="hp_register_field"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Widget Cloudflare Turnstile */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.25rem 0' }}>
              <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
            </div>

            {/* Botón Guardar */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: '0.25rem' }}
              icon={<Heart size={18} />}
            >
              Completar Registro
            </Button>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', display: 'block' }}>
              🔒 Confidencialidad médica garantizada. No compartimos tus datos con terceros.
            </span>
          </form>
        </Card>
      )}

      {/* Modal de Vista Previa del Correo con la Marca Estética Jos */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Plantilla de Correo de Bienvenida (Resend)"
        maxWidth="620px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--jos-500)', fontSize: '0.84rem' }}>
            <Sparkles size={16} />
            <span>Diseño HTML generado con la paleta oficial de Estética Jos</span>
          </div>

          <div
            style={{
              maxHeight: '480px',
              overflowY: 'auto',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: '#fcf8fc',
              padding: '0.5rem',
            }}
          >
            <iframe
              title="Vista previa del correo de bienvenida"
              srcDoc={generateWelcomeEmailHtml({
                fullName: formData.fullName || 'Valeria Carrillo',
                email: formData.email || 'valeria@ejemplo.com',
                phone: formData.phone || '+58 414-7518902',
              })}
              style={{ width: '100%', height: '460px', border: 'none', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
              Cerrar Vista Previa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
