import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";
import https from "https";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("[CRON] Intento de acceso no autorizado");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("[CRON] Iniciando sincronización ICL");

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    console.log(`[CRON] Consultando BCRA desde ${startStr} hasta ${endStr}`);

    const response = await axios.get(
      `https://api.bcra.gob.ar/estadisticas/v2.0/DatosVariable/31/desde/${startStr}/hasta/${endStr}`,
      { httpsAgent: agent }
    );

    if (!response.data?.results) {
      console.error("[CRON] No se obtuvieron datos de BCRA");
      return NextResponse.json({ error: "No se obtuvieron datos" }, { status: 500 });
    }

    const results = response.data.results;
    let created = 0;
    let updated = 0;

    for (const item of results) {
      const date = new Date(item.fecha);
      const value = parseFloat(item.valor);

      const existing = await prisma.iCL.findUnique({
        where: { date },
      });

      if (existing) {
        if (existing.value !== value) {
          await prisma.iCL.update({
            where: { date },
            data: { value },
          });
          updated++;
        }
      } else {
        await prisma.iCL.create({
          data: { date, value },
        });
        created++;
      }
    }

    console.log(`[CRON] Sincronización completada: ${created} creados, ${updated} actualizados`);

    return NextResponse.json({
      success: true,
      created,
      updated,
      total: results.length,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Error al sincronizar ICL:", error);
    return NextResponse.json(
      { error: "Error al sincronizar ICL" },
      { status: 500 }
    );
  }
}
