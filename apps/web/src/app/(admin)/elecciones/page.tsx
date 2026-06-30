'use client';

import { useElections } from '@/lib/hooks/useElections';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Election } from '@/types';

export default function ElectionsPage() {
  const { data: elections, isLoading } = useElections();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Elecciones</h1>
        <Link href="/elecciones/crear">
          <Button>Crear Nueva</Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid gap-6">
          {elections?.map((election: Election) => (
            <Card key={election.id}>
              <CardHeader>
                <CardTitle>{election.nombre}</CardTitle>
                {election.descripcion && <CardDescription>{election.descripcion}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Estado:</span> {election.estado}
                  </div>
                  <div>
                    <span className="font-medium">Inicio:</span> {election.fechaInicio ? new Date(election.fechaInicio).toLocaleString() : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Fin:</span> {election.fechaFin ? new Date(election.fechaFin).toLocaleString() : '-'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
