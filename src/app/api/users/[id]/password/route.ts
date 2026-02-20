import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'argon2';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { password } = await request.json();

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 6 caracteres' },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password);
  const { id } = await params;

  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: 'Contraseña actualizada' });
}
