import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEleccionDto } from './dto/create-eleccion.dto';
import { UpdateEleccionDto } from './dto/update-eleccion.dto';

@Injectable()
export class ElectoralService {
  private readonly logger = new Logger(ElectoralService.name);

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
    this.logger.log(`Elección creada: ${eleccion.id} (nombre="${eleccion.nombre}")`);
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
    this.logger.log(`Elección actualizada: ${id}`);
    return updated;
  }

  // Programar elección: BORRADOR → PROGRAMADA (requiere fechas)
  async programar(id: string) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'BORRADOR') {
      throw new BadRequestException('Solo se pueden programar elecciones en estado BORRADOR');
    }
    if (!eleccion.fechaInicio || !eleccion.fechaFin) {
      throw new BadRequestException('La elección debe tener fechas definidas para programarse');
    }
    const updated = await this.prisma.eleccion.update({
      where: { id },
      data: { estado: 'PROGRAMADA' },
    });
    this.logger.log(`Elección programada: ${id}`);
    return updated;
  }

  // Activar elección: PROGRAMADA|BORRADOR → ACTIVA
  async activar(id: string) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'PROGRAMADA' && eleccion.estado !== 'BORRADOR') {
      throw new BadRequestException('Solo se pueden activar elecciones en estado PROGRAMADA o BORRADOR');
    }
    if (!eleccion.fechaInicio || !eleccion.fechaFin) {
      throw new BadRequestException('La elección debe tener fechas definidas para activarse');
    }
    const updated = await this.prisma.eleccion.update({
      where: { id },
      data: { estado: 'ACTIVA' },
    });
    this.logger.log(`Elección activada: ${id}`);
    return updated;
  }

  // Cerrar elección: ACTIVA → CERRADA
  async cerrar(id: string) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'ACTIVA') {
      throw new BadRequestException('Solo se pueden cerrar elecciones activas');
    }
    const updated = await this.prisma.eleccion.update({
      where: { id },
      data: { estado: 'CERRADA' },
    });
    this.logger.log(`Elección cerrada: ${id}`);
    return updated;
  }

  // Finalizar elección: CERRADA → FINALIZADA
  async finalizar(id: string) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'CERRADA') {
      throw new BadRequestException('Solo se pueden finalizar elecciones cerradas');
    }
    const updated = await this.prisma.eleccion.update({
      where: { id },
      data: { estado: 'FINALIZADA' },
    });
    this.logger.log(`Elección finalizada: ${id}`);
    return updated;
  }

  // Archivar elección: FINALIZADA → ARCHIVADA
  async archivar(id: string) {
    const eleccion = await this.findOne(id);
    if (eleccion.estado !== 'FINALIZADA') {
      throw new BadRequestException('Solo se pueden archivar elecciones finalizadas');
    }
    const updated = await this.prisma.eleccion.update({
      where: { id },
      data: { estado: 'ARCHIVADA' },
    });
    this.logger.log(`Elección archivada: ${id}`);
    return updated;
  }
}
