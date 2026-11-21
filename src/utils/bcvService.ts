/**
 * Servicio Oficial de Tasa de Cambio BCV (Banco Central de Venezuela)
 * Permite calcular montos exactos en Bolívares (VES) para Pago Móvil y Transferencia.
 * Sincronización automática diaria con el Banco Central de Venezuela.
 */

export interface BcvRateInfo {
  rate: number;
  dateStr: string;
  isLive: boolean;
  bcvOfficialDate?: string;
}

const STORAGE_KEY = 'jos_bcv_rate';
const STORAGE_DATE_KEY = 'jos_bcv_timestamp';
const STORAGE_CALENDAR_DAY_KEY = 'jos_bcv_calendar_day';
const STORAGE_BCV_DATE_KEY = 'jos_bcv_official_date';
const DEFAULT_FALLBACK_RATE = 918.75;

/**
 * Obtiene la tasa oficial del BCV en vivo.
 * Se actualiza automáticamente cada día y cada vez que expire el caché de 1 hora.
 * @param forceRefresh Fuerza la consulta a la API sin usar la memoria caché local.
 */
export async function getOfficialBcvRate(forceRefresh = false): Promise<BcvRateInfo> {
  const todayCalendarDay = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

  // 1. Si no es recarga forzada, verificar si tenemos una tasa válida del mismo día
  if (!forceRefresh) {
    try {
      const cachedRate = localStorage.getItem(STORAGE_KEY);
      const cachedTime = localStorage.getItem(STORAGE_DATE_KEY);
      const cachedDay = localStorage.getItem(STORAGE_CALENDAR_DAY_KEY);
      const cachedOfficialDate = localStorage.getItem(STORAGE_BCV_DATE_KEY) || undefined;

      // Solo usamos el caché si corresponde exactamente al día de hoy Y tiene menos de 90 minutos
      if (cachedRate && cachedTime && cachedDay === todayCalendarDay) {
        const parsedRate = parseFloat(cachedRate);
        const ageMinutes = (Date.now() - parseInt(cachedTime, 10)) / (1000 * 60);

        if (!isNaN(parsedRate) && parsedRate > 0 && ageMinutes < 90) {
          return {
            rate: parsedRate,
            dateStr: 'Hoy ' + new Date(parseInt(cachedTime, 10)).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
            isLive: true,
            bcvOfficialDate: cachedOfficialDate,
          };
        }
      }
    } catch {
      // Continuar si falla localStorage
    }
  }

  // 2. Consultar API oficial en vivo (Directo al BCV vía DolarAPI Oficial Venezuela)
  try {
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { Accept: 'application/json' },
      cache: 'no-store', // Evitar caché estático del navegador
    });

    if (response.ok) {
      const data = await response.json();
      const liveRate = typeof data.promedio === 'number' ? data.promedio : parseFloat(data.promedio);

      if (!isNaN(liveRate) && liveRate > 0) {
        const rateRounded = Math.round(liveRate * 100) / 100;
        let officialDateFormatted = '';

        if (data.fechaActualizacion) {
          try {
            const dateObj = new Date(data.fechaActualizacion);
            officialDateFormatted = dateObj.toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          } catch {}
        }

        try {
          localStorage.setItem(STORAGE_KEY, rateRounded.toString());
          localStorage.setItem(STORAGE_DATE_KEY, Date.now().toString());
          localStorage.setItem(STORAGE_CALENDAR_DAY_KEY, todayCalendarDay);
          if (officialDateFormatted) {
            localStorage.setItem(STORAGE_BCV_DATE_KEY, officialDateFormatted);
          }
        } catch {}

        return {
          rate: rateRounded,
          dateStr: 'Actualizado hoy ' + new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
          isLive: true,
          bcvOfficialDate: officialDateFormatted,
        };
      }
    }
  } catch (err) {
    console.warn('[BCV Service] Error al obtener tasa fresca del BCV, usando último registro:', err);
  }

  // 3. Respaldo offline: usar la última tasa registrada en este dispositivo
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    const cachedDay = localStorage.getItem(STORAGE_CALENDAR_DAY_KEY);
    const cachedOfficialDate = localStorage.getItem(STORAGE_BCV_DATE_KEY) || undefined;

    if (cached) {
      const val = parseFloat(cached);
      if (!isNaN(val) && val > 0) {
        return {
          rate: val,
          dateStr: cachedDay ? `Registrada el ${cachedDay}` : 'Última registrada',
          isLive: false,
          bcvOfficialDate: cachedOfficialDate,
        };
      }
    }
  } catch {}

  // 4. Último recurso (fallback base)
  return {
    rate: DEFAULT_FALLBACK_RATE,
    dateStr: 'Tasa base estimada',
    isLive: false,
  };
}

/**
 * Formatea un monto en USD a su equivalente exacto en Bolívares (VES)
 */
export function formatBs(usdAmount: number, rate: number): string {
  const totalBs = usdAmount * rate;
  return `Bs. ${totalBs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
