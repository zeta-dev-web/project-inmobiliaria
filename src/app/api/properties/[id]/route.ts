import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: { 
        rentals: true,
        lastEditedBy: { select: { name: true } },
        client: true,
        photos: true,
      },
    });

    if (!property) {
      return NextResponse.json({ message: "La propiedad no existe" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: 'Error al obtener la propiedad' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const property = await prisma.property.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: 'Error al actualizar la propiedad' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Propiedad eliminada con éxito" });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la propiedad' },
      { status: 500 }
    );
  }
}