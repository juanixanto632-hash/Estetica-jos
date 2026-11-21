/**
 * ============================================================================
 * SISTEMA DE GESTIÓN - ESTÉTICA JOS
 * Script Web App para Google Sheets (Base de Datos Oficial)
 * ID de Hoja: 1TdzyhRWgIcoVeqavjaTRFKAO8-e84YSEfS1lUvVCsic
 * ============================================================================
 * 
 * INSTRUCCIONES PARA PUBLICAR:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a: Extensiones -> Apps Script.
 * 3. Reemplaza el contenido de Code.gs por este archivo completo.
 * 4. Guarda los cambios (Ctrl + S o icono de disco).
 * 5. Haz clic en "Implementar" -> "Nueva implementación".
 * 6. Tipo: "Aplicación web".
 * 7. Configuración:
 *    - Descripción: "Web App Estética Jos v2"
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone)
 * 8. Haz clic en "Implementar", autoriza los permisos y copia la URL que termina en /exec.
 * ============================================================================
 */

const SPREADSHEET_ID = '1TdzyhRWgIcoVeqavjaTRFKAO8-e84YSEfS1lUvVCsic';
const TIMEZONE = 'America/Caracas';

// Nombres oficiales de las pestañas
const TAB_CATALOGO = 'Catálogo';
const TAB_CLIENTES = 'Clientes';
const TAB_CITAS = 'Citas y Cobros';
const TAB_GIFT_CARDS = 'Gift Cards';

/**
 * Obtiene la hoja de cálculo activa o la abre por su ID
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Si corre como standalone script
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Endpoint GET: Lee la pestaña 'Catálogo' (columnas A:G)
 * Devuelve un JSON con la lista de tratamientos, área, precio y modalidad de cobro.
 */
function doGet(e) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(TAB_CATALOGO);

    if (!sheet) {
      return createJsonResponse({
        success: false,
        error: 'No se encontró la pestaña ' + TAB_CATALOGO
      });
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({
        success: true,
        count: 0,
        tratamientos: []
      });
    }

    // Leemos columnas A:G (1 a 7)
    // A: Tratamiento | B: Área | C: Precio | D: Días volver | E: Sin fecha | F: Profesional | G: Modalidad
    const values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const tratamientos = [];

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const nombreTratamiento = (row[0] || '').toString().trim();

      if (nombreTratamiento) {
        let precioNum = parsePrice(row[2]);

        tratamientos.push({
          tratamiento: nombreTratamiento,
          area: (row[1] || 'Facial').toString().trim(),
          precio: precioNum,
          dias_volver: row[3] || 30,
          sin_fecha: row[4] || '',
          profesional: (row[5] || 'Joslin Mendoza').toString().trim(),
          modalidad: (row[6] || 'Por sesión').toString().trim()
        });
      }
    }

    return createJsonResponse({
      success: true,
      count: tratamientos.length,
      tratamientos: tratamientos
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: 'Error al consultar catálogo: ' + error.toString()
    });
  }
}

/**
 * Endpoint POST: Procesa 'register_client' y 'book_appointment'
 * Compatible con peticiones fetch enviadas como text/plain para evitar preflight CORS.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: 'Cuerpo de la solicitud vacío.'
      });
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        error: 'JSON inválido en el cuerpo: ' + parseErr.message
      });
    }

    const action = payload.action;
    const ss = getSpreadsheet();

    if (action === 'register_client') {
      return handleRegisterClient(ss, payload);
    } else if (action === 'book_appointment') {
      return handleBookAppointment(ss, payload);
    } else if (action === 'request_gift_card') {
      return handleRequestGiftCard(ss, payload);
    } else {
      return createJsonResponse({
        success: false,
        error: 'Acción no permitida o no especificada: ' + action
      });
    }
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: 'Error en el servidor de Apps Script: ' + err.toString()
    });
  }
}

/**
 * 1. REGISTRO DE CLIENTES
 * - Verifica en 'Clientes' (col C) si el correo ya existe.
 * - Si no existe, inserta una nueva fila llenando SOLO A:D (Nombre, Teléfono, Correo, Fecha de registro)
 *   sin tocar ni sobreescribir las columnas E:J con fórmulas.
 * - Envía un correo de bienvenida profesional usando MailApp.sendEmail con enlace a beacons.ai/esteticajos.
 */
