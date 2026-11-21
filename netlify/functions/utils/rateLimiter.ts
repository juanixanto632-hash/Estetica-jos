/**
 * Rate Limiter en Memoria para Netlify Functions
 * Implementa una ventana deslizante (Sliding Window) por dirección IP.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const ipHistory = new Map<string, RateLimitRecord>();

// Limpieza periódica de IPs antiguas para evitar consumo de memoria
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipHistory.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 120000); // 2 minutos
    if (record.timestamps.length === 0) {
      ipHistory.delete(ip);
    }
  }
}, 60000);

export function checkRateLimit(
  clientIp: string,
  maxRequests = 5,
  windowMs = 60000
): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const safeIp = clientIp || 'unknown_ip';

  let record = ipHistory.get(safeIp);
  if (!record) {
    record = { timestamps: [] };
    ipHistory.set(safeIp, record);
  }

  // Filtrar timestamps que estén dentro de la ventana de tiempo
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
  };
}

export function extractClientIp(headers: Record<string, string | undefined>): string {
  const xForwardedFor = headers['x-forwarded-for'] || headers['X-Forwarded-For'];
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return (
    headers['client-ip'] ||
    headers['Client-Ip'] ||
    headers['x-real-ip'] ||
    headers['X-Real-Ip'] ||
    '127.0.0.1'
  );
}
