import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { prisma } from 'database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        estudiante: true,
        administrador: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar estado
    if (usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Cuenta inactiva o bloqueada');
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Determinar el rol y construir el payload
    let role = usuario.rol;
    let additionalInfo = {};

    if (usuario.estudiante) {
      additionalInfo = {
        estudianteId: usuario.estudiante.id,
        codigo: usuario.estudiante.codigoUniversitario,
        facultad: usuario.estudiante.facultad,
        escuela: usuario.estudiante.escuela,
        carrera: usuario.estudiante.carrera,
      };
    }

    if (usuario.administrador) {
      additionalInfo = {
        adminId: usuario.administrador.id,
        adminRole: usuario.administrador.rol,
      };
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: role,
      ...additionalInfo,
    };
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };

    // Generar tokens
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        ...(user.estudianteId && { estudianteId: user.estudianteId }),
        ...(user.adminId && { adminId: user.adminId }),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verificar el refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Buscar el usuario para asegurar que sigue activo
      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!usuario || usuario.estado !== 'ACTIVO') {
        throw new UnauthorizedException('Usuario no válido');
      }

      // Generar nuevo access token (y refresh opcional)
      const newPayload = {
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRATION', '15m'),
      });

      // Opcionalmente, rotar refresh token también (lo haremos simple por ahora)
      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}