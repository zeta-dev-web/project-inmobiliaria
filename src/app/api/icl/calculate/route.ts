import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { basePrice, startDate, endDate } = await request.json();

    if (!basePrice || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const iclInicial = await prisma.iCL.findFirst({
      where: { date: { lte: new Date(startDate) } },
      orderBy: { date: 'desc' },
    });

    const iclFinal = await prisma.iCL.findFirst({
      where: { date: { lte: new Date(endDate) } },
      orderBy: { date: 'desc' },
    });

    if (!iclInicial || !iclFinal) {
      return NextResponse.json(
        { error: "No se encontraron datos de ICL. Sincroniza primero." },
        { status: 404 }
      );
    }

    const updatedPrice = Math.round(basePrice * (iclFinal.value / iclInicial.value));

    return NextResponse.json({
      basePrice,
      iclInicial: iclInicial.value,
      iclFinal: iclFinal.value,
      updatedPrice,
      variation: ((iclFinal.value / iclInicial.value - 1) * 100).toFixed(2),
      startDate: iclInicial.date,
      endDate: iclFinal.date,
    });
  } catch (error) {
    console.error("Error calculating ICL:", error);
    return NextResponse.json(
      { error: "Error al calcular actualización con ICL" },
      { status: 500 }
    );
  }
}
