import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { uploadFile } from "@/src/utils/uploadFile";
import { apiErrorHandler } from "@/src/utils/handlers/apiError.handler";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_PHOTOS = 10;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No se enviaron archivos" }, { status: 400 });
    }

    const property = await db.property.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!property) {
      return NextResponse.json({ message: "Propiedad no encontrada" }, { status: 404 });
    }

    if (property.photos.length + files.length > MAX_PHOTOS) {
      return NextResponse.json(
        { message: `Máximo ${MAX_PHOTOS} fotos por propiedad` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { message: "Solo se permiten archivos JPG o PNG" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "El tamaño máximo por foto es 15MB" },
          { status: 400 }
        );
      }
    }

    const uploadedPhotos = [];
    for (const file of files) {
      const url = await uploadFile(file, 'properties', `property-${id}`);
      const photo = await db.propertyPhoto.create({
        data: {
          propertyId: id,
          url,
        },
      });
      uploadedPhotos.push(photo);
    }

    return NextResponse.json(uploadedPhotos, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json({ message: "ID de foto requerido" }, { status: 400 });
    }

    const photo = await db.propertyPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.propertyId !== id) {
      return NextResponse.json({ message: "Foto no encontrada" }, { status: 404 });
    }

    await db.propertyPhoto.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ message: "Foto eliminada" });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
