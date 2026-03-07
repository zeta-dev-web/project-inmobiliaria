import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { dni } = body;

    if (!dni || typeof dni !== 'string') {
      return NextResponse.json({ error: 'El DNI es requerido' }, { status: 400 });
    }

    const response = await fetch(`https://www.cuitonline.com/search/${dni}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al consultar CUIL' }, { status: 500 });
    }

    const html = await response.text();
    
    const metaMatch = html.match(/<meta name="description"\s+content="([^"]+)"/);
    if (!metaMatch) {
      return NextResponse.json({ error: 'No se encontraron resultados' }, { status: 404 });
    }

    const content = metaMatch[1];
    const cuilMatch = content.match(/(\d{11})/);
    const nameMatch = content.match(/([a-záéíóúñ\s]+)\s*-\s*\d{11}/i);

    if (!cuilMatch) {
      return NextResponse.json({ error: 'No se encontró el CUIL' }, { status: 404 });
    }

    return NextResponse.json({
      cuil: cuilMatch[1],
      name: nameMatch ? nameMatch[1].trim().toUpperCase() : null,
    });
  } catch (error) {
    console.error('Error searching CUIL:', error);
    return NextResponse.json({ error: 'Error al buscar CUIL' }, { status: 500 });
  }
}
