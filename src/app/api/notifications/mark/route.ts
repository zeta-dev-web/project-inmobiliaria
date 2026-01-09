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

    const { rentalId, type } = await request.json();

    if (!rentalId || !type) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const existing = await prisma.notification.findFirst({
      where: {
        rentalId,
        type,
      },
    });

    let notification;
    if (existing) {
      notification = await prisma.notification.update({
        where: { id: existing.id },
        data: { notified: true },
      });
    } else {
      notification = await prisma.notification.create({
        data: {
          rentalId,
          type,
          message: "",
          notified: true,
        },
      });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    return NextResponse.json(
      { error: "Error al marcar notificación" },
      { status: 500 }
    );
  }
}
