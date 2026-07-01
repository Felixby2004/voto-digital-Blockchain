import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // La autenticación se maneja completamente en el cliente (sessionStorage/Zustand).
  // El middleware del servidor no tiene acceso a sessionStorage, por lo que no puede
  // validar sesiones aquí. La protección de rutas está implementada via AuthGuard
  // en los layouts de (admin) y (dashboard).
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
