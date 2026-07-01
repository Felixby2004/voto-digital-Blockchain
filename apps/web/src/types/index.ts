export type RolUsuario = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR_ELECTORAL' | 'AUDITOR' | 'SUPER_ADMINISTRADOR';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
export type EstadoEleccion = 'BORRADOR' | 'PROGRAMADA' | 'ACTIVA' | 'CERRADA' | 'FINALIZADA' | 'ARCHIVADA';
export type EstadoCandidato = 'ACTIVO' | 'INACTIVO';

export interface User {
  id: string;
  nombre: string;
  email: string;
  dni?: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  nombre: string;
  apellido: string;
  foto?: string;
  descripcion?: string;
  cargo: string;
  partido?: string;
  facultad?: string;
  escuela?: string;
  estado: EstadoCandidato;
  eleccionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Election {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: EstadoEleccion;
  fechaInicio?: string;
  fechaFin?: string;
  createdAt: string;
  updatedAt: string;
  facultadesIds: string[];
  escuelasIds: string[];
  carrerasIds: string[];
}

export interface Vote {
  id: string;
  candidatoId: string;
  eleccionId: string;
  hashTransaccion?: string;
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
