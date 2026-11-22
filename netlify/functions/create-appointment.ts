import { Handler } from '@netlify/functions';
import { checkRateLimit, extractClientIp } from './utils/rateLimiter';
import {
  verifyTurnstileToken,
  validateHoneypot,
  sanitizeString,
  validateWhitelistedFields,
  getCorsHeaders,
} from './utils/security';

const ALLOWED_APPOINTMENT_FIELDS = [
  'clientName',
  'clientPhone',
  'clientEmail',
  'serviceName',
  'professionalName',
  'date',
  'time',
  'paymentMethod',
  'notes',
  'price',
  'honeypot',
  'turnstileToken',
];

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  const corsHeaders = getCorsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método no permitido. Utiliza POST.' }),
    };
  }

  // 1. Rate Limiting por IP (Máximo 6 citas por minuto por IP)
  const clientIp = extractClientIp(event.headers as Record<string, string>);
  const rateLimit = checkRateLimit(clientIp, 6, 60000);

  if (!rateLimit.allowed) {
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.retryAfterSeconds || 60),
      },
      body: JSON.stringify({
        error: `Límite de solicitudes de cita excedido. Espera ${rateLimit.retryAfterSeconds} segundos.`,
      }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'El cuerpo de la solicitud no puede estar vacío.' }),
      };
    }

    const payload = JSON.parse(event.body);

    // 2. Validación estricta de campos permitidos
    const fieldCheck = validateWhitelistedFields(payload, ALLOWED_APPOINTMENT_FIELDS);
    if (!fieldCheck.valid) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Campos no permitidos en la solicitud de cita.',
          invalidFields: fieldCheck.extraFields,
        }),
      };
    }

    // 3. Verificación de Honeypot
    if (!validateHoneypot(payload.honeypot)) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Solicitud bloqueada por protección anti-spam.' }),
      };
    }

    // 4. Verificación de Turnstile
    const turnstileCheck = await verifyTurnstileToken(payload.turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return {
        statusCode: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Verificación de seguridad Turnstile requerida.' }),
      };
    }

    // 5. Sanitización de datos
    const cleanClientName = sanitizeString(payload.clientName, 100);
    const cleanClientPhone = sanitizeString(payload.clientPhone, 30);
    const cleanClientEmail = sanitizeString(payload.clientEmail, 120);
    const cleanServiceName = sanitizeString(payload.serviceName, 100);
    const cleanProfessional = sanitizeString(payload.professionalName, 100);
    const cleanDate = sanitizeString(payload.date, 20);
    const cleanTime = sanitizeString(payload.time, 20);
    const cleanPaymentMethod = sanitizeString(payload.paymentMethod, 50);
    const cleanNotes = sanitizeString(payload.notes, 300);

    if (!cleanClientName || !cleanClientPhone || !cleanServiceName || !cleanDate || !cleanTime) {
      return {
        statusCode: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Faltan campos obligatorios para agendar la cita.' }),
      };
    }

    // 6. Seguridad de Negocio: Estado SIEMPRE "Pendiente", precio numérico seguro
    const parsedPrice = typeof payload.price === 'number' && payload.price > 0 ? payload.price : 0;
    const appointmentId = `JOS-${Date.now().toString(36).toUpperCase()}`;

    const appointmentRecord = {
      id: appointmentId,
      createdAt: new Date().toISOString(),
      clientName: cleanClientName,
      clientPhone: cleanClientPhone,
      clientEmail: cleanClientEmail,
      serviceName: cleanServiceName,
      professionalName: cleanProfessional,
      date: cleanDate,
      time: cleanTime,
      price: parsedPrice,
      paymentMethod: cleanPaymentMethod || 'Pago Móvil (BCV)',
      notes: cleanNotes || 'Agendado vía PWA',
      status: 'Pendiente', // El cliente NUNCA puede alterar el estado
    };

    // 7. Sincronización estricta con Google Sheets (pestaña Citas y Cobros)
    const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!sheetsWebhook) {
      console.error('[Google Sheets Error]: Variable GOOGLE_SHEETS_WEBHOOK_URL no configurada en Netlify.');
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Error de configuración en Netlify: falta configurar la variable GOOGLE_SHEETS_WEBHOOK_URL.',
        }),
      };
    }

    let sheetsSyncResult: any = null;
    try {
      const sheetRes = await fetch(sheetsWebhook, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'book_appointment',
          appointmentId,
          fecha: cleanDate,
          hora: cleanTime,
          cliente: cleanClientName,
          tratamiento: cleanServiceName,
          profesional: cleanProfessional,
          cantidad: 1,
          forma_pago: cleanPaymentMethod || 'PAGO MÓVIL',
          notas: cleanNotes || 'Agendado vía PWA',
          correo: cleanClientEmail,
          precio: parsedPrice,
          // Compatibilidad dual
          clientName: cleanClientName,
          clientPhone: cleanClientPhone,
          clientEmail: cleanClientEmail,
          serviceName: cleanServiceName,
          professionalName: cleanProfessional,
          date: cleanDate,
          time: cleanTime,
          paymentMethod: cleanPaymentMethod || 'PAGO MÓVIL',
        }),
      });

      if (!sheetRes.ok) {
        console.error(`[Google Sheets Error Citas]: Servidor respondió con estado HTTP ${sheetRes.status}`);
        return {
          statusCode: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: `El servidor de Google Sheets respondió con error (HTTP ${sheetRes.status}) al guardar la cita en Citas y Cobros.`,
          }),
        };
      }

      sheetsSyncResult = await sheetRes.json();
      if (!sheetsSyncResult.success) {
        console.warn('[Google Sheets Sync Error Citas]:', sheetsSyncResult);
        return {
          statusCode: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: sheetsSyncResult.error || 'No se pudo guardar la fila en la pestaña Citas y Cobros de Google Sheets.',
          }),
        };
      }
    } catch (err: any) {
      console.error('[Google Sheets Network Error Citas]:', err.message);
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: `Fallo de conexión al sincronizar la cita con Google Sheets: ${err.message}.`,
        }),
      };
    }

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Cita registrada con éxito en Citas y Cobros con estado Agendada.',
        data: appointmentRecord,
        sheetsSync: 'synced',
        sheetRow: sheetsSyncResult?.data?.row,
      }),
    };
  } catch (error: any) {
    console.error('Error en create-appointment:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Error interno al procesar la cita.' }),
    };
  }
};
