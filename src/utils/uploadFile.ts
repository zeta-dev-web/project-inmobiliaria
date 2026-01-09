import fs from 'fs';
import path from 'path';

export async function uploadFile(
  file: File,
  DIR_NAME: string,
  customName?: string
): Promise<string> {
  const currentDate = new Date();
  const formattedDate = currentDate
    .toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/[/,:\s]/g, '');

  const extension = file.name.split('.').pop();
  const baseName = customName || file?.name?.replace(/\s+/g, '_')?.toLowerCase();
  const filename = `${formattedDate}-${baseName}.${extension}`;
  const bufferFile = Buffer.from(await file?.arrayBuffer());

  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', DIR_NAME);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, bufferFile);

  return `/uploads/${DIR_NAME}/${filename}`;
}
