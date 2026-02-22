import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import { apiErrorHandler } from '@/utils/handlers/apiError.handler';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const files = formData.getAll('documents') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No documents provided' },
        { status: 400 }
      );
    }

    const uploadedDocuments = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${file.name}`;
      const filepath = join(process.cwd(), 'public', 'uploads', 'clients', filename);
      
      await writeFile(filepath, buffer);

      const document = await prisma.clientDocument.create({
        data: {
          clientId: id,
          url: `/uploads/clients/${filename}`,
          name: file.name,
          type: 'OTHER',
        },
      });

      uploadedDocuments.push(document);
    }

    return NextResponse.json(uploadedDocuments, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
