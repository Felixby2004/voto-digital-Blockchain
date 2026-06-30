'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useCreateElection } from '@/lib/hooks/useElections';

export const ElectionForm = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [facultadesIds, setFacultadesIds] = useState<string[]>([]);
  const [escuelasIds, setEscuelasIds] = useState<string[]>([]);
  const [carrerasIds, setCarrerasIds] = useState<string[]>([]);
  const createMutation = useCreateElection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        nombre,
        descripcion,
        fechaInicio,
        fechaFin,
        estado: 'BORRADOR',
        facultadesIds,
        escuelasIds,
        carrerasIds,
      });
      setNombre('');
      setDescripcion('');
      setFechaInicio('');
      setFechaFin('');
      setFacultadesIds([]);
      setEscuelasIds([]);
      setCarrerasIds([]);
    } catch (error) {
      console.error('Failed to create election', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Elección</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Input value={descripcion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Inicio</label>
              <Input type="datetime-local" value={fechaInicio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Fin</label>
              <Input type="datetime-local" value={fechaFin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaFin(e.target.value)} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear Elección'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
