import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rentals = await prisma.rental.findMany({
      include: {
        notifications: true,
      },
    });

    let created = 0;

    for (const rental of rentals) {
      const endDate = new Date(rental.endDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
        const existingNotif = rental.notifications.find(
          (n) => n.type === 'CONTRACT_EXPIRING'
        );

        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              rentalId: rental.id,
              type: 'CONTRACT_EXPIRING',
              message: `El contrato vence el ${endDate.toLocaleDateString()}`,
              notified: false,
            },
          });
          created++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      created,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
