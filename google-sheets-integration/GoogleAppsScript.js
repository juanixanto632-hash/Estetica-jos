/**
 * ============================================================================
 * SISTEMA DE GESTIÓN - ESTÉTICA JOS
 * Script de Sincronización Automática con PWA (Google Apps Script)
 * ============================================================================
 * 
 * INSTRUCCIONES RÁPIDAS DE INSTALACIÓN:
 * 1. Abre tu hoja de Google Sheets ("Sistema de Gestión - Estética Jos").
 * 2. En el menú superior haz clic en: Extensiones -> Apps Script.
 * 3. Borra cualquier código existente en el editor y pega TODO este archivo.
 * 4. Haz clic en el icono de disco "Guardar" (o Ctrl + S).
 * 5. Haz clic en el botón azul superior "Implementar" (Deploy) -> "Nueva implementación".
 * 6. En el engranaje "Seleccionar tipo", elige: "Aplicación web".
 * 7. Configura los siguientes campos:
 *    - Descripción: "API PWA Estética Jos"
 *    - Ejecutar como: "Yo" (tu cuenta de correo de Google)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)  <--- ¡MUY IMPORTANTE!
 * 8. Haz clic en "Implementar".
 * 9. Concede los permisos de lectura/escritura cuando Google te lo solicite.
 * 10. Copia la "URL de la aplicación web" (termina en /exec) y pégala en tu proyecto.
 * ============================================================================
 */

// Nombres de las pestañas en tu Google Sheet
const TAB_CITAS = 'Citas y Cobros';
const TAB_CLIENTES = 'Clientes';
const TAB_CATALOGO = 'Catálogo';

/**
 * Función para probar que el script funciona desde el navegador (GET)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : null;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Si se solicita el catálogo vía GET
    if (action === 'get_catalog' || action === 'catalogo') {
      const sheetCat = getOrCreateSheet(ss, TAB_CATALOGO, [
        'Tratamiento', 'Área', 'Precio', 'Días volver', 'Sin fecha', 'Profesional', 'Modalidad'
      ]);
      const data = sheetCat.getDataRange().getValues();
      const headers = data[0];
      const services = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0]) {
          services.push({
            name: row[0],
            area: row[1] || 'Facial',
            price: row[2] || 0,
            returnDays: row[3] || 30,
            professional: row[5] || 'Joslin Mendoza'
          });
        }
      }

      return jsonResponse({
        success: true,
        count: services.length,
        services: services
      });
    }

    // Health check predeterminado
    return jsonResponse({
      status: 'ok',
      message: 'API de Estética Jos activa y lista para recibir citas.',
      timestamp: new Date().toISOString(),
      sheetsFound: {
        citas: !!ss.getSheetByName(TAB_CITAS),
        clientes: !!ss.getSheetByName(TAB_CLIENTES),
        catalogo: !!ss.getSheetByName(TAB_CATALOGO)
      }
    });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Función receptora de datos desde la PWA (POST)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'No se recibieron datos en la solicitud.' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || 'create_appointment';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'create_appointment') {
      return handleCreateAppointment(ss, payload);
    } else if (action === 'register_client') {
      return handleRegisterClient(ss, payload);
    } else {
      return jsonResponse({ success: false, error: 'Acción no reconocida: ' + action });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Error interno en Google Apps Script: ' + error.toString()
    });
  }
}

/**
 * 1. Registra una cita en "Citas y Cobros" y actualiza/crea al paciente en "Clientes"
 */
function handleCreateAppointment(ss, data) {
  // Pestaña "Citas y Cobros"
  const sheetCitas = getOrCreateSheet(ss, TAB_CITAS, [
    'Fecha', 'Hora', 'Cliente', 'Tratamiento', 'Profesional', 'Cantidad',
    'Precio', 'Descuento', 'Porcentaje', 'Total', 'Ingreso',
    'Forma de pago', 'Estado cita', 'Notas', 'Correo'
  ]);

  // Formato de fecha legible (DD/MM/YYYY)
  const formattedDate = formatDate(data.date);
  const price = typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0;
  const clientName = (data.clientName || '').trim();
  const clientPhone = (data.clientPhone || '').trim();
  const clientEmail = (data.clientEmail || '').trim().toLowerCase();
  const serviceName = (data.serviceName || 'Tratamiento Estética Jos').trim();
  const professional = (data.professionalName || 'Joslin Mendoza').trim();
  const timeSlot = (data.time || '10:00 AM').trim();
  const paymentMethod = (data.paymentMethod || 'Pago Móvil (BCV)').trim();
  const notes = (data.notes || 'Agendado vía PWA').trim();

  // Fila exacta según el mapeo de "Citas y Cobros":
  // Col A: Fecha
  // Col B: Hora
  // Col C: Cliente
  // Col D: Tratamiento
  // Col E: Profesional
  // Col F: Cantidad (1)
  // Col G: Precio
  // Col H: Descuento (0)
  // Col I: % profesional (0)
  // Col J: Total
  // Col K: Ingreso
  // Col L: Forma de pago
  // Col M: Estado cita (SIEMPRE "Pendiente")
  // Col N: Notas
  // Col O: Correo
  const rowCita = [
    formattedDate,       // A: Fecha
    timeSlot,            // B: Hora
    clientName,          // C: Cliente
    serviceName,         // D: Tratamiento
    professional,        // E: Profesional
    1,                   // F: Cantidad
    price,               // G: Precio
    0,                   // H: Descuento
    0,                   // I: % Profesional
    price,               // J: Total
    price,               // K: Ingreso
    paymentMethod,       // L: Forma de pago
    'Pendiente',         // M: Estado cita
    notes,               // N: Notas
    clientEmail          // O: Correo
  ];

  sheetCitas.appendRow(rowCita);

  // Sincronizar simultáneamente con la pestaña "Clientes"
  syncPatient(ss, {
    fullName: clientName,
    phone: clientPhone,
    email: clientEmail,
    date: formattedDate,
    serviceName: serviceName,
    status: 'Cita Pendiente'
  });

  return jsonResponse({
    success: true,
    message: 'Cita registrada con éxito en Google Sheets con estado Pendiente.',
    appointment: {
      date: formattedDate,
      time: timeSlot,
      clientName: clientName,
      serviceName: serviceName,
      total: price,
      status: 'Pendiente'
    }
  });
}

