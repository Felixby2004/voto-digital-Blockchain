import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi, votingApi } from '@/lib/api/endpoints';

export const useCandidates = (electionId?: string) => {
  return useQuery({
    queryKey: ['candidates', electionId],
    queryFn: async () => {
      console.log('[useCandidates] queryFn ejecutándose para electionId:', electionId);
      const res = await candidateApi.getAll(electionId);
      console.log('[useCandidates] Respuesta:', res.data);
      return res.data;
    },
  });
};

export const useCastVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votingApi.castVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
};
