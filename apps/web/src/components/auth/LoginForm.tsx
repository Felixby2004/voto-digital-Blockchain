'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  identificador: z.string().min(1, 'Identificador es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

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
      await loginMutation.mutateAsync(data);
      router.push('/');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

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
              <p className="text-red-600 text-sm font-medium">
                {errors.identificador.message}
              </p>
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
              <p className="text-red-600 text-sm font-medium">
                {errors.password.message}
              </p>
            )}
          </div>
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
