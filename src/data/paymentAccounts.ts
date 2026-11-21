/**
 * Cuentas y Datos Oficiales para Recepción de Pagos en Estética Jos (Mérida, Venezuela)
 * - Pago Móvil Banesco: 04147518902, C.I. 12350227
 * - Demás métodos: Presencial en cabina (Efectivo / Punto de Venta) o coordinación vía WhatsApp
 */

export interface PaymentAccountDetail {
  id: string;
  name: string;
  badge: string;
  instructions: string;
  fields: Array<{
    label: string;
    value: string;
    copyable?: boolean;
  }>;
}

export const PAYMENT_ACCOUNTS: Record<string, PaymentAccountDetail> = {
  'PAGO MÓVIL': {
    id: 'PAGO MÓVIL',
    name: 'Pago Móvil Banesco',
    badge: 'Tasa Oficial BCV del Día',
    instructions: 'Realiza tu pago móvil por el monto en Bolívares calculado a la tasa oficial del BCV y envía el capture a nuestro WhatsApp para registrar tu turno.',
    fields: [
      { label: 'Banco', value: 'Banesco (0134)', copyable: true },
      { label: 'Teléfono', value: '04147518902', copyable: true },
      { label: 'Cédula', value: '12350227', copyable: true },
      { label: 'Titular', value: 'Joslin Serrano', copyable: false },
    ],
  },
  'EFECTIVO': {
    id: 'EFECTIVO',
    name: 'Efectivo Divisas (Presencial en Cabina)',
    badge: 'Pago Presencial en Mérida',
    instructions: 'Pagas directamente en nuestra cabina en el CC Naranjo, Piso 2, el día de tu cita. Aceptamos billetes de dólares (USD) o euros (EUR) en buen estado (sin roturas ni tachaduras).',
    fields: [
      { label: 'Modalidad', value: 'Presencial en cabina el día de tu turno', copyable: false },
      { label: 'Sede', value: 'Centro Comercial Naranjo, Piso 2, Urb. La Mata, Mérida', copyable: false },
      { label: 'Monedas', value: 'Dólares en efectivo (USD) o Euros (EUR)', copyable: false },
    ],
  },
  'TARJETA': {
    id: 'TARJETA',
    name: 'Punto de Venta (Presencial en Cabina)',
    badge: 'Pago Presencial en Mérida',
    instructions: 'Cancelas directamente con tu tarjeta de débito o crédito en nuestro punto de venta físico en cabina el día de tu turno.',
    fields: [
      { label: 'Modalidad', value: 'Punto de venta físico en cabina', copyable: false },
      { label: 'Sede', value: 'Centro Comercial Naranjo, Piso 2, Mérida', copyable: false },
      { label: 'Tarjetas recibidas', value: 'Débito y Crédito Nacional', copyable: false },
    ],
  },
  'ZELLE': {
    id: 'ZELLE',
    name: 'Zelle / Binance / Transferencia (Vía WhatsApp)',
    badge: 'Coordinar por WhatsApp',
    instructions: 'Al hacer clic en "Confirmar Cita por WhatsApp" se abrirá nuestro chat para enviarte los datos de Zelle, Binance o cuenta bancaria y verificar tu pago directamente.',
    fields: [
      { label: 'Canal', value: 'Atención y datos directos por WhatsApp', copyable: false },
      { label: 'WhatsApp Oficial', value: '+58 414-7518902', copyable: true },
    ],
  },
};
