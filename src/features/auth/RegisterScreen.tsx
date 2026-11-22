import React, { useState } from 'react';
import { UserCheck, Mail, Phone, User, CheckCircle2, Heart, AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Input, Card, TurnstileWidget } from '../../components/common';
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
      let success = false;
      let errorMessage = '';

      // 1. Enviar prioritariamente a Netlify Function /api/register-client
      try {
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

        const resData = await response.json().catch(() => ({}));

        if (response.ok && resData.success) {
          success = true;
        } else if (response.status === 409 || resData.isDuplicate) {
          setErrors({ email: resData.error || 'Este correo ya se encuentra registrado en nuestra base de datos.' });
          setIsLoading(false);
          return;
        } else if (response.status === 404 && APPS_SCRIPT_URL) {
          // Fallback a Apps Script directo si /api retorna 404 (ej. en desarrollo local estático con Vite)
          const directRes = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(clientPayload),
          });
          const directData = await directRes.json();
          if (directData.success) {
            success = true;
          } else if (directData.alreadyExists) {
            setErrors({ email: 'Este correo ya se encuentra registrado en nuestra base de datos.' });
            setIsLoading(false);
            return;
          } else {
            errorMessage = directData.error || 'Error al guardar en Google Sheets.';
          }
        } else {
          errorMessage = resData.error || `Error del servidor de registro (HTTP ${response.status}).`;
        }
      } catch (netErr: any) {
        // En caso de fallo de red al llamar /api, intentar con APPS_SCRIPT_URL directo
        if (APPS_SCRIPT_URL) {
          try {
            const directRes = await fetch(APPS_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(clientPayload),
            });
            const directData = await directRes.json();
            if (directData.success) {
              success = true;
            } else if (directData.alreadyExists) {
              setErrors({ email: 'Este correo ya se encuentra registrado en nuestra base de datos.' });
              setIsLoading(false);
              return;
            } else {
              errorMessage = directData.error || 'Error al guardar en Google Sheets.';
            }
          } catch (scriptErr: any) {
            errorMessage = `No se pudo conectar con el servidor ni con Google Sheets: ${scriptErr.message || netErr.message}`;
          }
        } else {
          errorMessage = `Error de conexión: ${netErr.message || 'No se pudo contactar al servidor.'}`;
        }
      }

      // Si falló el registro, mostramos el error real y NUNCA mostramos pantalla de bienvenida
      if (!success) {
        setServerNotice(errorMessage || 'No se pudo registrar el paciente en Google Sheets. Por favor intenta de nuevo.');
        setIsLoading(false);
        return;
      }

      // Guardar en almacenamiento local únicamente tras confirmación real del servidor
      localStorage.setItem('jos_patient_name', formData.fullName.trim());
      localStorage.setItem('jos_patient_phone', formData.phone.trim());
      localStorage.setItem('jos_patient_email', formData.email.trim().toLowerCase());

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[Register] Error inesperado en el registro:', err);
      setServerNotice(`Error al procesar el registro: ${err.message || 'Intente nuevamente más tarde.'}`);
      setIsSubmitted(false);
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
                Tu ficha clínica ya está lista en Estética Jos. Ya puedes agendar tu primera sesión en Mérida.
              </p>
            </div>

            {/* Tarjeta de Resumen ordenada como tabla limpia de 2 columnas */}
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '0.88rem',
              }}
            >
              <div
                className="flex justify-between items-center py-2 border-b border-purple-900/5 last:border-0"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0',
                  borderBottom: '1px solid rgba(88, 28, 135, 0.05)',
                }}
              >
                <span className="text-gray-500" style={{ color: '#6b7280' }}>Paciente: </span>
                <span className="font-semibold text-right" style={{ fontWeight: 600, textAlign: 'right', color: 'var(--text-main)' }}>{formData.fullName}</span>
              </div>

              <div
                className="flex justify-between items-center py-2 border-b border-purple-900/5 last:border-0"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0',
                  borderBottom: '1px solid rgba(88, 28, 135, 0.05)',
                }}
              >
                <span className="text-gray-500" style={{ color: '#6b7280' }}>Correo: </span>
                <span className="font-semibold text-right" style={{ fontWeight: 600, textAlign: 'right', color: 'var(--text-main)' }}>{formData.email}</span>
              </div>

              <div
                className="flex justify-between items-center py-2 border-b border-purple-900/5 last:border-0"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0',
                  borderBottom: '1px solid rgba(88, 28, 135, 0.05)',
                }}
              >
                <span className="text-gray-500" style={{ color: '#6b7280' }}>WhatsApp: </span>
                <span className="font-semibold text-right" style={{ fontWeight: 600, textAlign: 'right', color: 'var(--text-main)' }}>{formData.phone}</span>
              </div>

              <div
                className="flex justify-between items-center py-2 border-b border-purple-900/5 last:border-0"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0',
                  borderBottom: 'none',
                }}
              >
                <span className="text-gray-500" style={{ color: '#6b7280' }}>Sede: </span>
                <span className="font-semibold text-right text-purple-900" style={{ fontWeight: 600, textAlign: 'right', color: 'var(--jos-700)' }}>CC Naranjo · Piso 2 · Mérida</span>
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

              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('inicio');
                  } else {
                    setIsSubmitted(false);
                    setFormData({ fullName: '', phone: '', email: '', interest: 'facial', notes: '' });
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '0.5rem',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--jos-700)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Volver al Inicio
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
    </div>
  );
};
