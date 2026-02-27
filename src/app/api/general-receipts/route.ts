import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiErrorHandler } from '@/utils/handlers/apiError.handler';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [receipts, total] = await Promise.all([
      prisma.generalReceipt.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          signedBy: { select: { name: true, signatureUrl: true } },
        },
      }),
      prisma.generalReceipt.count(),
    ]);

    return NextResponse.json({
      data: receipts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { clientIds, reason, amount, receiptDate } = body;

    const date = new Date(receiptDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const lastReceipt = await prisma.generalReceipt.findFirst({
      where: {
        receiptNumber: {
          startsWith: `${year}/${month}/`,
        },
      },
      orderBy: { receiptNumber: 'desc' },
    });

    let receiptNumber;
    if (lastReceipt) {
      const lastNumber = parseInt(lastReceipt.receiptNumber.split('/')[2]);
      receiptNumber = `${year}/${month}/${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      receiptNumber = `${year}/${month}/001`;
    }

    const transactionHash = crypto
      .createHash('sha256')
      .update(`${receiptNumber}-${amount}-${receiptDate}-${Date.now()}`)
      .digest('hex');

    const receipt = await prisma.generalReceipt.create({
      data: {
        receiptNumber,
        clientIds,
        reason,
        amount,
        receiptDate: new Date(receiptDate),
        signedById: parseInt(session.user.id),
        transactionHash,
      },
      include: {
        signedBy: { select: { name: true, signatureUrl: true } },
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
