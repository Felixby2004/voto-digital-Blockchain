'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RolUsuario } from '@/types';

const loginSchema = z.object({
  identificador: z.string().min(1, 'Identificador es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** Roles que tienen acceso al panel de administración */
const ADMIN_ROLES: RolUsuario[] = [
  'SUPER_ADMINISTRADOR',
  'ADMINISTRADOR_ELECTORAL',
  'AUDITOR',
];

function getRedirectPath(rol: RolUsuario): string {
  if (ADMIN_ROLES.includes(rol)) return '/admin';
  // ESTUDIANTE y PROFESOR van al panel de votación
  return '/';
}

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { loginMutation } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      const rol = result?.user?.rol as RolUsuario;
      const destino = getRedirectPath(rol);
      console.log(`✅ LOGIN EXITOSO — rol: ${rol} → redirigiendo a ${destino}`);
      router.push(destino);
    } catch (error: any) {
      console.group('❌ LOGIN FALLIDO');
      console.error('Error completo:', error);
      if (error?.response) {
        console.error('HTTP Status:', error.response.status, error.response.statusText);
        console.error('Response Data:', error.response.data);
        console.error('Request URL:', error.response.config?.url);
        console.error('Request Payload (raw):', error.response.config?.data);
      } else if (error?.request) {
        console.error('⚡ NETWORK ERROR – sin respuesta del servidor');
        console.error('Request:', error.request);
      } else {
        console.error('Error de configuración:', error?.message);
      }
      console.groupEnd();
    }
  };

  // Info del error para mostrar en pantalla
  const errorInfo = loginMutation.error as any;
  const debugInfo = errorInfo
    ? {
        message: errorInfo?.message ?? 'Error desconocido',
        status: errorInfo?.response?.status,
        statusText: errorInfo?.response?.statusText,
        responseData: errorInfo?.response?.data,
        requestUrl: errorInfo?.response?.config?.url ?? errorInfo?.config?.url,
        requestPayload: (() => {
          try {
            const raw = errorInfo?.response?.config?.data ?? errorInfo?.config?.data;
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })(),
        isNetworkError: !errorInfo?.response && !!errorInfo?.request,
      }
    : null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center">
            <span className="text-white font-black text-2xl">U</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Voto Digital UNT</h3>
            <p className="text-sm text-slate-500">Sistema Oficial de Votaciones</p>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-800">Iniciar Sesión</CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Ingresa tus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="identificador" className="text-sm font-semibold text-slate-700">
              Identificador (DNI, Código o Email)
            </label>
            <Input
              id="identificador"
              type="text"
              placeholder="12345678 / U202100000 / tu@unt.edu.pe"
              {...register('identificador')}
            />
            {errors.identificador && (
              <p className="text-red-600 text-sm font-medium">{errors.identificador.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-600 text-sm font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* ── PANEL DE DEBUG (solo visible cuando hay error) ── */}
          {debugInfo && (
            <div className="rounded-lg border-2 border-red-400 bg-red-50 p-3 text-xs font-mono space-y-2 text-left overflow-auto max-h-80">
              <p className="text-red-700 font-bold text-sm">🛑 Error de Login</p>

              <div>
                <span className="text-slate-500">URL: </span>
                <span className="text-red-800 break-all">
                  {debugInfo.requestUrl ?? `${apiBase}/auth/login`}
                </span>
              </div>

              <div>
                <span className="text-slate-500">HTTP Status: </span>
                <span className="text-red-800 font-bold">
                  {debugInfo.isNetworkError
                    ? '⚡ NETWORK ERROR – el servidor no respondió'
                    : `${debugInfo.status} ${debugInfo.statusText}`}
                </span>
              </div>

              {debugInfo.requestPayload && (
                <div>
                  <div className="text-slate-500 mb-1">Payload enviado:</div>
                  <pre className="text-red-800 bg-red-100 rounded p-1 whitespace-pre-wrap">
                    {JSON.stringify({ ...debugInfo.requestPayload, password: '***' }, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.responseData && (
                <div>
                  <div className="text-slate-500 mb-1">Respuesta del servidor:</div>
                  <pre className="text-red-800 bg-red-100 rounded p-1 whitespace-pre-wrap">
                    {typeof debugInfo.responseData === 'object'
                      ? JSON.stringify(debugInfo.responseData, null, 2)
                      : String(debugInfo.responseData)}
                  </pre>
                </div>
              )}

              <div>
                <span className="text-slate-500">Mensaje: </span>
                <span className="text-red-800">{debugInfo.message}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">
            API: <code className="bg-slate-100 px-1 rounded">{apiBase}</code>
          </p>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar al Sistema'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
