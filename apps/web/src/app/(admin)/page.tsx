'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Icon helper
function getIconForSection(title: string) {
  switch (title) {
    case 'Elecciones':
      return '📋';
    case 'Candidatos':
      return '👥';
    case 'Padrón':
      return '📊';
    default:
      return '📄';
  }
}

export default function AdminDashboardPage() {
  const adminLinks = [
    {
      title: 'Elecciones',
      description: 'Crear, editar y administrar elecciones',
      href: '/elecciones',
    },
    {
      title: 'Candidatos',
      description: 'Gestionar candidatos',
      href: '/candidatos',
    },
    {
      title: 'Padrón',
      description: 'Importar y gestionar padrón electoral',
      href: '/padron',
    },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center md:text-left py-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Panel de Administración
        </h1>
        <p className="mt-3 text-xl text-slate-600">
          Gestión completa del sistema de votaciones UNT
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Card
            key={link.title}
            className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <CardHeader className="pb-5">
              <div className="flex items-center space-x-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">{getIconForSection(link.title)}</span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-extrabold text-slate-900">
                    {link.title}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="text-slate-600 text-base">
                {link.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t border-slate-100 pt-5 bg-slate-50">
              <Link href={link.href} className="w-full">
                <Button
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 transition-all shadow-md">
                  Acceder al Panel
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
