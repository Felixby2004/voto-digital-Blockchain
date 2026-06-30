'use client';

import { useCandidates } from '@/lib/hooks/useVoting';
import { Candidate } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export const CandidateList = () => {
  const { data: candidates, isLoading } = useCandidates();

  if (isLoading) return <div>Cargando candidatos...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Candidatos</h2>
      <div className="grid gap-4">
        {candidates?.map((candidate: Candidate) => (
          <Card key={candidate.id}>
            <CardHeader>
              <CardTitle>{candidate.nombre} {candidate.apellido}</CardTitle>
              <CardDescription>{candidate.cargo}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Estado: {candidate.estado}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
