import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");

    if (!hash) {
      return NextResponse.json(
        { valid: false, message: "Hash no proporcionado" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { transactionHash: hash },
      include: {
        rental: {
          include: {
            property: true,
            tenants: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { valid: false, message: "Transacción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Recibo válido",
      data: {
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        periodMonth: payment.periodMonth,
        property: payment.rental.property.address,
        tenant: payment.rental.tenants && payment.rental.tenants.length > 0
          ? payment.rental.tenants.map(t => t.client.name).join(', ')
          : '-',
      },
    });
  } catch (error) {
    console.error("Error al validar transacción:", error);
    return NextResponse.json(
      { valid: false, message: "Error al validar transacción" },
      { status: 500 }
    );
  }
}
