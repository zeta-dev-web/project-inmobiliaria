import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notifySubscribersOfNewProperty } from '@/services/email.service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todas las propiedades disponibles de alquiler
    const properties = await prisma.property.findMany({
      where: {
        type: 'RENT',
        status: 'AVAILABLE',
        published: true,
      },
      include: {
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (properties.length === 0) {
      return NextResponse.json({
        message: 'No hay propiedades de alquiler disponibles para enviar',
        success: 0,
        failed: 0,
      });
    }

    // Obtener todos los suscriptores activos
    const subscribers = await prisma.emailSubscriber.findMany({
      where: { active: true },
      select: { email: true, name: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({
        message: 'No hay suscriptores activos',
        success: 0,
        failed: 0,
      });
    }

    let totalSuccess = 0;
    let totalFailed = 0;

    // Enviar emails para cada propiedad
    for (const property of properties) {
      const result = await notifySubscribersOfNewProperty({
        propertyName: property.name,
        propertyAddress: property.address,
        propertyPrice: property.price,
        propertyDescription: property.description,
        propertyUrl: `https://polarinmobiliaria.com.ar/property/${property.id}`,
        photoUrl: undefined,
      });

      totalSuccess += result.success;
      totalFailed += result.failed;

      // Pausa entre propiedades para no saturar
      if (properties.indexOf(property) < properties.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return NextResponse.json({
      message: 'Emails masivos enviados exitosamente',
      success: totalSuccess,
      failed: totalFailed,
      propertiesCount: properties.length,
      subscribersCount: subscribers.length,
    });
  } catch (error) {
    console.error('Error sending massive emails:', error);
    return NextResponse.json(
      { error: 'Error al enviar emails masivos' },
      { status: 500 }
    );
  }
}
