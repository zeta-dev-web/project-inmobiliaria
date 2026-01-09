import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { paymentIds, deliveryMethod } = await req.json();

    if (!paymentIds || paymentIds.length === 0) {
      return NextResponse.json(
        { error: "Debe seleccionar al menos un pago" },
        { status: 400 }
      );
    }

    await prisma.payment.updateMany({
      where: {
        id: { in: paymentIds },
      },
      data: {
        delivered: true,
        deliveryDate: new Date(),
        deliveryMethod,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al registrar entrega:", error);
    return NextResponse.json(
      { error: "Error al registrar la entrega" },
      { status: 500 }
    );
  }
}
