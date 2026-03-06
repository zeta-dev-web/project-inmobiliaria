import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeEmail } from '@/services/email.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    const result = await unsubscribeEmail(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Te has dado de baja exitosamente. Ya no recibirás más emails.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al darse de baja. Por favor, intente nuevamente.' },
      { status: 500 }
    );
  }
}
