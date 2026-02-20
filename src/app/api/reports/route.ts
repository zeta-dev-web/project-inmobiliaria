import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(
    searchParams.get('year') || new Date().getFullYear().toString()
  );
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Total de propiedades
  const totalProperties = await prisma.property.count();

  // Total de alquileres activos
  const totalRentals = await prisma.rental.count();

  // Propiedades por estado
  const propertiesByStatus = await prisma.property.groupBy({
    by: ['status'],
    _count: true,
  });

  // Propiedades por tipo
  const propertiesByType = await prisma.property.groupBy({
    by: ['type'],
    _count: true,
  });

  // Total de clientes
  const totalClients = await prisma.client.count();

  // Pagos del año con comisiones
  const payments = await prisma.payment.findMany({
    where: {
      paymentDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    include: {
      rental: {
        select: {
          administrationAmount: true,
          administrationType: true,
          property: {
            select: { name: true },
          },
        },
      },
    },
  });

  // Calcular ingresos mensuales
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthPayments = payments.filter((p) => {
      const paymentMonth = new Date(p.paymentDate).getMonth() + 1;
      return paymentMonth === month;
    });

    const totalRent = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCommission = monthPayments.reduce((sum, p) => {
      const { administrationAmount, administrationType } = p.rental;
      return (
        sum +
        (administrationType === 'PERCENTAGE'
          ? p.amount * (administrationAmount / 100)
          : administrationAmount)
      );
    }, 0);

    return {
      month,
      totalRent,
      totalCommission,
    };
  });

  // Pagos pendientes de entrega
  const pendingDeliveries = await prisma.payment.count({
    where: { delivered: false },
  });

  const pendingDeliveriesAmount = await prisma.payment.aggregate({
    where: { delivered: false },
    _sum: { amount: true },
  });

  // Top propiedades por ingresos
  const propertyRevenue = payments.reduce(
    (acc, payment) => {
      const propertyName = payment.rental.property.name;
      if (!acc[propertyName]) {
        acc[propertyName] = 0;
      }
      acc[propertyName] += payment.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const topProperties = Object.entries(propertyRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, revenue]) => ({ name, revenue }));

  // Contratos próximos a vencer (3 meses)
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const expiringContracts = await prisma.rental.count({
    where: {
      endDate: {
        lte: threeMonthsFromNow,
        gte: new Date(),
      },
    },
  });

  return NextResponse.json({
    totalProperties,
    totalRentals,
    propertiesByStatus,
    propertiesByType,
    totalClients,
    monthlyRevenue,
    currentMonthRevenue: monthlyRevenue[currentMonth - 1] || {
      month: currentMonth,
      totalRent: 0,
      totalCommission: 0,
    },
    pendingDeliveries,
    pendingDeliveriesAmount: pendingDeliveriesAmount._sum.amount || 0,
    topProperties,
    expiringContracts,
  });
}
