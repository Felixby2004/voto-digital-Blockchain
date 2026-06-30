'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { padronApi } from '@/lib/api/endpoints';

export const PadronImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<'ESTUDIANTE' | 'DOCENTE'>('ESTUDIANTE');
  const [habilitar, setHabilitar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      await padronApi.importar(tipo, file, habilitar);
      alert('Padrón importado exitosamente');
      setFile(null);
    } catch (error) {
      console.error('Failed to import padron', error);
      alert('Error al importar padrón');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Padrón</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <select
            value={tipo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipo(e.target.value as any)}
            className="w-full h-10 px-3 rounded-md border border-gray-300"
          >
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="DOCENTE">Docente</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Archivo CSV/Excel</label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="habilitar"
            checked={habilitar}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHabilitar(e.target.checked)}
          />
          <label htmlFor="habilitar" className="text-sm">Habilitar usuarios</label>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={!file || isLoading}>
          {isLoading ? 'Importando...' : 'Importar'}
        </Button>
      </CardFooter>
    </Card>
  );
};
