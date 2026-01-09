import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/src/lib/auth';
import { USER_ROLES } from '@/src/constants/roles.constants';

type RouteHandler = (req: Request, context?: unknown) => Promise<NextResponse>;

export function withRole(handler: RouteHandler, requiredRole?: string): RouteHandler {
  return async (req: Request, context?: unknown) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (requiredRole && session.user.role !== requiredRole) {
      return NextResponse.json(
        { message: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}

export const withAdmin = (handler: RouteHandler): RouteHandler => withRole(handler, USER_ROLES.ADMIN);
export const withUser = (handler: RouteHandler): RouteHandler => withRole(handler, USER_ROLES.USER);