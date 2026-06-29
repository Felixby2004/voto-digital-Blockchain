import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEleccionDto } from './dto/create-eleccion.dto';
import { UpdateEleccionDto } from './dto/update-eleccion.dto';

@Injectable()
export class ElectoralService {
  constructor(private prisma: PrismaService) {}

  // Crear elección
  async create(data: CreateEleccionDto) {
    const eleccion = await this.prisma.eleccion.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
        facultadesIds: data.facultadesIds || [],
        escuelasIds: data.escuelasIds || [],
        carrerasIds: data.carrerasIds || [],
        estado: 'BORRADOR',
      },
    });
    return eleccion;
  }

  // Listar todas las elecciones
  async findAll() {
    return this.prisma.eleccion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        candidatos: true,
        padrones: {
          include: {
            estudiante: { include: { usuario: true } },
            profesor: { include: { usuario: true } },
          },
        },
      },
    });
  }

  // Obtener una elección por ID
  async findOne(id: string) {
    const eleccion = await this.prisma.eleccion.findUnique({
      where: { id },
      include: {
        candidatos: true,
        padrones: {
          include: {
            estudiante: { include: { usuario: true } },
            profesor: { include: { usuario: true } },
          },
        },
      },
    });
    if (!eleccion) throw new NotFoundException('Elección no encontrada');
    return eleccion;
  }

  // Actualizar elección (solo si está en BORRADOR o PROGRAMADA)
  async update(id: string, data: UpdateEleccionDto) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'BORRADOR' && eleccion.estado !== 'PROGRAMADA') {
        throw new BadRequestException('Solo se pueden modificar elecciones en estado BORRADOR o PROGRAMADA');
    }

    // Construir objeto de actualización solo con campos definidos
    const updateData: any = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.fechaInicio !== undefined) updateData.fechaInicio = new Date(data.fechaInicio);
    if (data.fechaFin !== undefined) updateData.fechaFin = new Date(data.fechaFin);
    if (data.facultadesIds !== undefined) updateData.facultadesIds = data.facultadesIds;
    if (data.escuelasIds !== undefined) updateData.escuelasIds = data.escuelasIds;
    if (data.carrerasIds !== undefined) updateData.carrerasIds = data.carrerasIds;

    const updated = await this.prisma.eleccion.update({
        where: { id },
        data: updateData,
    });
    return updated;
    }

  // Activar elección (cambiar a ACTIVA)
  async activar(id: string) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'PROGRAMADA' && eleccion.estado !== 'BORRADOR') {
      throw new BadRequestException('Solo se pueden activar elecciones en estado PROGRAMADA o BORRADOR');
    }

    if (!eleccion.fechaInicio || !eleccion.fechaFin) {
      throw new BadRequestException('La elección debe tener fechas definidas para activarse');
    }

    return this.prisma.eleccion.update({
      where: { id },
      data: { estado: 'ACTIVA' },
    });
  }

  // Cerrar elección (cambiar a CERRADA)
  async cerrar(id: string) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'ACTIVA') {
      throw new BadRequestException('Solo se pueden cerrar elecciones activas');
    }
    return this.prisma.eleccion.update({
      where: { id },
      data: { estado: 'CERRADA' },
    });
  }
}