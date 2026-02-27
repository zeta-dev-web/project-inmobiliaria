import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { name } = await request.json();

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    return NextResponse.json({ message: 'Nombre actualizado' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar nombre' }, { status: 500 });
  }
}
