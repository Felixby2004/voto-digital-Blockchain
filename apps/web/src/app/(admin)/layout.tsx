'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RolUsuario } from '@/types';

const ADMIN_ROLES: RolUsuario[] = [
  'SUPER_ADMINISTRADOR',
  'ADMINISTRADOR_ELECTORAL',
  'AUDITOR',
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={ADMIN_ROLES}>
      {children}
    </AuthGuard>
  );
}
