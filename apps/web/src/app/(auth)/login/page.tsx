'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <LoginForm />
          </div>
          <div className="order-1 md:order-2 hidden md:block">
            <div className="p-10 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 rounded-3xl text-white shadow-2xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-blue-900 font-black text-3xl">U</span>
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold leading-tight">NextVote</h2>
                  <h3 className="text-xl font-semibold text-blue-200">Universidad Nacional de Trujillo</h3>
                </div>
              </div>
              <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                Plataforma oficial de votaciones digitales de la UNT.
                Ejerce tu derecho a votar de forma segura, anónima y transparente.
              </p>
              <ul className="space-y-5 text-base text-blue-100">
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1 text-2xl">✓</span>
                  <div>
                    <span className="font-semibold block">Voto anónimo</span>
                    <span className="text-sm text-blue-200">Tu identidad está protegida</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1 text-2xl">✓</span>
                  <div>
                    <span className="font-semibold block">Seguridad blockchain</span>
                    <span className="text-sm text-blue-200">Votos almacenados de forma immutable</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1 text-2xl">✓</span>
                  <div>
                    <span className="font-semibold block">Verificación de resultados</span>
                    <span className="text-sm text-blue-200">Resultados auditables por todos</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
