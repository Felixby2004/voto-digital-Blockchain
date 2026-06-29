import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdminDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existe) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const rolAdmin = dto.rolAdmin || 'ADMIN_ELECTORAL';
    const rolUsuario = rolAdmin === 'SUPER_ADMIN' ? 'SUPER_ADMINISTRADOR' : 'ADMINISTRADOR_ELECTORAL';

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        rol: rolUsuario,
        estado: 'ACTIVO',
        administrador: {
          create: { rol: rolAdmin },
        },
      },
      include: { administrador: true },
    });

    this.logger.log(`Admin creado: ${usuario.id} (rol=${rolAdmin})`);
    return usuario;
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      where: {
        rol: { in: ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR'] },
      },
      include: { administrador: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { administrador: true },
    });
    if (!usuario) throw new NotFoundException('Administrador no encontrado');
    return usuario;
  }

  async update(id: string, dto: UpdateAdminDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.email !== undefined) {
      const existe = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
      if (existe && existe.id !== id) {
        throw new BadRequestException('Email ya en uso');
      }
      data.email = dto.email;
    }

    if (dto.rolAdmin !== undefined) {
      data.rol = dto.rolAdmin === 'SUPER_ADMIN' ? 'SUPER_ADMINISTRADOR' : 'ADMINISTRADOR_ELECTORAL';
      data.administrador = { update: { rol: dto.rolAdmin } };
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data,
      include: { administrador: true },
    });
    this.logger.log(`Admin actualizado: ${id}`);
    return updated;
  }

  async activate(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { estado: 'ACTIVO' },
    });
    this.logger.log(`Admin activado: ${id}`);
    return updated;
  }

  async deactivate(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
    this.logger.log(`Admin desactivado: ${id}`);
    return updated;
  }
}