function handleRegisterClient(ss, data) {
  const nombre = (data.nombre || data.fullName || '').toString().trim();
  const telefono = (data.telefono || data.phone || '').toString().trim();
  const correo = (data.correo || data.email || '').toString().trim().toLowerCase();

  if (!nombre || !correo) {
    return createJsonResponse({
      success: false,
      error: 'El nombre y el correo electrónico son obligatorios.'
    });
  }

  const clientesSheet = ss.getSheetByName(TAB_CLIENTES);
  if (!clientesSheet) {
    return createJsonResponse({
      success: false,
      error: 'No se encontró la pestaña ' + TAB_CLIENTES
    });
  }

  const lastRow = clientesSheet.getLastRow();

  // Verificar si el correo ya existe en Columna C (índice 3)
  if (lastRow > 1) {
    const existingEmails = clientesSheet.getRange(2, 3, lastRow - 1, 1).getValues();
    for (let i = 0; i < existingEmails.length; i++) {
      const emailInSheet = (existingEmails[i][0] || '').toString().trim().toLowerCase();
      if (emailInSheet && emailInSheet === correo) {
        return createJsonResponse({
          success: false,
          alreadyExists: true,
          error: 'Este correo electrónico ya se encuentra registrado en nuestra base de datos.'
        });
      }
    }
  }

  // Fecha de registro en formato dd/MM/yyyy con zona horaria America/Caracas
  const fechaRegistro = Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy');
  const targetRow = lastRow + 1;

  // Insertar SOLO en las columnas A (1), B (2), C (3) y D (4)
  // Las columnas E:J quedan totalmente intactas para que sus fórmulas continúen operando
  clientesSheet.getRange(targetRow, 1, 1, 4).setValues([[
    nombre,
    telefono,
    correo,
    fechaRegistro
  ]]);

  // Enviar correo de bienvenida amigable y profesional
  try {
    enviarCorreoBienvenida(nombre, correo);
  } catch (emailErr) {
    console.warn('No se pudo enviar el correo de bienvenida: ' + emailErr.message);
  }

  return createJsonResponse({
    success: true,
    message: '¡Cliente registrado con éxito!',
    data: {
      nombre: nombre,
      telefono: telefono,
      correo: correo,
      fechaRegistro: fechaRegistro,
      row: targetRow
    }
  });
}

/**
 * 2. RESERVA DE CITAS
 * - Recibe: { fecha, hora, cliente, tratamiento, profesional, cantidad, forma_pago, notas, correo }
 * - Busca el precio unitario en 'Catálogo'.
 * - Agrega una fila en 'Citas y Cobros' con Estado (col M) = "Agendada".
 * - Deja vacías las columnas P (Google Calendar), Q (Recordatorio 1) y R (Recordatorio 2)
 *   para la automatización de sincronización.
 */
