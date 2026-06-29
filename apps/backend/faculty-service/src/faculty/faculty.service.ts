import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFacultadDto,
  CreateEscuelaDto,
  CreateCarreraDto,
  UpdateFacultadDto,
  UpdateEscuelaDto,
  UpdateCarreraDto,
} from './dto/faculty.dto';

@Injectable()
export class FacultyService {
  private readonly logger = new Logger(FacultyService.name);

  constructor(private prisma: PrismaService) {}

  // ===================== FACULTADES =====================
  async createFacultad(dto: CreateFacultadDto) {
    const existe = await this.prisma.facultad.findUnique({ where: { nombre: dto.nombre } });
    if (existe) throw new BadRequestException('La facultad ya existe');
    const f = await this.prisma.facultad.create({ data: { nombre: dto.nombre } });
    this.logger.log(`Facultad creada: ${f.id}`);
    return f;
  }

  async findAllFacultades() {
    return this.prisma.facultad.findMany({
      include: { escuelas: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneFacultad(id: string) {
    const f = await this.prisma.facultad.findUnique({
      where: { id },
      include: { escuelas: true },
    });
    if (!f) throw new NotFoundException('Facultad no encontrada');
    return f;
  }

  async updateFacultad(id: string, dto: UpdateFacultadDto) {
    await this.findOneFacultad(id);
    return this.prisma.facultad.update({ where: { id }, data: dto });
  }

  // ===================== ESCUELAS =====================
  async createEscuela(dto: CreateEscuelaDto) {
    await this.findOneFacultad(dto.facultadId);
    const e = await this.prisma.escuela.create({
      data: { nombre: dto.nombre, facultadId: dto.facultadId },
      include: { facultad: true },
    });
    this.logger.log(`Escuela creada: ${e.id}`);
    return e;
  }

  async findAllEscuelas(facultadId?: string) {
    return this.prisma.escuela.findMany({
      where: facultadId ? { facultadId } : {},
      include: { facultad: true, carreras: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneEscuela(id: string) {
    const e = await this.prisma.escuela.findUnique({
      where: { id },
      include: { facultad: true, carreras: true },
    });
    if (!e) throw new NotFoundException('Escuela no encontrada');
    return e;
  }

  async updateEscuela(id: string, dto: UpdateEscuelaDto) {
    await this.findOneEscuela(id);
    return this.prisma.escuela.update({ where: { id }, data: dto });
  }

  // ===================== CARRERAS =====================
  async createCarrera(dto: CreateCarreraDto) {
    await this.findOneEscuela(dto.escuelaId);
    const c = await this.prisma.carrera.create({
      data: { nombre: dto.nombre, escuelaId: dto.escuelaId },
      include: { escuela: true },
    });
    this.logger.log(`Carrera creada: ${c.id}`);
    return c;
  }

  async findAllCarreras(escuelaId?: string) {
    return this.prisma.carrera.findMany({
      where: escuelaId ? { escuelaId } : {},
      include: { escuela: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneCarrera(id: string) {
    const c = await this.prisma.carrera.findUnique({
      where: { id },
      include: { escuela: true },
    });
    if (!c) throw new NotFoundException('Carrera no encontrada');
    return c;
  }

  async updateCarrera(id: string, dto: UpdateCarreraDto) {
    await this.findOneCarrera(id);
    return this.prisma.carrera.update({ where: { id }, data: dto });
  }
}
