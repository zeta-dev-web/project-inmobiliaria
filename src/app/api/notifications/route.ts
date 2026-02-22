import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { notified: false },
    include: {
      rental: {
        include: {
          property: { select: { name: true } },
          tenants: {
            include: {
              client: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notifications);
}
