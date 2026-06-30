'use client';

import { Candidate } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CandidateCardProps {
  candidate: Candidate;
  onSelect?: (candidate: Candidate) => void;
  selected?: boolean;
}

export const CandidateCard = ({ candidate, onSelect, selected }: CandidateCardProps) => {
  return (
    <Card
      className={`transition-all duration-200 ${
        selected ? 'border-blue-700 ring-2 ring-blue-200' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center border border-slate-200">
          {candidate.foto ? (
            <img
              src={candidate.foto}
              alt={`${candidate.nombre} ${candidate.apellido}`}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {candidate.nombre.charAt(0)}
                {candidate.apellido.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <CardTitle className="text-center text-lg">
          {candidate.nombre} {candidate.apellido}
        </CardTitle>
        <CardDescription className="text-center text-base font-medium text-slate-700">
          {candidate.cargo}
        </CardDescription>
        {candidate.descripcion && (
          <CardDescription className="text-center mt-2">{candidate.descripcion}</CardDescription>
        )}
        {candidate.facultad && (
          <CardDescription className="text-center text-xs mt-1">
            {candidate.facultad}
            {candidate.escuela ? ` · ${candidate.escuela}` : ''}
          </CardDescription>
        )}
      </CardHeader>
      {onSelect && (
        <CardFooter className="border-t border-slate-100 pt-5">
          <Button
            className="w-full"
            variant={selected ? 'default' : 'outline'}
            onClick={() => onSelect(candidate)}
          >
            {selected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
