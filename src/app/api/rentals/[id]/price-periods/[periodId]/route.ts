import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; periodId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, periodId } = await params;
    const { price } = await request.json();

    if (!price || price <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 });
    }

    const period = await prisma.pricePeriod.update({
      where: { id: periodId, rentalId: id },
      data: { price },
    });

    return NextResponse.json(period);
  } catch (error) {
    console.error("Error updating price period:", error);
    return NextResponse.json({ error: "Error al actualizar el precio" }, { status: 500 });
  }
}
