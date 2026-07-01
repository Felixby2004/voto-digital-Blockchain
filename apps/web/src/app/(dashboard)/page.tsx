'use client';

import { useElections } from '@/lib/hooks/useElections';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Election } from '@/types';

// Helper function to get status badge color
function getStatusColor(estado: string) {
  switch (estado) {
    case 'ACTIVA':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'PROGRAMADA':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'CERRADA':
      return 'bg-orange-100 text-orange-700 border border-orange-200';
    case 'FINALIZADA':
      return 'bg-gray-100 text-gray-700 border border-gray-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

export default function DashboardPage() {
  const { data: elections, isLoading, error } = useElections();

  console.log('[DashboardPage] Render — isLoading:', isLoading, '| error:', !!error, '| elections?:', !!elections, '| elections.length:', elections?.length);

  if (isLoading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-b-blue-900 mx-auto mb-6"></div>
          <p className="text-xl text-slate-700 font-medium">Cargando elecciones...</p>
        </div>
      </div>
    );

  if (error) {
    const err = error as any;
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error al cargar elecciones</h2>
          <p className="text-slate-600 mb-4">
            {err?.response?.status === 404
              ? 'No se encontró el servicio de elecciones. Verifica que el API Gateway y el electoral-service estén corriendo.'
              : err?.response?.status === 401
                ? 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
                : err?.message || 'Ocurrió un error inesperado al obtener las elecciones.'}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left text-xs text-red-800 font-mono overflow-auto">
            <p>Status: {err?.response?.status || 'N/A'}</p>
            <p>URL: {err?.config?.url || 'N/A'}</p>
            <p>Base: {err?.config?.baseURL || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!elections || elections.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4">🗳️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No hay elecciones disponibles</h2>
          <p className="text-slate-600">Actualmente no hay elecciones activas o programadas. Vuelve más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="text-center md:text-left py-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Elecciones UNT
        </h1>
        <p className="mt-3 text-xl text-slate-600">
          Bienvenido al Sistema de Votaciones Digitales de la Universidad Nacional de Trujillo
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {elections?.map((election: Election) => (
          <Card
            key={election.id}
            className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <CardHeader className="pb-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-black text-slate-900">
                    {election.nombre}
                  </CardTitle>
                  {election.descripcion && (
                    <CardDescription className="mt-2 text-slate-600 text-base">
                      {election.descripcion}
                    </CardDescription>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                    election.estado
                  )}`}
                >
                  {election.estado}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-3 text-sm text-slate-500">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-slate-700">Fecha Inicio:</span>
                  <span className="bg-slate-50 px-3 py-1 rounded-lg text-slate-800">
                    {election.fechaInicio
                      ? new Date(election.fechaInicio).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-slate-700">Fecha Fin:</span>
                  <span className="bg-slate-50 px-3 py-1 rounded-lg text-slate-800">
                    {election.fechaFin
                      ? new Date(election.fechaFin).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 pt-5 bg-slate-50">
              <Link href={`/voting/${election.id}`} className="w-full">
                <Button
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 transition-all shadow-md"
                >
                  Emitir Voto
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
