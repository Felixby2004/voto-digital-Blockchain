import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/endpoints';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const { user, tokens, setUser, setTokens, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ identificador, password }: { identificador: string; password: string }) => {
      console.log('[useAuth] Login mutation iniciado:', identificador);
      const res = await authApi.login(identificador, password);
      console.log('[useAuth] Login response data:', JSON.stringify(res.data, null, 2));
      return res.data;
    },
    onSuccess: (data) => {
      console.log('[useAuth] onSuccess — user:', data.user?.email, 'rol:', data.user?.rol);
      console.log('[useAuth] onSuccess — tokens presentes?', !!data.accessToken, !!data.refreshToken);
      setUser(data.user);
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: any) => {
      console.error('[useAuth] onError — status:', error?.response?.status, 'msg:', error?.message);
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
