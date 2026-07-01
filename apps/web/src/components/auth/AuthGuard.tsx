'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { RolUsuario } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: RolUsuario[];
  fallback?: string;
}

export function AuthGuard({ children, allowedRoles, fallback = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!user) {
      router.replace(fallback);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.rol)) {
      router.replace(fallback);
    }
  }, [isClient, user, router, allowedRoles, fallback]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-b-blue-900"></div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.rol))) {
    return null;
  }

  return <>{children}</>;
}
