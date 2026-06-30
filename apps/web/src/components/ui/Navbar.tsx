'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from './Button';
import Link from 'next/link';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-blue-900 font-bold text-2xl">U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                Voto Digital
              </span>
              <span className="text-sm text-blue-200 font-semibold">
                Universidad Nacional de Trujillo
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-5">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <span className="text-sm font-bold text-white">
                      {user?.nombre?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user?.nombre || user?.email}
                  </span>
                </div>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-white text-blue-900 hover:bg-blue-50 border-none">Iniciar Sesión</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
