import prisma from "@/lib/prisma";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";
import { createClientSchema } from "@/lib/zod/client.schema";
import { getPaginationParams, createPaginatedResponse } from "@/utils/pagination";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const validatedData = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        lastEditedById: session?.user?.id ? Number(session.user.id) : undefined,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, search } = getPaginationParams(searchParams);
    
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [clients, totalRecords] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lastEditedBy: {
            select: { name: true }
          }
        }
      }),
      prisma.client.count({ where }),
    ]);

    const response = createPaginatedResponse(clients, totalRecords, page, limit);
    return NextResponse.json(response);
  } catch (error) {
    return apiErrorHandler(error);
  }
}
