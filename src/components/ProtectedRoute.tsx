'use client';

import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth');
      } else if (requiredRole && role !== requiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, role, requiredRole, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}