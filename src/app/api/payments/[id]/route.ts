import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        rental: {
          include: {
            property: true,
            tenants: {
              include: {
                client: true,
              },
            },
            landlord: true,
          },
        },
        signedBy: true,
        items: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error("Error al obtener pago:", error);
    return NextResponse.json(
      { error: "Error al obtener el pago" },
      { status: 500 }
    );
  }
}
