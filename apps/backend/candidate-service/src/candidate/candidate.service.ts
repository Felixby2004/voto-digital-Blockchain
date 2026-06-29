import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

  // Verificar que la elección existe y está en estado modificable
  private async validateEleccion(id: string) {
    const eleccion = await this.prisma.eleccion.findUnique({
      where: { id },
    });
    if (!eleccion) {
      throw new NotFoundException('Elección no encontrada');
    }
    if (eleccion.estado !== 'BORRADOR' && eleccion.estado !== 'PROGRAMADA') {
      throw new BadRequestException('Solo se pueden gestionar candidatos en elecciones en estado BORRADOR o PROGRAMADA');
    }
    return eleccion;
  }

  // Crear candidato
  async create(data: CreateCandidateDto) {
    await this.validateEleccion(data.eleccionId);

    return this.prisma.candidato.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        foto: data.foto,
        descripcion: data.descripcion,
        cargo: data.cargo,
        facultad: data.facultad,
        escuela: data.escuela,
        eleccionId: data.eleccionId,
        estado: 'ACTIVO',
      },
    });
  }

  // Listar todos los candidatos (con filtro opcional por elección)
  async findAll(eleccionId?: string) {
    return this.prisma.candidato.findMany({
      where: eleccionId ? { eleccionId } : {},
      include: { eleccion: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener un candidato por ID
  async findOne(id: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id },
      include: { eleccion: true },
    });
    if (!candidato) throw new NotFoundException('Candidato no encontrado');
    return candidato;
  }

  // Actualizar candidato (solo si la elección está en BORRADOR o PROGRAMADA)
  async update(id: string, data: UpdateCandidateDto) {
    const candidato = await this.findOne(id);
    await this.validateEleccion(candidato.eleccionId);

    const updateData: any = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.apellido !== undefined) updateData.apellido = data.apellido;
    if (data.foto !== undefined) updateData.foto = data.foto;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.cargo !== undefined) updateData.cargo = data.cargo;
    if (data.facultad !== undefined) updateData.facultad = data.facultad;
    if (data.escuela !== undefined) updateData.escuela = data.escuela;

    return this.prisma.candidato.update({
      where: { id },
      data: updateData,
    });
  }

  // Eliminar candidato (solo si la elección está en BORRADOR o PROGRAMADA)
  async remove(id: string) {
    const candidato = await this.findOne(id);
    await this.validateEleccion(candidato.eleccionId);

    return this.prisma.candidato.delete({
      where: { id },
    });
  }
}