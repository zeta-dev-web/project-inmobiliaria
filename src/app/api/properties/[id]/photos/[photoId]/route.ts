import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const { id, photoId } = params;

    await prisma.propertyPhoto.delete({
      where: { 
        id: photoId,
        propertyId: id 
      },
    });

    return NextResponse.json({ message: 'Foto eliminada exitosamente' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}