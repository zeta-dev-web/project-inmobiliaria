import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const property = await prisma.property.create({
      data: body,
      include: {
        photos: true,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Error al crear la propiedad' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { address: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price' && order) {
      orderBy = { price: order };
    }

    const [properties, totalRecords] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { 
          lastEditedBy: { select: { name: true } },
          client: { select: { name: true } },
          photos: true,
        },
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);
    
    return NextResponse.json({
      data: properties,
      totalRecords,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las propiedades' },
      { status: 500 }
    );
  }
}