function handleBookAppointment(ss, data) {
  const fechaInput = (data.fecha || '').toString().trim();
  const hora = (data.hora || '10:00 AM').toString().trim();
  const cliente = (data.cliente || data.clientName || '').toString().trim();
  const tratamiento = (data.tratamiento || data.serviceName || '').toString().trim();
  const profesional = (data.profesional || data.professionalName || 'Joslin Mendoza').toString().trim();
  const cantidad = data.cantidad ? Math.max(1, parseInt(data.cantidad, 10)) : 1;
  const formaPagoRaw = (data.forma_pago || data.paymentMethod || 'PAGO MÓVIL').toString().trim();
  const formaPago = normalizePaymentMethod(formaPagoRaw);
  const notas = (data.notas || data.notes || 'Agendado vía PWA').toString().trim();
  const correo = (data.correo || data.clientEmail || '').toString().trim().toLowerCase();

  if (!cliente || !tratamiento) {
    return createJsonResponse({
      success: false,
      error: 'El nombre del cliente y el tratamiento son obligatorios.'
    });
  }

  // Formatear la fecha al formato estándar dd/MM/yyyy
  const fechaFormateada = formatToCaracasDate(fechaInput);

  // Buscar precio unitario en la pestaña 'Catálogo'
  let precioUnitario = 0;
  const catalogoSheet = ss.getSheetByName(TAB_CATALOGO);

  if (catalogoSheet) {
    const lastRowCat = catalogoSheet.getLastRow();
    if (lastRowCat > 1) {
      // Leemos A (Tratamiento) y C (Precio)
      const catData = catalogoSheet.getRange(2, 1, lastRowCat - 1, 3).getValues();
      const searchClean = tratamiento.toLowerCase();

      for (let i = 0; i < catData.length; i++) {
        const itemTratamiento = (catData[i][0] || '').toString().trim().toLowerCase();
        if (itemTratamiento && (itemTratamiento === searchClean || searchClean.includes(itemTratamiento))) {
          precioUnitario = parsePrice(catData[i][2]);
          break;
        }
      }
    }
  }

  // Si no se encontró en catálogo pero vino en el payload
  if (precioUnitario === 0 && data.precio) {
    precioUnitario = parsePrice(data.precio);
  }

  const descuento = 0;
  const porcentajePro = 0;
  const total = precioUnitario * cantidad;
  const ingresoEstetica = total;

  const citasSheet = ss.getSheetByName(TAB_CITAS);
  if (!citasSheet) {
    return createJsonResponse({
      success: false,
      error: 'No se encontró la pestaña ' + TAB_CITAS
    });
  }

  const nextRow = citasSheet.getLastRow() + 1;

  /**
   * Mapeo de columnas de 'Citas y Cobros' (A hasta R, 18 columnas):
   * Col A (1): Fecha (dd/MM/yyyy)
   * Col B (2): Hora
   * Col C (3): Cliente
   * Col D (4): Tratamiento
   * Col E (5): Profesional
   * Col F (6): Cantidad
   * Col G (7): Precio unitario
   * Col H (8): Descuento (0)
   * Col I (9): % Profesional (0)
   * Col J (10): Total
   * Col K (11): Ingreso estética
   * Col L (12): Forma de pago
   * Col M (13): Estado de la cita ("Agendada")
   * Col N (14): Notas
   * Col O (15): Correo
   * Col P (16): Google Calendar (VACÍA "" para que el bot la procese)
   * Col Q (17): Recordatorio 1 (VACÍA "" para la automatización)
   * Col R (18): Recordatorio 2 (VACÍA "" para la automatización)
   */
  const rowValues = [
    fechaFormateada,
    hora,
    cliente,
    tratamiento,
    profesional,
    cantidad,
    precioUnitario,
    descuento,
    porcentajePro,
    total,
    ingresoEstetica,
    formaPago,
    'Agendada',
    notas,
    correo,
    '',
    '',
    ''
  ];

  // Insertar la fila completa garantizando que P, Q y R queden vacías
  citasSheet.getRange(nextRow, 1, 1, 18).setValues([rowValues]);

  return createJsonResponse({
    success: true,
    message: 'Cita agendada con éxito con estado Agendada.',
    data: {
      row: nextRow,
      fecha: fechaFormateada,
      hora: hora,
      cliente: cliente,
      tratamiento: tratamiento,
      profesional: profesional,
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      total: total,
      formaPago: formaPago,
      estado: 'Agendada'
    }
  });
}

/**
 * Envío de Correo de Bienvenida a Estética Jos
 */
function enviarCorreoBienvenida(nombre, correo) {
  const primerNombre = nombre.split(' ')[0] || 'Estimada paciente';
  const urlBeacons = 'https://beacons.ai/esteticajos';

  const plainText = 
    'Hola ' + primerNombre + ',\n\n' +
    '¡Bienvenida a Estética Jos! Nos llena de alegría recibirte en nuestro espacio dedicado al bienestar, salud y belleza en Mérida, Venezuela.\n\n' +
    'Tu ficha de paciente ha sido registrada con éxito en nuestro sistema. A partir de ahora podrás agendar tus citas con mayor facilidad y acceder a promociones exclusivas para el cuidado de tu piel y cuerpo.\n\n' +
    'Conoce todos nuestros tratamientos, ubicación en CC Naranjo y enlaces oficiales aquí:\n' +
    urlBeacons + '\n\n' +
    'Sede: Centro Comercial Naranjo, Urb. La Mata, Piso 2, Mérida.\n' +
    'WhatsApp de Atención Directa: +58 414-7518902\n\n' +
    'Con cariño,\n' +
    'Equipo de Estética Jos ✨';

  const htmlBody = 
    '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background-color: #fdfafc; border-radius: 16px; overflow: hidden; border: 1px solid #ebdfee;">' +
      '<div style="background: linear-gradient(135deg, #81638b 0%, #684b72 100%); padding: 36px 24px; text-align: center; color: #ffffff;">' +
        '<h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">ESTÉTICA Jos</h1>' +
        '<p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Medicina Estética & Spa · Mérida</p>' +
      '</div>' +
      '<div style="padding: 28px 24px; color: #2d2630; line-height: 1.6; font-size: 15px;">' +
        '<p style="font-size: 17px; font-weight: 600; color: #684b72; margin-top: 0;">¡Bienvenida a Estética Jos, ' + primerNombre + '! ✨</p>' +
        '<p>Nos llena de alegría recibirte en nuestro espacio dedicado al bienestar integral y la salud de tu piel en Mérida.</p>' +
        '<p>Tu ficha de paciente ha sido registrada de forma segura en nuestro sistema. Desde ahora podrás agendar tus tratamientos faciales y corporales de manera rápida y personalizada.</p>' +
        '<div style="text-align: center; margin: 30px 0;">' +
          '<a href="' + urlBeacons + '" style="background-color: #81638b; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 50px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(129,99,139,0.35);">Conoce Nuestros Enlaces y Servicios →</a>' +
        '</div>' +
        '<div style="background-color: #f7eff9; border-radius: 12px; padding: 16px 20px; font-size: 13.5px; color: #5a4960; margin-top: 24px;">' +
          '📍 <strong>Sede de Atención:</strong> Centro Comercial Naranjo, Urb. La Mata, Piso 2, Mérida.<br>' +
          '📱 <strong>WhatsApp Oficial:</strong> +58 414-7518902<br>' +
          '🌐 <strong>Portal Oficial:</strong> <a href="' + urlBeacons + '" style="color: #81638b; font-weight: 600;">' + urlBeacons + '</a>' +
        '</div>' +
      '</div>' +
      '<div style="background-color: #ebdfee; padding: 16px 24px; text-align: center; font-size: 12px; color: #7a6a80;">' +
        'Estética Jos · Dale bienestar a tu cuerpo, mente y alma.' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: correo,
    subject: 'Bienvenida a Estética Jos ✨',
    body: plainText,
    htmlBody: htmlBody
  });
}

