import { Resend } from 'resend';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NewPropertyEmailData {
  propertyName: string;
  propertyAddress: string;
  propertyPrice: number;
  propertyDescription?: string | null;
  propertyUrl: string;
  photoUrl?: string;
}

/**
 * Envía un email a un suscriptor sobre una nueva propiedad
 */
export async function sendNewPropertyEmail(
  to: string,
  name: string | null,
  property: NewPropertyEmailData
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Polar Inmobiliaria <administrador@polarinmobiliaria.com.ar>',
      to,
      subject: `🏠 Nueva Propiedad: ${property.propertyName}`,
      html: createNewPropertyEmailHTML(name, property),
    });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Envía emails a todos los suscriptores activos sobre una nueva propiedad
 */
export async function notifySubscribersOfNewProperty(
  property: NewPropertyEmailData
) {
  try {
    // Obtener todos los suscriptores activos
    const subscribers = await prisma.emailSubscriber.findMany({
      where: { active: true },
      select: { email: true, name: true, id: true },
    });

    if (subscribers.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    // Enviar emails en paralelo (con límite para no saturar)
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      // Verificar el estado actual de cada suscriptor antes de enviar
      const results = await Promise.all(
        batch.map(async (subscriber) => {
          // Verificación en tiempo real para evitar enviar a quien se desuscribió
          const currentStatus = await prisma.emailSubscriber.findUnique({
            where: { id: subscriber.id },
            select: { active: true },
          });
          
          if (!currentStatus?.active) {
            return false; // No enviar si se desuscribió
          }
          
          const sent = await sendNewPropertyEmail(
            subscriber.email,
            subscriber.name,
            property
          );
          return sent;
        })
      );
      success += results.filter((r) => r).length;
      failed += results.filter((r) => !r).length;

      // Pequeña pausa entre batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return { success, failed };
  } catch (error) {
    return { success: 0, failed: 0 };
  }
}

/**
 * Crea el HTML del email para nueva propiedad
 */
function createNewPropertyEmailHTML(
  name: string | null,
  property: NewPropertyEmailData
) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Propiedad - Polar Inmobiliaria</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #600096 0%, #8b00d4 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🏠 ¡Nueva Propiedad Disponible!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Polar Inmobiliaria</p>
            </td>
          </tr>
          
          <!-- Imagen de la propiedad (si existe) -->
          ${property.photoUrl ? `
          <tr>
            <td style="padding: 0;">
              <img src="${property.photoUrl}" alt="${property.propertyName}" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 40px 30px;">
              ${name ? `<p style="margin: 0 0 20px 0; color: #333333; font-size: 18px;">Hola ${name},</p>` : ''}
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Tenemos una nueva propiedad que podría interesarte. ¡Sé el primero en conocerla!
              </p>
              
              <!-- Tarjeta de propiedad -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin: 25px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 15px 0; color: #600096; font-size: 22px; font-weight: 600;">${property.propertyName}</h2>
                    
                    <p style="margin: 0 0 15px 0; color: #666666; font-size: 15px; display: flex; align-items: center;">
                      <span style="margin-right: 8px;">📍</span> ${property.propertyAddress}
                    </p>
                    
                    <p style="margin: 0 0 15px 0; color: #600096; font-size: 28px; font-weight: 700;">
                      $${property.propertyPrice.toLocaleString('es-AR')}
                    </p>
                    
                    ${property.propertyDescription ? `
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      ${property.propertyDescription}
                    </p>
                    ` : ''}
                    
                    <!-- Botón CTA -->
                    <table role="presentation" style="margin: 25px 0;">
                      <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #600096 0%, #8b00d4 100%);">
                          <a href="${property.propertyUrl}" 
                             style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                            Ver Propiedad →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                ¿Te interesa esta propiedad? No dudes en contactarnos para más información o para agendar una visita.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                Este email fue enviado porque te registraste para recibir novedades de Polar Inmobiliaria.
              </p>
              <p style="margin: 0 0 20px 0; color: #999999; font-size: 12px;">
                Si ya no deseas recibir estos emails, puedes
                <a href="https://polarinmobiliaria.com.ar/unsubscribe?email=${encodeURIComponent(property.propertyUrl)}"
                   style="color: #600096; text-decoration: underline;">
                   darte de baja aquí
                </a>.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2024 Polar Inmobiliaria. Todos los derechos reservados.
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

/**
 * Suscribe un email a la lista de notificaciones
 */
export async function subscribeEmail(email: string, name?: string) {
  try {
    const subscriber = await prisma.emailSubscriber.upsert({
      where: { email },
      update: {
        active: true,
        unsubscribedAt: null,
        name: name || undefined,
      },
      create: {
        email,
        name: name || undefined,
        active: true,
      },
    });

    return { success: true, subscriber };
  } catch (error) {
    console.error('Error subscribing email:', error);
    return { success: false, error: 'Error al suscribir el email' };
  }
}

/**
 * Da de baja un email de la lista de notificaciones
 */
export async function unsubscribeEmail(email: string) {
  try {
    const subscriber = await prisma.emailSubscriber.updateMany({
      where: { email },
      data: {
        active: false,
        unsubscribedAt: new Date(),
      },
    });

    return { success: true, count: subscriber.count };
  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return { success: false, error: 'Error al dar de baja el email' };
  }
}
