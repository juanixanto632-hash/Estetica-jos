/**
 * Archivo de Mapeo Oficial: Google Sheets <-> PWA Estética Jos
 * Basado en la estructura real de la hoja:
 * "Copia de Sistema de Gestión - Estética Jos"
 */

// Pestaña: "Catálogo"
export const CATALOGO_SHEET = {
  TAB_NAME: 'Catálogo',
  COLUMNS: {
    TRATAMIENTO: 0, // Col A: Tratamiento
    AREA: 1,        // Col B: Área (Facial / Corporal / Nutrición)
    PRECIO: 2,      // Col C: Precio (ej: "$25.00")
    DIAS_VOLVER: 3, // Col D: Días para volver
    SIN_FECHA: 4,   // Col E: Tratamientos sin fecha
    PROFESIONAL: 5, // Col F: Profesional sugerido
    MODALIDAD: 6,   // Col G: Modalidad de cobro
  },
};

// Pestaña: "Citas y Cobros"
export const CITAS_SHEET = {
  TAB_NAME: 'Citas y Cobros',
  COLUMNS: {
    FECHA: 0,            // Col A: Fecha (DD/MM/YYYY)
    HORA: 1,             // Col B: Hora (ej: "9:30 AM")
    CLIENTE: 2,          // Col C: Nombre del cliente
    TRATAMIENTO: 3,      // Col D: Nombre del tratamiento
    PROFESIONAL: 4,      // Col E: Nombre de la profesional
    CANTIDAD: 5,         // Col F: Cantidad (default: 1)
    PRECIO: 6,           // Col G: Precio base
    DESCUENTO: 7,        // Col H: Descuento
    PORCENTAJE_PRO: 8,   // Col I: % profesional
    TOTAL_COBRADO: 9,    // Col J: Total cobrado
    INGRESO_ESTETICA: 10,// Col K: Ingreso estética
    FORMA_PAGO: 11,      // Col L: Forma de pago (Pago Móvil, Efectivo, Zelle, etc.)
    ESTADO_CITA: 12,     // Col M: Estado de la cita (SIEMPRE "Pendiente")
    NOTAS: 13,           // Col N: Notas
    CORREO_CLIENTE: 14,  // Col O: Correo del cliente
  },
};

// Pestaña: "Clientes"
export const CLIENTES_SHEET = {
  TAB_NAME: 'Clientes',
  COLUMNS: {
    NOMBRE: 0,           // Col A: Nombre
    TELEFONO: 1,         // Col B: Teléfono
    CORREO: 2,           // Col C: Correo
    FECHA_REGISTRO: 3,   // Col D: Fecha de registro
    ULTIMA_VISITA: 4,    // Col E: Última visita
    DIAS_SIN_VENIR: 5,   // Col F: Días sin venir
    PROXIMA_VISITA: 6,   // Col G: Próxima visita sugerida
    ESTADO: 7,           // Col H: Estado (ej: "Sin visitas aún")
    ULTIMO_TRATAMIENTO: 8,// Col I: Último tratamiento
    AVISO_RETORNO: 9,    // Col J: Aviso de retorno
  },
};

export interface SheetServiceItem {
  id: string;
  name: string;
  category: 'facial' | 'corporal' | 'nutricion';
  price: number;
  durationMinutes: number;
  area: string;
  professionalDefault?: string;
}

export interface SheetProfessionalItem {
  id: string;
  name: string;
  role: string;
  specialty: string;
}
