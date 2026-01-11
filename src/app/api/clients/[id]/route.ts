import prisma from "@/lib/prisma";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";
import { updateClientSchema } from "@/lib/zod/client.schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: { 
        rentalsAsTenant: { include: { property: true } },
        rentalsAsLandlord: { include: { property: true } },
        properties: true,
      },
    });

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const validatedData = updateClientSchema.parse(body);

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...validatedData,
        lastEditedById: session?.user?.id ? Number(session.user.id) : undefined,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    return apiErrorHandler(error);
  }
}