import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/src/lib/auth';

type RouteHandler = (req: Request, context?: unknown) => Promise<NextResponse>;

export async function withAuth(handler: RouteHandler) {
  return async (req: Request, context?: unknown) => {
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