/**
 * 3. SOLICITUD DE GIFT CARD (Pendiente de Pago)
 * - Registra la solicitud en la pestaña 'Gift Cards' (la crea si no existe)
 * - Columnas: Código | Fecha | De | Para | Tratamiento | Monto USD | Correo Entrega | Estado | Fecha Confirmación
 * - Estado inicial: "Pendiente"
 */
function handleRequestGiftCard(ss, data) {
  const codigo = (data.codigo || ('GIFT-' + Utilities.getUuid().substring(0, 6).toUpperCase())).toString().trim();
  const fecha = formatToCaracasDate(data.fecha);
  const de = (data.de || '').toString().trim();
  const para = (data.para || '').toString().trim();
  const tratamiento = (data.tratamiento || '').toString().trim();
  const precio = parsePrice(data.precio || data.monto);
  const correoEntrega = (data.correo_entrega || data.correo || '').toString().trim().toLowerCase();
  const estado = (data.estado || 'Pendiente').toString().trim();

  if (!de || !para || !tratamiento) {
    return createJsonResponse({
      success: false,
      error: 'Los campos De, Para y Tratamiento son obligatorios para la Gift Card.'
    });
  }

  let sheet = ss.getSheetByName(TAB_GIFT_CARDS);
  if (!sheet) {
    // Si la pestaña aún no existe, la creamos y colocamos los encabezados oficiales
    sheet = ss.insertSheet(TAB_GIFT_CARDS);
    const headers = [
      'Código',
      'Fecha Solicitud',
      'De (Comprador)',
      'Para (Beneficiario)',
      'Tratamiento',
      'Monto USD',
      'Correo Entrega',
      'Estado',
      'Fecha Confirmación'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#ebdfee');
    sheet.setFrozenRows(1);
  }

  const lastRow = sheet.getLastRow();
  const targetRow = lastRow + 1;

  const rowValues = [
    codigo,
    fecha,
    de,
    para,
    tratamiento,
    precio,
    correoEntrega,
    estado,
    '' // Fecha confirmación vacía hasta que el equipo valide el pago
  ];

  sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);

  return createJsonResponse({
    success: true,
    codigo: codigo,
    estado: estado,
    message: 'Solicitud de Gift Card registrada exitosamente con estado: ' + estado
  });
}

/**
 * Normaliza la forma de pago a las opciones permitidas por la validación de Google Sheets:
 * BINANCE, PAYPAL, PAGO MÓVIL, ZELLE, EFECTIVO, TARJETA, TRANSFERENCIA
 */
function normalizePaymentMethod(input) {
  if (!input) return 'PAGO MÓVIL';
  const upper = input.toString().toUpperCase().trim();
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
 * Convierte cualquier fecha de entrada a formato 'dd/MM/yyyy'
 */
function formatToCaracasDate(input) {
  if (!input) {
    return Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy');
  }

  const str = input.toString().trim();

  // Si ya viene en formato dd/MM/yyyy
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Si viene en formato YYYY-MM-DD (estándar HTML date input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const parts = str.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  try {
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return Utilities.formatDate(d, TIMEZONE, 'dd/MM/yyyy');
    }
  } catch (e) {}

  return str;
}

/**
 * Limpia y parsea cadenas de precio como "$25.00", "25", "25,00" a número
 */
function parsePrice(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;

  let str = val.toString().replace(/[^\d.,]/g, '');
  if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } else if (str.includes(',') && str.includes('.')) {
    str = str.replace(',', '');
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Crea una salida de texto con formato JSON y cabecera de tipo MIME JSON
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
