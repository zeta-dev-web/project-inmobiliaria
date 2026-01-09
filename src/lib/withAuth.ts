import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/src/lib/auth';

export async function withAuth(handler: Function) {
  return async (req: Request, context?: any) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(req, context, session);
  };
}