# 📋 Guía Rápida: Conectar Google Sheets con Estética Jos

Esta integración permite que **cada vez que una paciente agende una cita o se registre en la PWA**, los datos se guarden automáticamente en tu hoja de cálculo:
- En la pestaña **`Citas y Cobros`** (con estado **"Pendiente"** y todos los datos del tratamiento, monto y especialista).
- En la pestaña **`Clientes`** (guardando su nombre, WhatsApp, fecha de registro y última visita).

---

## 🚀 Pasos de Configuración (Solo toma 2 minutos)

### Paso 1: Abrir el editor de código en tu Google Sheet
1. Abre tu hoja de Google Sheets: [Sistema de Gestión - Estética Jos](https://docs.google.com/spreadsheets/d/1qK3hjk9BGgLH7rNkA4-2OMju6gTcoiTq7_ktww5hcrc/edit).
2. En el menú superior, haz clic en **Extensiones** ➔ **Apps Script**.
3. Se abrirá una nueva pestaña con un editor de código de Google.

---

### Paso 2: Pegar el código del script
1. Si ves algún código en pantalla como `function myFunction() { ... }`, **bórralo todo**.
2. Abre el archivo local [`GoogleAppsScript.js`](file:///c:/Users/JUAN%20RS/OneDrive/Escritorio/estetica-jos/google-sheets-integration/GoogleAppsScript.js), copia **todo su contenido** y pégalo en el editor de Google Apps Script.
3. Haz clic en el icono del **Disco (Guardar)** en la barra superior o presiona `Ctrl + S`.

---

### Paso 3: Publicar como Aplicación Web
1. En la esquina superior derecha, haz clic en el botón azul **Implementar** (Deploy) ➔ **Nueva implementación**.
2. En la ventana emergente, haz clic en el icono de **Engranaje (Seleccionar tipo)** al lado izquierdo y elige **Aplicación web**.
3. Llena los 3 campos de esta forma:
   - **Descripción:** `API PWA Estética Jos`
   - **Ejecutar como:** `Yo (tu correo de Google)`
   - **Quién tiene acceso:** `Cualquier persona` *(¡Muy importante para que la web app pueda enviar datos sin pedir login!)*
4. Haz clic en el botón **Implementar**.

---

### Paso 4: Autorizar Permisos de Google
1. Google te mostrará una ventana pidiendo autorización para que el script acceda a tu hoja de cálculo.
2. Haz clic en **Revisar permisos**.
3. Elige tu cuenta de Google.
4. Si ves un aviso de "Google no ha verificado esta app", haz clic en el enlace pequeño abajo que dice **Configuración avanzada** y luego en **Ir a API PWA Estética Jos (no seguro)**.
5. Haz clic en **Permitir**.

---

### Paso 5: Copiar la URL del Webhook
1. Al finalizar, Google te mostrará una pantalla que dice *"Implementación actualizada"* o *"Nueva implementación creada"*.
2. Copia la **URL de la aplicación web** (es un enlace largo que termina en `/exec`).
   - Ejemplo: `https://script.google.com/macros/s/AKfycbx.../exec`
3. Pega esa URL en tu archivo `.env` en la variable:
   ```env
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/TU_CODIGO_AQUI/exec
   VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/TU_CODIGO_AQUI/exec
   ```
4. ¡Listo! A partir de ese momento, cada cita y registro se escribirá automáticamente en tu Google Sheet.
