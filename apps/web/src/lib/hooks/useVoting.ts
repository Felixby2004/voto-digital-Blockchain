import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi, votingApi } from '@/lib/api/endpoints';

export const useCandidates = (electionId?: string) => {
  return useQuery({
    queryKey: ['candidates', electionId],
    queryFn: async () => {
      const res = await candidateApi.getAll(electionId);
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
