'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useElection } from '@/lib/hooks/useElections';
import { useCandidates, useCastVote } from '@/lib/hooks/useVoting';
import { CandidateCard } from '@/components/voting/CandidateCard';
import { VoteStatus } from '@/components/voting/VoteStatus';
import { Button } from '@/components/ui/Button';
import { Candidate } from '@/types';

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.id as string;
  const { data: election } = useElection(electionId);
  const { data: candidates } = useCandidates(electionId);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const castVoteMutation = useCastVote();

  const handleVote = async () => {
    if (!selectedCandidate) return;
    try {
      await castVoteMutation.mutateAsync({
        candidatoId: selectedCandidate.id,
        eleccionId: electionId,
      });
      router.push('/confirmacion');
    } catch (error) {
      console.error('Vote failed', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{election?.nombre}</h1>
        {election?.descripcion && <p className="text-gray-600">{election.descripcion}</p>}
      </div>

      <VoteStatus
        status={castVoteMutation.isPending ? 'loading' : 'idle'}
      />

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
