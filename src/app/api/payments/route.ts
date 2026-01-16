import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTransactionHash } from '@/utils/hash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rentalId');

    const payments = await prisma.payment.findMany({
      where: rentalId ? { rentalId } : {},
      include: {
        rental: {
          include: {
            property: true,
            tenant: true,
            landlord: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los pagos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      rentalId,
      amount,
      paymentDate,
      periodMonth,
      notes,
      signedById,
      items,
    } = body;

    if (!rentalId || !amount || !paymentDate || !periodMonth || !signedById) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const timestamp = new Date().getTime();
    const hash = await generateTransactionHash({
      rentalId,
      amount: parseFloat(amount),
      paymentDate: new Date(paymentDate),
      signedById: parseInt(signedById),
    });

    const paymentDateObj = new Date(paymentDate);
    const year = paymentDateObj.getFullYear();
    const month = String(paymentDateObj.getMonth() + 1).padStart(2, '0');

    // Contar pagos del mismo año/mes de pago para generar secuencial
    const startOfMonth = new Date(year, paymentDateObj.getMonth(), 1);
    const endOfMonth = new Date(
      year,
      paymentDateObj.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const paymentsInMonth = await prisma.payment.count({
      where: {
        paymentDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const sequential = String(paymentsInMonth + 1).padStart(3, '0');
    const receiptNumber = `${year}/${month}/${sequential}`;

    const payment = await prisma.payment.create({
      data: {
        receiptNumber,
        rentalId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        periodMonth,
        notes,
        signedById: parseInt(signedById),
        transactionHash: hash,
        items: {
          create:
            items?.map((item: any) => ({
              description: item.description,
              amount: parseFloat(item.amount),
            })) || [],
        },
      },
      include: {
        rental: {
          include: {
            property: true,
            tenant: true,
            landlord: true,
          },
        },
        signedBy: true,
        items: true,
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear pago:', error);
    return NextResponse.json(
      { error: 'Error al crear el pago' },
      { status: 500 }
    );
  }
}
