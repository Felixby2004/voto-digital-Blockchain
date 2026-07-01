import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  private readonly publicPaths = [
    '/api/auth/login',
    '/api/auth/refresh',
    '/auth/login',
    '/auth/refresh',
  ];

  constructor(private config: ConfigService) {}

  private isPublic(path: string, originalUrl: string): boolean {
    const p = path.toLowerCase();
    const o = originalUrl.toLowerCase();
    if (p.endsWith('/health') || o.endsWith('/health')) return true;
    return (
      p.includes('/auth/login') ||
      p.includes('/auth/refresh') ||
      p.includes('/candidatos') ||
      o.includes('/auth/login') ||
      o.includes('/auth/refresh') ||
      o.includes('/candidatos')
    );
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (this.isPublic(req.path, req.originalUrl)) {
      return next();
    }

    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: 401,
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.slice(7);
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        message: 'Configuración JWT inválida',
      });
    }

    try {
      const payload = jwt.verify(token, secret) as unknown as {
        sub: string;
        rol: string;
        email?: string;
      };
      // Reenviar info a los servicios internos (defensa en profundidad: cada servicio re-verifica)
      req.headers['x-user-id'] = payload.sub;
      req.headers['x-user-rol'] = payload.rol;
      if (payload.email) req.headers['x-user-email'] = payload.email;
      next();
    } catch {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: 401,
        message: 'Token inválido o expirado',
      });
    }
  }
}
