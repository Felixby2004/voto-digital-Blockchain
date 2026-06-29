import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  // Registrar un evento de auditoría
  async logEvent(data: CreateAuditLogDto) {
    return this.prisma.auditoriaEvento.create({
      data: {
        tipoEvento: data.tipoEvento,
        descripcion: data.descripcion,
        adminId: data.adminId || null,
        eleccionId: data.eleccionId || null,
        metadata: data.metadata || {},
      },
    });
  }

  // Listar eventos con filtros y paginación
  async findAll(query: QueryAuditLogDto) {
    const { tipoEvento, adminId, eleccionId, page = 1, limit = 20 } = query; // Asignar valores por defecto aquí
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tipoEvento) where.tipoEvento = tipoEvento;
    if (adminId) where.adminId = adminId;
    if (eleccionId) where.eleccionId = eleccionId;

    const [data, total] = await Promise.all([
        this.prisma.auditoriaEvento.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        }),
        this.prisma.auditoriaEvento.count({ where }),
    ]);

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
    }

  // Obtener un evento específico
  async findOne(id: string) {
    const event = await this.prisma.auditoriaEvento.findUnique({
      where: { id },
    });
    if (!event) {
      throw new Error('Evento de auditoría no encontrado');
    }
    return event;
  }

  // Resumen de auditoría (estadísticas de eventos)
  async getSummary() {
    const [total, byType] = await Promise.all([
      this.prisma.auditoriaEvento.count(),
      this.prisma.auditoriaEvento.groupBy({
        by: ['tipoEvento'],
        _count: { id: true },
      }),
    ]);

    return {
      totalEventos: total,
      eventosPorTipo: byType.map(item => ({
        tipo: item.tipoEvento,
        cantidad: item._count.id,
      })),
    };
  }
}