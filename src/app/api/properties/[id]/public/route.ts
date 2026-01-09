import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findFirst({
      where: {
        id,
        published: true,
        status: 'AVAILABLE',
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        photos: true,
        documents: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no disponible' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}