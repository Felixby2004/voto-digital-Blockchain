import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { electionApi } from '@/lib/api/endpoints';

export const useElections = () => {
  return useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await electionApi.getAll();
      return res.data;
    },
  });
};

export const useElection = (id: string) => {
  return useQuery({
    queryKey: ['election', id],
    queryFn: async () => {
      const res = await electionApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
  });
};

export const useUpdateElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      electionApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['election', id] });
    },
  });
};

export const useDeleteElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
  });
};

export const useProgramarElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionApi.programar,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['election', id] });
    },
  });
};

export const useActivarElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionApi.activar,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['election', id] });
    },
  });
};

export const useCerrarElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionApi.cerrar,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['election', id] });
    },
  });
};

export const useFinalizarElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionApi.finalizar,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['election', id] });
    },
  });
};

export const useArchivarElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionApi.archivar,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['election', id] });
    },
  });
};
