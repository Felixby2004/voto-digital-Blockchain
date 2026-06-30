import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/endpoints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const { user, tokens, setUser, setTokens, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ identificador, password }: { identificador: string; password: string }) => {
      const res = await authApi.login(identificador, password);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.tokens);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const logoutHandler = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  };

  return {
    user,
    tokens,
    loginMutation,
    logout: logoutHandler,
    isAuthenticated: !!user && !!tokens,
  };
};

export const useMe = () => {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const res = await authApi.profile();
      return res.data.user;
    },
    enabled: !!useAuthStore.getState().tokens,
  });
};
