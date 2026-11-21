/**
 * Servicio de sincronización con Google Sheets y Backend API
 * Gestiona el envío seguro de citas y registros de pacientes.
 */

export interface AppointmentPayload {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  price: number;
  paymentMethod: string;
  notes?: string;
}

export interface ClientPayload {
  fullName: string;
  phone: string;
  email: string;
  interest?: string;
  notes?: string;
}

const DIRECT_WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';

/**
 * Sincroniza una cita con el backend (Netlify Functions) y fallback a Google Sheets
 */
export async function syncAppointment(data: AppointmentPayload): Promise<{ success: boolean; source: string }> {
  // 1. Intentar vía endpoint del backend (Netlify Function /api/create-appointment)
  try {
    const res = await fetch('/api/create-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        honeypot: '',
        turnstileToken: 'turnstile_dev_mock_token',
      }),
    });

    if (res.ok) {
      return { success: true, source: 'api' };
    }
  } catch (apiError) {
    console.warn('[Sync] Falló endpoint /api/create-appointment, intentando alternativa...', apiError);
  }

  // 2. Si el endpoint de Netlify no está disponible (ej: modo dev local con Vite)
  // y se configuró la URL directa del webhook de Apps Script:
  if (DIRECT_WEBHOOK_URL) {
    try {
      await fetch(DIRECT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors', // Para evitar bloqueos CORS en navegadores
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_appointment',
          ...data,
        }),
      });
      return { success: true, source: 'direct_webhook' };
    } catch (directError) {
      console.error('[Sync] Error al enviar directamente a Google Sheets:', directError);
    }
  }

  return { success: false, source: 'none' };
}

/**
 * Sincroniza un nuevo paciente con el backend y Google Sheets
 */
export async function syncClient(data: ClientPayload): Promise<{ success: boolean; source: string }> {
  try {
    const res = await fetch('/api/register-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        honeypot: '',
        turnstileToken: 'turnstile_dev_mock_token',
      }),
    });

    if (res.ok) {
      return { success: true, source: 'api' };
    }
  } catch (apiError) {
    console.warn('[Sync] Falló endpoint /api/register-client, intentando webhook directo...', apiError);
  }

  if (DIRECT_WEBHOOK_URL) {
    try {
      await fetch(DIRECT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_client',
          ...data,
        }),
      });
      return { success: true, source: 'direct_webhook' };
    } catch (directError) {
      console.error('[Sync] Error al registrar cliente directamente en Google Sheets:', directError);
    }
  }

  return { success: false, source: 'none' };
}
