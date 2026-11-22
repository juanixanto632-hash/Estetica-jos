import { Handler } from '@netlify/functions';
import { checkRateLimit, extractClientIp } from './utils/rateLimiter';
import {
  verifyTurnstileToken,
  validateHoneypot,
  sanitizeString,
  validateWhitelistedFields,
  getCorsHeaders,
} from './utils/security';

const ALLOWED_GIFT_FIELDS = [
  'codigo',
  'de',
  'para',
  'tratamiento',
  'precio',
  'correo_entrega',
  'estado',
  'fecha',
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

  // 1. Rate Limiter (Máximo 5 solicitudes de Gift Card por minuto por IP)
  const clientIp = extractClientIp(event.headers as Record<string, string>);
  const rateLimit = checkRateLimit(clientIp, 5, 60000);

  if (!rateLimit.allowed) {
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.retryAfterSeconds || 60),
      },
      body: JSON.stringify({
        error: `Límite de solicitudes de Gift Card excedido. Espera ${rateLimit.retryAfterSeconds} segundos.`,
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

    // 2. Validación de Campos Permitidos
    const fieldCheck = validateWhitelistedFields(payload, ALLOWED_GIFT_FIELDS);
    if (!fieldCheck.valid) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Campos no permitidos en la solicitud de Gift Card.',
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
    const cleanCodigo = sanitizeString(payload.codigo, 30) || `GIFT-${Date.now().toString(36).toUpperCase()}`;
    const cleanDe = sanitizeString(payload.de, 100);
    const cleanPara = sanitizeString(payload.para, 100);
    const cleanTratamiento = sanitizeString(payload.tratamiento, 100);
    const cleanCorreoEntrega = sanitizeString(payload.correo_entrega, 120).toLowerCase();
    const cleanFecha = sanitizeString(payload.fecha, 20) || new Date().toLocaleDateString('es-VE');
    const parsedPrecio = typeof payload.precio === 'number' && payload.precio > 0 ? payload.precio : 0;

    if (!cleanDe || !cleanPara || !cleanTratamiento) {
      return {
        statusCode: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Los campos de remitente (De), beneficiario (Para) y tratamiento son obligatorios.' }),
      };
    }

    // 6. Sincronización estricta con Google Sheets (pestaña 'Gift Cards')
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
          action: 'request_gift_card',
          codigo: cleanCodigo,
          fecha: cleanFecha,
          de: cleanDe,
          para: cleanPara,
          tratamiento: cleanTratamiento,
          precio: parsedPrecio,
          correo_entrega: cleanCorreoEntrega,
          estado: 'Pendiente',
        }),
      });

      if (!sheetRes.ok) {
        console.error(`[Google Sheets Error Gift Cards]: Servidor respondió con estado HTTP ${sheetRes.status}`);
        return {
          statusCode: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: `El servidor de Google Sheets respondió con error (HTTP ${sheetRes.status}) al guardar la Gift Card en la pestaña Gift Cards.`,
          }),
        };
      }

      sheetsSyncResult = await sheetRes.json();
      if (!sheetsSyncResult.success) {
        console.warn('[Google Sheets Sync Error Gift Cards]:', sheetsSyncResult);
        return {
          statusCode: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: sheetsSyncResult.error || 'No se pudo guardar la fila en la pestaña Gift Cards de Google Sheets.',
          }),
        };
      }
    } catch (err: any) {
      console.error('[Google Sheets Network Error Gift Cards]:', err.message);
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: `Fallo de conexión al sincronizar la Gift Card con Google Sheets: ${err.message}.`,
        }),
      };
    }

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Solicitud de Gift Card registrada exitosamente con estado Pendiente en Google Sheets.',
        codigo: cleanCodigo,
        estado: 'Pendiente',
        sheetsSync: 'synced',
      }),
    };
  } catch (error: any) {
    console.error('Error en request-gift-card:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Error interno al procesar la Gift Card.' }),
    };
  }
};
