import { Handler } from '@netlify/functions';
import { generateWelcomeEmailHtml } from './templates/welcomeEmail';
import { checkRateLimit, extractClientIp } from './utils/rateLimiter';
import {
  verifyTurnstileToken,
  validateHoneypot,
  sanitizeString,
  validateWhitelistedFields,
  getCorsHeaders,
} from './utils/security';

const registeredEmails = new Set<string>();

// Lista blanca estricta de campos permitidos en el registro
const ALLOWED_FIELDS = [
  'fullName',
  'email',
  'phone',
  'interest',
  'notes',
  'honeypot',
  'turnstileToken',
];

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  const corsHeaders = getCorsHeaders(origin);

  // Preflight OPTIONS
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

  // 1. Control de Límite de Peticiones por IP (Rate Limiter: max 5 por minuto)
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
        error: `Has excedido el límite de solicitudes. Por favor espera ${rateLimit.retryAfterSeconds} segundos antes de intentar nuevamente.`,
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

    // 2. Validación de Campos Permitidos (Whitelist y Anti-Prototype Pollution)
    const fieldCheck = validateWhitelistedFields(payload, ALLOWED_FIELDS);
    if (!fieldCheck.valid) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'La solicitud contiene campos no permitidos o potencialmente maliciosos.',
          invalidFields: fieldCheck.extraFields,
        }),
      };
    }

    // 3. Verificación de Honeypot (Anti-bots)
    if (!validateHoneypot(payload.honeypot)) {
      // Si el honeypot fue llenado, rechazamos silenciosamente con código 400
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Solicitud bloqueada por protección anti-spam.' }),
      };
    }

    // 4. Verificación de Cloudflare Turnstile
    const turnstileCheck = await verifyTurnstileToken(payload.turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return {
        statusCode: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Verificación de seguridad Turnstile fallida.' }),
      };
    }

    // 5. Sanitización de Entradas
    const cleanName = sanitizeString(payload.fullName, 100);
    const cleanEmail = sanitizeString(payload.email, 120).toLowerCase();
    const cleanPhone = sanitizeString(payload.phone, 30);
    const cleanInterest = sanitizeString(payload.interest, 30) || 'facial';
    const cleanNotes = sanitizeString(payload.notes, 500);

    // Validaciones estrictas de servidor
    if (cleanName.length < 3) {
      return {
        statusCode: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'El nombre completo debe tener al menos 3 caracteres.' }),
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return {
        statusCode: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Por favor ingresa un correo electrónico válido.' }),
      };
    }

    // 6. Prevención de Duplicados
    if (registeredEmails.has(cleanEmail)) {
      return {
        statusCode: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Este correo electrónico ya se encuentra registrado como paciente en Estética Jos.',
          isDuplicate: true,
        }),
      };
    }

    registeredEmails.add(cleanEmail);

    // 7. Generación de Plantilla HTML segura
    const emailHtml = generateWelcomeEmailHtml({
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    });

    // 8. Envío de Correo vía Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    let emailStatus = 'pending';
    let emailId = null;

    if (resendApiKey) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Estética Jos <onboarding@resend.dev>',
            to: [cleanEmail],
            subject: `¡Bienvenida a Estética Jos, ${cleanName.split(' ')[0]}! ✨ Tu ficha de paciente`,
            html: emailHtml,
          }),
        });

        const resendData = await resendResponse.json();
        if (resendResponse.ok) {
          emailStatus = 'sent';
          emailId = resendData.id;
        } else {
          console.warn('[Resend API Error]:', resendData);
          emailStatus = 'failed_api';
        }
      } catch (err: any) {
        console.error('[Resend Network Error]:', err.message);
        emailStatus = 'failed_network';
      }
    } else {
      console.log(`[Resend Simulado]: Correo preparado para: ${cleanEmail}`);
      emailStatus = 'simulated';
    }

    // 9. Sincronización automática con Google Sheets (pestaña Clientes)
    const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    let sheetsSync = 'skipped';
    if (sheetsWebhook) {
      try {
        const sheetRes = await fetch(sheetsWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register_client',
            fullName: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            interest: cleanInterest,
            notes: cleanNotes,
          }),
        });
        sheetsSync = sheetRes.ok ? 'synced' : `error_status_${sheetRes.status}`;
      } catch (err: any) {
        console.warn('[Google Sheets Register Sync Error]:', err.message);
        sheetsSync = 'network_error';
      }
    }

    // 10. Respuesta Segura: NUNCA expone datos privados innecesarios
    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Paciente registrado exitosamente en Estética Jos.',
        data: {
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          interest: cleanInterest,
          registeredAt: new Date().toISOString(),
          emailStatus,
          emailId,
          sheetsSync,
        },
      }),
    };
  } catch (error: any) {
    console.error('Error en register-client:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Ocurrió un error al procesar el registro.' }),
    };
  }
};