/**
 * 2. Registra un nuevo paciente desde la pantalla de Registro en "Clientes"
 */
function handleRegisterClient(ss, data) {
  const fullName = (data.fullName || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const interest = (data.interest || 'facial').trim();
  const notes = (data.notes || '').trim();

  const syncResult = syncPatient(ss, {
    fullName: fullName,
    phone: phone,
    email: email,
    serviceName: interest.toUpperCase(),
    status: 'Registrado PWA',
    notes: notes
  });

  return jsonResponse({
    success: true,
    message: 'Paciente registrado exitosamente en la pestaña Clientes.',
    client: {
      fullName: fullName,
      phone: phone,
      email: email,
      isNew: syncResult.isNew
    }
  });
}

/**
 * Sincroniza o actualiza a un paciente en la pestaña "Clientes"
 * Estructura de Clientes:
 * Col A: Nombre
 * Col B: Teléfono
 * Col C: Correo
 * Col D: Fecha registro
 * Col E: Última visita
 * Col F: Días sin venir
 * Col G: Próxima visita
 * Col H: Estado
 * Col I: Último tratamiento
 * Col J: Aviso retorno
 */
function syncPatient(ss, patientData) {
  const sheetClientes = getOrCreateSheet(ss, TAB_CLIENTES, [
    'Nombre', 'Teléfono', 'Correo', 'Fecha registro', 'Última visita',
    'Días sin venir', 'Próxima visita', 'Estado', 'Último tratamiento', 'Aviso retorno'
  ]);

  const today = Utilities.formatDate(new Date(), 'America/Caracas', 'dd/MM/yyyy');
  const values = sheetClientes.getDataRange().getValues();
  const cleanPhoneInput = cleanPhone(patientData.phone);
  let foundRowIndex = -1;

  // Buscar si el cliente ya existe por teléfono o correo
  for (let i = 1; i < values.length; i++) {
    const rowPhone = cleanPhone(values[i][1]);
    const rowEmail = (values[i][2] || '').toString().toLowerCase().trim();

    const phoneMatch = cleanPhoneInput && rowPhone && rowPhone.endsWith(cleanPhoneInput.slice(-8));
    const emailMatch = patientData.email && rowEmail && rowEmail === patientData.email;

    if (phoneMatch || emailMatch) {
      foundRowIndex = i + 1; // Fila en base 1 para Google Sheets
      break;
    }
  }

  if (foundRowIndex > 0) {
    // Cliente existente: actualizar próxima visita y último tratamiento
    if (patientData.date) {
      sheetClientes.getRange(foundRowIndex, 7).setValue(patientData.date); // Col G: Próxima visita
    }
    if (patientData.status) {
      sheetClientes.getRange(foundRowIndex, 8).setValue(patientData.status); // Col H: Estado
    }
    if (patientData.serviceName) {
      sheetClientes.getRange(foundRowIndex, 9).setValue(patientData.serviceName); // Col I: Último tratamiento
    }
    if (patientData.email) {
      const currentEmail = sheetClientes.getRange(foundRowIndex, 3).getValue();
      if (!currentEmail) {
        sheetClientes.getRange(foundRowIndex, 3).setValue(patientData.email); // Col C: Correo
      }
    }
    return { isNew: false, rowIndex: foundRowIndex };
  } else {
    // Cliente nuevo: buscar la primera fila vacía basándose ÚNICAMENTE en la columna A
    const colAValues = sheetClientes.getRange('A:A').getValues();
    let targetRow = -1;
    for (let i = 1; i < colAValues.length; i++) {
      const val = colAValues[i][0];
      if (val === '' || val === null || val === undefined) {
        targetRow = i + 1;
        break;
      }
    }
    if (targetRow === -1) {
      targetRow = colAValues.length + 1;
    }

    // Orden exacto de columnas para Estética Jos:
    // [Nombre, Teléfono, Correo, Fecha de registro (DD/MM/YYYY), "", "", "", "Sin visitas aún"]
    const newRow = [
      patientData.fullName,
      patientData.phone,
      patientData.email || '',
      today,
      '',
      '',
      '',
      'Sin visitas aún'
    ];
    sheetClientes.getRange(targetRow, 1, 1, 8).setValues([newRow]);
    return { isNew: true, rowIndex: targetRow };
  }
}

/**
 * Función auxiliar: Obtiene una hoja por nombre o la crea si no existe
 */
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sheet;
}

/**
 * Normaliza fechas tipo "2026-11-21" a "21/11/2026"
 */
function formatDate(input) {
  if (!input) {
    return Utilities.formatDate(new Date(), 'America/Caracas', 'dd/MM/yyyy');
  }
  if (typeof input === 'string' && input.includes('-')) {
    const parts = input.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
  }
  return input.toString();
}

/**
 * Limpia números telefónicos para comparación segura
 */
function cleanPhone(phone) {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '');
}

/**
 * Respuesta JSON con cabeceras CORS
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
