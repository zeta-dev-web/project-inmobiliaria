import { useSession } from 'next-auth/react';
import { USER_ROLES } from '@/constants/roles.constants';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === USER_ROLES.ADMIN,
    isUser: session?.user?.role === USER_ROLES.USER,
    role: session?.user?.role,
  };
}