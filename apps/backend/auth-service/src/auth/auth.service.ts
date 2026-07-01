import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { prisma } from 'database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // Validar credenciales: identificador puede ser DNI, código universitario o email (admin)
  async validateUser(identificador: string, password: string): Promise<any> {
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { dni: identificador },
          { email: identificador },
          { estudiante: { codigoUniversitario: identificador } },
        ],
      },
      include: {
        estudiante: true,
        profesor: true,
        administrador: true,
      },
    });

    if (!usuario) {
      this.logger.warn(`Intento de login fallido (usuario no encontrado)`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado !== 'ACTIVO') {
      this.logger.warn(`Intento de login en cuenta inactiva: rol=${usuario.rol}`);
      throw new UnauthorizedException('Cuenta inactiva o bloqueada');
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isPasswordValid) {
      // No se loguea el identificador para evitar correlación (REGLA 8)
      this.logger.warn(`Credenciales inválidas para rol=${usuario.rol}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ── BLOQUEO SI YA VOTÓ ──
    if (usuario.rol === 'ESTUDIANTE' || usuario.rol === 'PROFESOR') {
      const padronVotado = await prisma.padronElectoral.findFirst({
        where: {
          haVotado: true,
          ...(usuario.estudiante?.id && { estudianteId: usuario.estudiante.id }),
          ...(usuario.profesor?.id && { profesorId: usuario.profesor.id }),
        },
        include: { eleccion: true },
      });

      if (padronVotado) {
        this.logger.warn(`Usuario rol=${usuario.rol} YA VOTÓ en "${padronVotado.eleccion.nombre}"`);
        throw new UnauthorizedException('Ya emitiste tu voto. No puedes volver a ingresar.');
      }
    }

    let role = usuario.rol;
    let additionalInfo: Record<string, any> = {};

    if (usuario.estudiante) {
      additionalInfo = {
        estudianteId: usuario.estudiante.id,
        codigo: usuario.estudiante.codigoUniversitario,
        facultad: usuario.estudiante.facultad,
        escuela: usuario.estudiante.escuela,
        carrera: usuario.estudiante.carrera,
      };
    }

    if (usuario.profesor) {
      additionalInfo = {
        profesorId: usuario.profesor.id,
        codigo: usuario.profesor.codigoEmpleado,
        facultad: usuario.profesor.facultad,
      };
    }

    if (usuario.administrador) {
      additionalInfo = {
        adminId: usuario.administrador.id,
        adminRole: usuario.administrador.rol,
      };
    }

    this.logger.log(`Login exitoso rol=${role} (sin identificar usuario)`);

    return {
      id: usuario.id,
      email: usuario.email,
      dni: usuario.dni,
      nombre: usuario.nombre,
      rol: role,
      ...additionalInfo,
    };
  }

  // Login combinado: valida credenciales y genera tokens
  async login(identificador: string, password: string) {
    const user = await this.validateUser(identificador, password);

    const payload = {
      sub: user.id,
      email: user.email,
      dni: user.dni ?? null,
      rol: user.rol,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    // Buscar elección activa en la que el usuario esté inscrito (solo votantes)
    let eleccionActivaId: string | null = null;
    if (user.rol === 'ESTUDIANTE' || user.rol === 'PROFESOR') {
      const padron = await prisma.padronElectoral.findFirst({
        where: {
          haVotado: false,
          eleccion: { estado: 'ACTIVA' },
          ...(user.estudianteId && { estudianteId: user.estudianteId }),
          ...(user.profesorId && { profesorId: user.profesorId }),
        },
        select: { eleccionId: true },
      });
      eleccionActivaId = padron?.eleccionId ?? null;
    }

    return {
      accessToken,
      refreshToken,
      eleccionActivaId,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        dni: user.dni ?? null,
        rol: user.rol,
        ...(user.estudianteId && { estudianteId: user.estudianteId }),
        ...(user.profesorId && { profesorId: user.profesorId }),
        ...(user.adminId && { adminId: user.adminId }),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!usuario || usuario.estado !== 'ACTIVO') {
        throw new UnauthorizedException('Usuario no válido');
      }

      const newPayload = {
        sub: usuario.id,
        email: usuario.email,
        dni: usuario.dni ?? null,
        rol: usuario.rol,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRATION', '15m'),
      });

      return { accessToken: newAccessToken, refreshToken };
    } catch (error) {
      this.logger.warn('Refresh token inválido o expirado');
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
