export class DashboardStatsDto {
  totalEstudiantes: number;
  totalProfesores: number;
  totalElecciones: number;
  eleccionesActivas: number;
  totalCandidatos: number;
  participacionGlobal: number;
  participacionPorFacultad: {
    facultad: string;
    habilitados: number;
    votaron?: number;
    porcentaje: number;
  }[];
  estadoElecciones: {
    estado: string;
    cantidad: number;
  }[];
  ultimasElecciones: {
    id: string;
    nombre: string;
    estado: string;
    fechaInicio: Date | null;  // <-- Permitir null
    fechaFin: Date | null;     // <-- Permitir null
    createdAt: Date;
  }[];
}