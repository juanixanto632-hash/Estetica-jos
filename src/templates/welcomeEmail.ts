export interface WelcomeEmailData {
  fullName: string;
  email: string;
  phone?: string;
}

export function generateWelcomeEmailHtml(data: WelcomeEmailData): string {
  const firstName = data.fullName.split(' ')[0] || 'Estimada/o cliente';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenida a Estética Jos</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fcf8fc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2b1832;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fcf8fc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(129, 99, 139, 0.12); border: 1px solid #dac9df;">
          
          <!-- Encabezado con degradado de marca -->
          <tr>
            <td style="background: linear-gradient(135deg, #81638b 0%, #b695c0 100%); padding: 36px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">
                Estética Jos
              </h1>
              <p style="color: #fbd5e5; margin: 6px 0 0; font-size: 13px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
                Medicina Estética & Armonización Facial · Mérida
              </p>
            </td>
          </tr>

          <!-- Cuerpo del correo -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="color: #81638b; font-size: 20px; font-weight: 700; margin: 0 0 16px; line-height: 1.3;">
                ¡Hola, ${firstName}! ✨
              </h2>
              
              <p style="font-size: 15px; line-height: 1.6; color: #5e4767; margin: 0 0 20px;">
                Te damos una cálida bienvenida a <strong>Estética Jos</strong>. Tu ficha de paciente ha sido registrada con éxito en nuestra plataforma.
              </p>

              <p style="font-size: 15px; line-height: 1.6; color: #5e4767; margin: 0 0 25px;">
                Nuestro equipo médico y cosmiátrico está listo para brindarte una atención personalizada, cuidando de tu belleza con protocolos clínicos avanzados y la calidez que mereces.
              </p>

              <!-- Tarjeta de Beneficios y Servicios -->
              <table role="presentation" width="100%" style="background-color: #fbf6fc; border-radius: 14px; border: 1px solid #dac9df; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 20px;">
                    <strong style="color: #81638b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 12px;">
                      Nuestros Tratamientos Destacados:
                    </strong>
                    <ul style="margin: 0; padding-left: 20px; color: #5e4767; font-size: 14px; line-height: 1.7;">
                      <li><strong>Armonización Facial:</strong> PDRN, Pink Glow, Botox Full Face, Baby Botox, PRP y Limpieza Profunda.</li>
                      <li><strong>Bienestar Corporal:</strong> Drenaje linfático post-operatorio, masajes relajantes y terapias detox.</li>
                      <li><strong>Atención Médica 1 a 1:</strong> Diagnóstico previo e insumos certificados.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Botones de Acción -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/+584147518902?text=Hola%20Est%C3%A9tica%20Jos,%20me%20acabo%20de%20registrar%20y%20quiero%20agendar%20mi%20primera%20cita." target="_blank" style="display: inline-block; background-color: #81638b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(129, 99, 139, 0.35);">
                      Agendar mi Cita por WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Información de la Sede -->
              <table role="presentation" width="100%" style="border-top: 1px solid #dac9df; padding-top: 20px;">
                <tr>
                  <td style="color: #7b6285; font-size: 13px; line-height: 1.5;">
                    <strong style="color: #81638b; display: block; margin-bottom: 4px;">Sede Mérida:</strong>
                    Urbanización La Mata, Centro Comercial Naranjo, Piso 2, Local 22.<br>
                    Mérida 5101, Venezuela.<br>
                    <strong>WhatsApp Oficial:</strong> +58 414-7518902
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Pie del Correo con Redes Sociales -->
          <tr>
            <td style="background-color: #fbf6fc; padding: 22px 30px; text-align: center; border-top: 1px solid #dac9df;">
              <p style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #81638b;">
                Síguenos en nuestras redes:
              </p>
              <p style="margin: 0 0 15px; font-size: 13px;">
                <a href="https://www.instagram.com/estetica_jos?dlrf=MTdyZnI2b25zbzlsYg%3D%3D&utm_source=qr" target="_blank" style="color: #cc83bb; text-decoration: none; font-weight: 700; margin: 0 8px;">Instagram (@estetica_jos)</a>
                ·
                <a href="https://www.tiktok.com/@esteticajos?_r=1&_t=ZS-9BT6SjltaWj" target="_blank" style="color: #81638b; text-decoration: none; font-weight: 700; margin: 0 8px;">TikTok (@esteticajos)</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #7b6285;">
                © 2026 Estética Jos. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
