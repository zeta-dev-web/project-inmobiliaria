import prisma from "@/lib/prisma";
import { apiErrorHandler } from "@/utils/handlers/apiError.handler";
import { createOfferSchema } from "@/lib/zod/offer.schema";
import { getPaginationParams, createPaginatedResponse } from "@/utils/pagination";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = createOfferSchema.parse(body);

    // Verificar que la propiedad existe
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 }
      );
    }

    const offer = await prisma.offer.create({
      data: validatedData,
      include: {
        property: true,
      },
    });

    return NextResponse.json(offer, { status: 201 });
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
        { offeringPerson: { contains: search, mode: 'insensitive' as const } },
        { property: { address: { contains: search, mode: 'insensitive' as const } } },
      ],
    } : {};

    const [offers, totalRecords] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take: limit,
        include: {
          property: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offer.count({ where }),
    ]);

    const response = createPaginatedResponse(offers, totalRecords, page, limit);
    return NextResponse.json(response);
  } catch (error) {
    return apiErrorHandler(error);
  }
}
