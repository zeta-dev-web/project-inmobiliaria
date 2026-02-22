import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiErrorHandler } from '@/utils/handlers/apiError.handler';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params;

    const document = await prisma.clientDocument.findUnique({
      where: { id: docId },
    });

    if (!document || document.clientId !== id) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }

    const filepath = join(process.cwd(), 'public', document.url);
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await prisma.clientDocument.delete({
      where: { id: docId },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
