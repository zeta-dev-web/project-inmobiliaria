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

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'El ID de la propiedad es requerido' },
        { status: 400 }
      );
    }

    // Obtener la propiedad
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        photos: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
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

    const result = await notifySubscribersOfNewProperty({
      propertyName: property.name,
      propertyAddress: property.address,
      propertyPrice: property.price,
      propertyDescription: property.description,
      propertyUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/property/${property.id}`,
      photoUrl: undefined,
    });

    return NextResponse.json({
      message: 'Emails enviados exitosamente',
      success: result.success,
      failed: result.failed,
      subscribersCount: subscribers.length,
    });
  } catch (error) {
    console.error('Error sending property emails:', error);
    return NextResponse.json(
      { error: 'Error al enviar emails' },
      { status: 500 }
    );
  }
}
