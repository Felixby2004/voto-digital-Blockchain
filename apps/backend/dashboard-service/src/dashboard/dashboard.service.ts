import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    // 1. Contar estudiantes y profesores
    const [totalEstudiantes, totalProfesores, totalElecciones, eleccionesActivas, totalCandidatos] = await Promise.all([
      this.prisma.estudiante.count(),
      this.prisma.profesor.count(),
      this.prisma.eleccion.count(),
      this.prisma.eleccion.count({ where: { estado: 'ACTIVA' } }),
      this.prisma.candidato.count(),
    ]);

    // 2. Participación por facultad (basada en padrones habilitados)
    const estudiantesHabilitados = await this.prisma.estudiante.findMany({
      where: { estadoHabilitado: true },
      select: { facultad: true },
    });

    // Agrupar por facultad
    const facultadCounts: Record<string, number> = {};
    for (const est of estudiantesHabilitados) {
      facultadCounts[est.facultad] = (facultadCounts[est.facultad] || 0) + 1;
    }

    // Para participación por facultad (sin votos aún, usamos 0 como placeholder)
    const participacionPorFacultad = Object.entries(facultadCounts).map(([facultad, habilitados]) => ({
      facultad,
      habilitados,
      votaron: 0, // se actualizará cuando tengamos votos
      porcentaje: 0, // se calcula con votaron/habilitados
    }));

    // 3. Estado de las elecciones (agrupado)
    const estados = await this.prisma.eleccion.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    const estadoElecciones = estados.map((item: any) => ({
      estado: item.estado,
      cantidad: item._count.id,
    }));

    // 4. Últimas 5 elecciones (para el timeline)
    const ultimasElecciones = await this.prisma.eleccion.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombre: true,
        estado: true,
        fechaInicio: true,
        fechaFin: true,
        createdAt: true,
      },
    });

    // 5. Participación global: porcentaje de estudiantes habilitados sobre total
    const totalHabilitados = estudiantesHabilitados.length;
    const participacionGlobal = totalHabilitados > 0
      ? (totalHabilitados / totalEstudiantes) * 100
      : 0;

    return {
      totalEstudiantes,
      totalProfesores,
      totalElecciones,
      eleccionesActivas,
      totalCandidatos,
      participacionGlobal: parseFloat(participacionGlobal.toFixed(2)),
      participacionPorFacultad,
      estadoElecciones,
      ultimasElecciones,
    };
  }

  // Estadísticas específicas para una elección (opcional)
  async getEleccionStats(eleccionId: string) {
    const eleccion = await this.prisma.eleccion.findUnique({
      where: { id: eleccionId },
      include: {
        candidatos: true,
        padrones: {
          include: {
            estudiante: true,
            profesor: true,
          },
        },
      },
    });

    if (!eleccion) {
      throw new Error('Elección no encontrada');
    }

    const totalHabilitados = eleccion.padrones.filter((p: any) => p.estadoHabilitado).length;
    const totalCandidatos = eleccion.candidatos.length;

    return {
      id: eleccion.id,
      nombre: eleccion.nombre,
      estado: eleccion.estado,
      totalHabilitados,
      totalCandidatos,
      // votos_emitidos: 0, // se agregará con Parte 3
    };
  }
}