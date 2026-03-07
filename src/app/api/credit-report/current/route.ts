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
    const { cuil } = body;

    if (!cuil || typeof cuil !== 'string') {
      return NextResponse.json(
        { error: 'El CUIL es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de CUIL (solo números, longitud 10-11)
    const cuilNumeros = cuil.replace(/-/g, '');
    if (!/^\d{10,11}$/.test(cuilNumeros)) {
      return NextResponse.json(
        { error: 'Formato de CUIL inválido. Debe tener 10 u 11 dígitos.' },
        { status: 400 }
      );
    }

    const url = `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cuilNumeros}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Error al consultar el BCRA';
      
      if (response.status === 404) {
        errorMessage = 'No se encontraron datos para el CUIL ingresado';
      } else if (response.status === 400) {
        errorMessage = 'CUIL inválido o formato incorrecto';
      }

      try {
        const errorData = await response.json();
        if (errorData.errorMessages && errorData.errorMessages.length > 0) {
          errorMessage = errorData.errorMessages.join(', ');
        }
      } catch {
        // Si no se puede parsear el error, usar mensaje por defecto
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error consulting BCRA:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar el BCRA' },
      { status: 500 }
    );
  }
}
