/**
 * Utilidades de Seguridad para Netlify Functions - Estética Jos
 * Incluye: Turnstile, Honeypot, Sanitización e Inmunidad a Prototype Pollution.
 */

// 1. Verificación de Cloudflare Turnstile
export async function verifyTurnstileToken(token?: string, clientIp?: string): Promise<{ success: boolean; reason?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Si la clave no está configurada aún en .env (desarrollo local), permitimos pasar con advertencia
  if (!secretKey) {
    return { success: true, reason: 'turnstile_not_configured_dev_pass' };
  }

  if (!token) {
    return { success: false, reason: 'Token de seguridad Turnstile ausente.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await res.json();
    return {
      success: outcome.success === true,
      reason: outcome.success ? undefined : (outcome['error-codes'] || []).join(', '),
    };
  } catch (error: any) {
    console.error('[Turnstile Network Error]:', error.message);
    // En caso de caída de la red de Turnstile, no bloquear al usuario legítimo
    return { success: true, reason: 'turnstile_network_fallback' };
  }
}

// 2. Validación de Campo Trampa (Honeypot)
// Los bots rellenan todos los campos que encuentran; si este campo tiene valor, es un bot.
export function validateHoneypot(honeypotField: any): boolean {
  if (honeypotField !== undefined && honeypotField !== null && String(honeypotField).trim() !== '') {
    return false; // Es un bot
  }
  return true; // Campo limpio
}

// 3. Sanitización de cadenas de texto (Anti-XSS y Anti-Injection)
export function sanitizeString(input: any, maxLength = 250): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Elimina caracteres de etiquetas HTML
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

// 4. Validación estricta de lista blanca (Whitelist) de campos
// Rechaza campos no autorizados o ataques de Prototype Pollution
export function validateWhitelistedFields(
  payload: Record<string, any>,
  allowedFields: string[]
): { valid: boolean; extraFields?: string[] } {
  const extraFields: string[] = [];

  for (const key of Object.keys(payload)) {
    // Proteger contra prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return { valid: false, extraFields: [key] };
    }

    if (!allowedFields.includes(key)) {
      extraFields.push(key);
    }
  }

  if (extraFields.length > 0) {
    return { valid: false, extraFields };
  }

  return { valid: true };
}

// 5. Configuración de Cabeceras CORS Dinámicas
export function getCorsHeaders(requestOrigin?: string): Record<string, string> {
  const allowedOrigin = process.env.VITE_SITE_URL || 'https://esteticajos.netlify.app';
  
  // En desarrollo local o si coincide el origen
  const origin = (requestOrigin && (requestOrigin.includes('localhost') || requestOrigin.includes('netlify.app')))
    ? requestOrigin
    : allowedOrigin;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}
