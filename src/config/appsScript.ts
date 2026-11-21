/**
 * Configuración del Web App de Google Apps Script
 * Conexión directa a Google Sheets (ID: 1TdzyhRWgIcoVeqavjaTRFKAO8-e84YSEfS1lUvVCsic)
 */

// Constante configurable del Web App de Google Apps Script.
// Puedes definirla en tu archivo .env como VITE_APPS_SCRIPT_URL
// o reemplazar directamente la URL aquí cuando publiques el script.
export const APPS_SCRIPT_URL: string =
  (import.meta.env.VITE_APPS_SCRIPT_URL as string) ||
  (import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string) ||
  'https://script.google.com/macros/s/AKfycbxRtpyFn5HZt79rbMopP1uU6UKumhYdznfEesBwzLtW5U7NgmVC_wbcGzs3LfqQPMoq/exec';

export interface RegisterClientData {
  nombre: string;
  telefono: string;
  correo: string;
}

export interface BookAppointmentData {
  fecha: string;
  hora: string;
  cliente: string;
  tratamiento: string;
  profesional: string;
  cantidad: number;
  forma_pago: string;
  notas?: string;
  correo: string;
}

export interface AppsScriptResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  alreadyExists?: boolean;
  data?: T;
  count?: number;
  tratamientos?: any[];
}

/**
 * 1. Envía el registro de un nuevo cliente a Google Sheets
 * - Inserta en la pestaña 'Clientes' (columnas A:D)
 * - Envía correo de bienvenida vía MailApp
 */
export async function sendRegisterClientToAppsScript(
  clientData: RegisterClientData
): Promise<AppsScriptResponse> {
  if (!APPS_SCRIPT_URL) {
    console.warn('[AppsScript] APPS_SCRIPT_URL no está configurada aún en .env. Se registrará localmente.');
    return {
      success: true,
      message: 'Registro simulado en desarrollo (falta configurar APPS_SCRIPT_URL).',
    };
  }

  const payload = {
    action: 'register_client',
    nombre: clientData.nombre.trim(),
    telefono: clientData.telefono.trim(),
    correo: clientData.correo.trim().toLowerCase(),
  };

  try {
    // Usamos text/plain en el fetch para evitar que el navegador envíe una petición OPTIONS (preflight CORS)
    // que Apps Script no maneja nativamente. Apps Script lee igualmente el JSON desde e.postData.contents.
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('[AppsScript] Error al registrar cliente:', error);
    return {
      success: false,
      error: error.message || 'No se pudo conectar con el servidor de Google Sheets.',
    };
  }
}

export function normalizePaymentMethod(method?: string): string {
  if (!method) return 'PAGO MÓVIL';
  const upper = method.toUpperCase().trim();
  if (upper.includes('MÓVIL') || upper.includes('MOVIL') || upper.includes('BCV')) return 'PAGO MÓVIL';
  if (upper.includes('EFECTIVO') || upper.includes('DIVISA') || upper.includes('USD') || upper.includes('EUR')) return 'EFECTIVO';
  if (upper.includes('ZELLE')) return 'ZELLE';
  if (upper.includes('BINANCE') || upper.includes('USDT') || upper.includes('CRIPTO')) return 'BINANCE';
  if (upper.includes('TRANSFERENCIA') || upper.includes('BANCO')) return 'TRANSFERENCIA';
  if (upper.includes('TARJETA') || upper.includes('PUNTO') || upper.includes('DÉBITO') || upper.includes('CRÉDITO')) return 'TARJETA';
  if (upper.includes('PAYPAL')) return 'PAYPAL';
  return 'PAGO MÓVIL';
}

/**
 * 2. Envía la reserva de cita a Google Sheets
 * - Inserta en la pestaña 'Citas y Cobros' con Estado "Agendada" (col M)
 * - Deja vacías P (Calendar), Q y R para que se activen las automatizaciones
 */
export async function sendBookAppointmentToAppsScript(
  appointmentData: BookAppointmentData
): Promise<AppsScriptResponse> {
  if (!APPS_SCRIPT_URL) {
    console.warn('[AppsScript] APPS_SCRIPT_URL no configurada. Se continuará con WhatsApp.');
    return {
      success: true,
      message: 'Cita procesada en modo sin conexión a Sheets.',
    };
  }

  const payload = {
    action: 'book_appointment',
    fecha: appointmentData.fecha,
    hora: appointmentData.hora,
    cliente: appointmentData.cliente.trim(),
    tratamiento: appointmentData.tratamiento.trim(),
    profesional: appointmentData.profesional.trim(),
    cantidad: appointmentData.cantidad || 1,
    forma_pago: normalizePaymentMethod(appointmentData.forma_pago),
    notas: appointmentData.notas || 'Agendado vía PWA',
    correo: appointmentData.correo.trim().toLowerCase(),
  };

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('[AppsScript] Error al reservar cita:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión al guardar la cita en Google Sheets.',
    };
  }
}

/**
 * 3. Obtiene el catálogo de tratamientos en vivo desde la pestaña 'Catálogo'
 */
export async function fetchCatalogFromAppsScript(): Promise<AppsScriptResponse> {
  if (!APPS_SCRIPT_URL) {
    return { success: false, error: 'APPS_SCRIPT_URL no definida' };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'GET',
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al obtener el catálogo de Google Sheets.',
    };
  }
}
