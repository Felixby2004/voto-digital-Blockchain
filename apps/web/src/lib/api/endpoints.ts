import api from './client';
import { User, Candidate, Election, AuthTokens } from '@/types';

export const authApi = {
  login: (identificador: string, password: string) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/login', { identificador, password }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  profile: () => api.get<{ user: User }>('/auth/profile'),
};

export const electionApi = {
  getAll: () => api.get<Election[]>('/elecciones'),
  getById: (id: string) => api.get<Election>(`/elecciones/${id}`),
  create: (data: Omit<Election, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Election>('/elecciones', data),
  update: (id: string, data: Partial<Omit<Election, 'id' | 'createdAt' | 'updatedAt'>>) =>
    api.put<Election>(`/elecciones/${id}`, data),
  delete: (id: string) => api.delete(`/elecciones/${id}`),
  programar: (id: string) => api.patch(`/elecciones/${id}/programar`),
  activar: (id: string) => api.patch(`/elecciones/${id}/activar`),
  cerrar: (id: string) => api.patch(`/elecciones/${id}/cerrar`),
  finalizar: (id: string) => api.patch(`/elecciones/${id}/finalizar`),
  archivar: (id: string) => api.patch(`/elecciones/${id}/archivar`),
};

export const candidateApi = {
  getAll: (eleccionId?: string) =>
    api.get<Candidate[]>(`/candidatos${eleccionId ? `?eleccionId=${eleccionId}` : ''}`),
  getById: (id: string) => api.get<Candidate>(`/candidatos/${id}`),
  create: (data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'estado'>) =>
    api.post<Candidate>('/candidatos', data),
  update: (id: string, data: Partial<Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>>) =>
    api.put<Candidate>(`/candidatos/${id}`, data),
  delete: (id: string) => api.delete(`/candidatos/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const padronApi = {
  importar: (tipo: string, file: File, habilitar: boolean) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('habilitar', habilitar.toString());
    return api.post(`/padron/importar/${tipo}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getEstudiantes: () => api.get('/padron/estudiantes'),
};

export const votingApi = {
  castVote: (data: any) => api.post('/voto', data),
};
