import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [properties, clients, rentals, payments] = await Promise.all([
      prisma.property.count(),
      prisma.client.count(),
      prisma.rental.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
      }),
    ]);

    return NextResponse.json({
      properties,
      clients,
      rentals,
      totalRevenue: payments._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}