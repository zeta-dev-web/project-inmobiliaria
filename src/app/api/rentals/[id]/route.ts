import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        property: true,
        tenants: {
          include: {
            client: true,
          },
        },
        landlord: true,
        guarantors: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Alquiler no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Error fetching rental:', error);
    return NextResponse.json(
      { error: 'Error al obtener el alquiler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      propertyId,
      tenantIds,
      landlordId,
      guarantorIds = [],
      rentalPrice,
      updateFrequency,
      startDate,
      endDate,
      paymentDueDay,
      lateFee,
      lateFeeType,
      administrationAmount,
      administrationType,
    } = body;

    const errors: Record<string, string> = {};

    if (!propertyId) errors.propertyId = 'La propiedad es requerida';
    if (!tenantIds || tenantIds.length === 0)
      errors.tenantIds = 'Al menos un inquilino es requerido';
    if (!landlordId) errors.landlordId = 'El propietario es requerido';
    // Guarantors are optional - removed validation
    if (!rentalPrice || rentalPrice <= 0)
      errors.rentalPrice = 'El precio debe ser mayor a 0';
    if (!updateFrequency || updateFrequency <= 0)
      errors.updateFrequency = 'La frecuencia debe ser mayor a 0';
    if (!startDate) errors.startDate = 'La fecha de inicio es requerida';
    if (!endDate) errors.endDate = 'La fecha de vencimiento es requerida';
    if (!paymentDueDay || paymentDueDay < 1 || paymentDueDay > 31)
      errors.paymentDueDay = 'El día debe estar entre 1 y 31';
    if (lateFee === undefined || lateFee < 0)
      errors.lateFee = 'La multa no puede ser negativa';
    if (!administrationAmount || administrationAmount <= 0)
      errors.administrationAmount = 'El monto debe ser mayor a 0';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Parse dates with timezone handling - use UTC to avoid timezone issues
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Handle timezone offset for dates
    const startDateUTC = new Date(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate()
    );
    const endDateUTC = new Date(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate()
    );
    
    const totalMonths =
      (endDateUTC.getFullYear() - startDateUTC.getFullYear()) * 12 +
      (endDateUTC.getMonth() - startDateUTC.getMonth()) +
      1;

    // Generar períodos de precio
    const pricePeriods = [];
    let currentMonth = 1;

    while (currentMonth <= totalMonths) {
      const periodEnd = Math.min(
        currentMonth + updateFrequency - 1,
        totalMonths
      );
      pricePeriods.push({
        startMonth: currentMonth,
        endMonth: periodEnd,
        price: currentMonth === 1 ? rentalPrice : null,
      });
      currentMonth = periodEnd + 1;
    }

    await prisma.rentalTenant.deleteMany({
      where: { rentalId: id },
    });

    await prisma.rentalGuarantor.deleteMany({
      where: { rentalId: id },
    });

    await prisma.pricePeriod.deleteMany({
      where: { rentalId: id },
    });

    await prisma.notification.deleteMany({
      where: { rentalId: id },
    });

    const rental = await prisma.rental.update({
      where: { id },
      data: {
        propertyId,
        landlordId,
        rentalPrice,
        updateFrequency,
        startDate: startDateUTC,
        endDate: endDateUTC,
        paymentDueDay,
        lateFee,
        lateFeeType: lateFeeType || 'PERCENTAGE',
        administrationAmount,
        administrationType: administrationType || 'PERCENTAGE',
        tenants: {
          create: tenantIds.map((clientId: string) => ({
            clientId,
          })),
        },
        guarantors: {
          create: (guarantorIds || []).map((clientId: string) => ({
            clientId,
          })),
        },
        pricePeriods: {
          create: pricePeriods,
        },
      },
      include: {
        property: true,
        tenants: {
          include: {
            client: true,
          },
        },
        landlord: true,
        guarantors: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json(
      { message: 'Error al actualizar el alquiler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const rental = await prisma.rental.findUnique({
      where: { id },
      select: { propertyId: true },
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Alquiler no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar pagos y sus items
    const payments = await prisma.payment.findMany({ where: { rentalId: id } });
    for (const payment of payments) {
      await prisma.paymentItem.deleteMany({ where: { paymentId: payment.id } });
    }
    await prisma.payment.deleteMany({ where: { rentalId: id } });

    // Eliminar relaciones
    await prisma.rentalTenant.deleteMany({ where: { rentalId: id } });
    await prisma.rentalGuarantor.deleteMany({ where: { rentalId: id } });
    await prisma.pricePeriod.deleteMany({ where: { rentalId: id } });
    await prisma.notification.deleteMany({ where: { rentalId: id } });

    // Eliminar alquiler
    await prisma.rental.delete({ where: { id } });

    // Actualizar propiedad
    await prisma.property.update({
      where: { id: rental.propertyId },
      data: { status: 'AVAILABLE' },
    });

    return NextResponse.json({ message: 'Alquiler eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting rental:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el alquiler' },
      { status: 500 }
    );
  }
}
