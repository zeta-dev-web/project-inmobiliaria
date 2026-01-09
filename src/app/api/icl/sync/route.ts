import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";
import https from "https";

const BCRA_API = "https://api.bcra.gob.ar/estadisticas/v3.0/monetarias/40";

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const desde = oneYearAgo.toISOString().split('T')[0];
    const hasta = now.toISOString().split('T')[0];

    const { data } = await axiosInstance.get(`${BCRA_API}?desde=${desde}&hasta=${hasta}`);

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No se obtuvieron datos" }, { status: 404 });
    }

    let created = 0;
    let updated = 0;

    for (const item of data.results) {
      const date = new Date(item.fecha);
      const existing = await prisma.iCL.findUnique({ where: { date } });

      if (existing) {
        await prisma.iCL.update({
          where: { date },
          data: { value: item.valor },
        });
        updated++;
      } else {
        await prisma.iCL.create({
          data: {
            date,
            value: item.valor,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      message: "Sincronización completada",
      created,
      updated,
      total: data.results.length,
    });
  } catch (error) {
    console.error("Error syncing ICL:", error);
    return NextResponse.json(
      { error: "Error al sincronizar ICL" },
      { status: 500 }
    );
  }
}
