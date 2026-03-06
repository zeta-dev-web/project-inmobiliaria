import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unsubscribeEmail } from '@/services/email.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.emailSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Suscriptor eliminado exitosamente',
      subscriber: result,
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el suscriptor' },
      { status: 500 }
    );
  }
}
