import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const order = searchParams.get('order') || 'asc';

    const skip = (page - 1) * limit;

    const where: any = {
      published: true,
      status: 'AVAILABLE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const orderBy = { price: order as 'asc' | 'desc' };

    const [properties, totalRecords] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          photos: true,
        },
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      properties,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { properties: [], totalPages: 1, currentPage: 1 },
      { status: 500 }
    );
  }
}
