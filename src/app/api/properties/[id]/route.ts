import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        rentals: true,
        lastEditedBy: { select: { name: true } },
        client: true,
        photos: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { message: 'La propiedad no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Error al obtener la propiedad' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // Extraer solo los campos permitidos
    const {
      name,
      address,
      type,
      price,
      saleCommission,
      description,
      status,
      requirements,
      documentation,
      published,
    } = body;

    // Obtener la propiedad actual para comparar el estado published
    const currentProperty = await prisma.property.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!currentProperty) {
      return NextResponse.json(
        { message: 'La propiedad no existe' },
        { status: 404 }
      );
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        name,
        address,
        type,
        price,
        saleCommission,
        description,
        status,
        requirements,
        documentation,
        published,
        lastEditedBy: {
          connect: { id: parseInt(session.user.id) },
        },
      },
    });

    // Si la propiedad era privada y ahora se publica, enviar emails
    const wasPrivate = currentProperty.published === false;
    const isNowPublic = published === true;
    const isRent = type === 'RENT';

    // La notificación por email se hace manualmente desde la página de Ofertas

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la propiedad' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Eliminar relaciones primero
    await prisma.propertyPhoto.deleteMany({ where: { propertyId: id } });
    await prisma.propertyDocument.deleteMany({ where: { propertyId: id } });
    await prisma.offer.deleteMany({ where: { propertyId: id } });

    // Verificar si tiene alquileres activos
    const rentals = await prisma.rental.findMany({ where: { propertyId: id } });
    if (rentals.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una propiedad con alquileres activos' },
        { status: 400 }
      );
    }

    // Eliminar propiedad
    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ message: 'Propiedad eliminada con éxito' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la propiedad' },
      { status: 500 }
    );
  }
}
