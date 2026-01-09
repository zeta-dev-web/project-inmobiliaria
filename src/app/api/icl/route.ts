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
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const where: any = {};
    if (desde) where.date = { ...where.date, gte: new Date(desde) };
    if (hasta) where.date = { ...where.date, lte: new Date(hasta) };

    const results = await prisma.iCL.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    
    return NextResponse.json({
      results: results.map(r => ({ fecha: r.date, valor: r.value })),
      count: results.length,
    });
  } catch (error) {
    console.error("Error fetching ICL:", error);
    return NextResponse.json(
      { error: "Error al obtener ICL" },
      { status: 500 }
    );
  }
}
