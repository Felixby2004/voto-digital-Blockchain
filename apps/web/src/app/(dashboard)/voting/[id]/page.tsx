'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useElection } from '@/lib/hooks/useElections';
import { useCandidates, useCastVote } from '@/lib/hooks/useVoting';
import { CandidateCard } from '@/components/voting/CandidateCard';
import { VoteStatus } from '@/components/voting/VoteStatus';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { Candidate } from '@/types';

function ErrorCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600">{detail}</p>
      </div>
    </div>
  );
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.id as string;
  const { data: election, isLoading: loadingElection, error: electionError } = useElection(electionId);
  const { data: candidates, isLoading: loadingCandidates, error: candidatesError } = useCandidates(electionId);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [voteCompleted, setVoteCompleted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const castVoteMutation = useCastVote();
  const { logout } = useAuth();

  const handleVote = async () => {
    if (!selectedCandidate) return;
    try {
      await castVoteMutation.mutateAsync({
        candidatoId: selectedCandidate.id,
        eleccionId: electionId,
      });
      setVoteCompleted(true);
    } catch (error) {
      console.error('Vote failed', error);
    }
  };

  // Cuenta regresiva y logout automático después de votar
  useEffect(() => {
    if (!voteCompleted) return;
    if (countdown <= 0) {
      logout();
      router.push('/login');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [voteCompleted, countdown, logout, router]);

  if (loadingElection || loadingCandidates) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-b-blue-900 mx-auto mb-6"></div>
          <p className="text-xl text-slate-700 font-medium">Cargando información de la elección...</p>
        </div>
      </div>
    );
  }

  if (electionError) {
    return (
      <ErrorCard
        title="Error al cargar la elección"
        detail="No se pudo obtener la información de esta elección. Verifica tu conexión o que la elección exista."
      />
    );
  }

  if (candidatesError) {
    return (
      <ErrorCard
        title="Error al cargar candidatos"
        detail="No se pudo obtener la lista de candidatos para esta elección."
      />
    );
  }

  if (!election) {
    return (
      <ErrorCard
        title="Elección no encontrada"
        detail="La elección solicitada no existe o ha sido eliminada."
      />
    );
  }

  if (voteCompleted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Voto Registrado!</h2>
          <p className="text-slate-600 mb-2">Tu voto ha sido emitido exitosamente.</p>
          <p className="text-slate-600 mb-6">
            Serás desconectado del sistema en <span className="font-bold text-blue-900 text-xl">{countdown}</span> segundos...
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-900 h-2.5 rounded-full transition-all"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400">Gracias por participar en las Elecciones UNT 2026.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{election.nombre}</h1>
        {election.descripcion && <p className="text-gray-600">{election.descripcion}</p>}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-3 ${
          election.estado === 'ACTIVA'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : election.estado === 'PROGRAMADA'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}>
          {election.estado}
        </span>
      </div>

      <VoteStatus
        status={castVoteMutation.isPending ? 'loading' : castVoteMutation.isError ? 'error' : 'idle'}
      />

      {castVoteMutation.isError && (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold mb-1">Error al registrar el voto</p>
          <p>Inténtalo nuevamente o contacta al administrador del sistema.</p>
        </div>
      )}

      {!castVoteMutation.isPending && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {candidates?.map((candidate: Candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                selected={selectedCandidate?.id === candidate.id}
                onSelect={setSelectedCandidate}
              />
            ))}
          </div>

          {(!candidates || candidates.length === 0) && (
            <div className="text-center py-10">
              <p className="text-slate-500 text-lg">No hay candidatos registrados para esta elección.</p>
            </div>
          )}

          {selectedCandidate && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleVote}
                disabled={castVoteMutation.isPending}
              >
                Confirmar Voto
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
