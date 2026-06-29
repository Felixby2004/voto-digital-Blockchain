export const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/refresh'];

export const ROLES = {
  ESTUDIANTE: 'ESTUDIANTE',
  PROFESOR: 'PROFESOR',
  ADMINISTRADOR_ELECTORAL: 'ADMINISTRADOR_ELECTORAL',
  AUDITOR: 'AUDITOR',
  SUPER_ADMINISTRADOR: 'SUPER_ADMINISTRADOR',
} as const;

export type Rol = typeof ROLES[keyof typeof ROLES];
