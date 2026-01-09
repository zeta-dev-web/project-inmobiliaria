import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [rentals, total] = await Promise.all([
      prisma.rental.findMany({
        skip,
        take: limit,
        include: {
          property: {
            select: {
              name: true,
              address: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          guarantors: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          pricePeriods: {
            orderBy: {
              startMonth: 'asc',
            },
          },
          payments: {
            select: {
              id: true,
              paymentDate: true,
              periodMonth: true,
            },
          },
          notifications: {
            select: {
              type: true,
              notified: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.rental.count(),
    ]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const rentalsWithWarnings = rentals.map(rental => {
      const warnings: { contractExpiring?: string; priceUpdate?: string } = {};
      
      const endDate = new Date(rental.endDate);
      const startDate = new Date(rental.startDate);
      
      const monthsUntilEnd = (endDate.getFullYear() - currentYear) * 12 + (endDate.getMonth() - currentMonth);
      
      if (monthsUntilEnd >= 0 && monthsUntilEnd <= 2) {
        const day = endDate.getUTCDate();
        const month = endDate.getUTCMonth();
        const year = endDate.getUTCFullYear();
        const localDate = new Date(year, month, day);
        warnings.contractExpiring = `El contrato vence el ${localDate.toLocaleDateString('es-AR')}`;
      }
      
      const monthsSinceStart = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth());
      const currentContractMonth = monthsSinceStart + 1;
      
      const nextPeriodWithoutPrice = rental.pricePeriods.find(p => 
        p.price === null && 
        p.startMonth > currentContractMonth && 
        p.startMonth <= currentContractMonth + 2
      );
      
      if (nextPeriodWithoutPrice) {
        const updateDate = new Date(startDate);
        updateDate.setMonth(startDate.getMonth() + nextPeriodWithoutPrice.startMonth - 1);
        const monthName = updateDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        warnings.priceUpdate = `Actualización de precio en ${monthName}`;
      } else {
        const nextPeriodWithPrice = rental.pricePeriods.find(p => 
          p.price !== null && 
          p.startMonth > currentContractMonth && 
          p.startMonth <= currentContractMonth + 2
        );
        
        if (nextPeriodWithPrice) {
          const updateDate = new Date(startDate);
          updateDate.setMonth(startDate.getMonth() + nextPeriodWithPrice.startMonth - 1);
          const monthName = updateDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
          warnings.priceUpdate = `Actualización de precio en ${monthName}`;
        }
      }
      
      return {
        ...rental,
        warnings: Object.keys(warnings).length > 0 ? warnings : undefined,
      };
    });

    return NextResponse.json({
      data: rentalsWithWarnings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json(
      { error: "Error al obtener los alquileres" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyId,
      tenantId,
      landlordId,
      guarantorIds,
      rentalPrice,
      updateFrequency,
      startDate,
      endDate,
      paymentDueDay,
      lateFee,
      administrationAmount,
      administrationType,
    } = body;

    const errors: Record<string, string> = {};

    if (!propertyId) errors.propertyId = "La propiedad es requerida";
    if (!tenantId) errors.tenantId = "El inquilino es requerido";
    if (!landlordId) errors.landlordId = "El propietario es requerido";
    if (!guarantorIds || guarantorIds.length === 0) errors.guarantorIds = "Al menos un garante es requerido";
    if (!rentalPrice || rentalPrice <= 0) errors.rentalPrice = "El precio debe ser mayor a 0";
    if (!updateFrequency || updateFrequency <= 0) errors.updateFrequency = "La frecuencia debe ser mayor a 0";
    if (!startDate) errors.startDate = "La fecha de inicio es requerida";
    if (!endDate) errors.endDate = "La fecha de vencimiento es requerida";
    if (!paymentDueDay || paymentDueDay < 1 || paymentDueDay > 31) errors.paymentDueDay = "El d\u00eda debe estar entre 1 y 31";
    if (lateFee === undefined || lateFee < 0) errors.lateFee = "La multa no puede ser negativa";
    if (!administrationAmount || administrationAmount <= 0) errors.administrationAmount = "El monto debe ser mayor a 0";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    
    // Generar períodos de precio
    const pricePeriods = [];
    let currentMonth = 1;
    
    while (currentMonth <= totalMonths) {
      const periodEnd = Math.min(currentMonth + updateFrequency - 1, totalMonths);
      pricePeriods.push({
        startMonth: currentMonth,
        endMonth: periodEnd,
        price: currentMonth === 1 ? rentalPrice : null, // Solo el primer período tiene precio inicial
      });
      currentMonth = periodEnd + 1;
    }

    const rental = await prisma.rental.create({
      data: {
        propertyId,
        tenantId,
        landlordId,
        rentalPrice,
        updateFrequency,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        paymentDueDay,
        lateFee,
        administrationAmount,
        administrationType,
        guarantors: {
          create: guarantorIds.map((clientId: string) => ({
            clientId,
          })),
        },
        pricePeriods: {
          create: pricePeriods,
        },
      },
      include: {
        property: true,
        tenant: true,
        landlord: true,
        guarantors: {
          include: {
            client: true,
          },
        },
      },
    });

    await prisma.property.update({
      where: { id: propertyId },
      data: { status: "RENTED" },
    });

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error("Error creating rental:", error);
    return NextResponse.json(
      { message: "Error al crear el alquiler" },
      { status: 500 }
    );
  }
}
