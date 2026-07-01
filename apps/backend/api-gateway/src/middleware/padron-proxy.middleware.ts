import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PadronProxyMiddleware implements NestMiddleware {
  private padronServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    const isDocker = this.config.get('DOCKER_ENV') === 'true';
    const host = isDocker ? 'padron-simple' : 'localhost';
    const port = isDocker ? 3000 : this.config.get('PADRON_PORT', 3005);
    this.padronServiceUrl = `http://${host}:${port}`;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Solo interceptar rutas que empiecen con /api/padron
    if (!req.originalUrl.startsWith('/api/padron')) {
      return next();
    }

    try {
      // Eliminar el prefijo /api para enviar la ruta limpia al servicio
      const path = req.originalUrl.replace('/api', '');
      const url = `${this.padronServiceUrl}${path}`;
      const method = req.method;
      const headers = req.headers as Record<string, string>;
      const body = req.body;

      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          headers: {
            ...headers,
            host: undefined,
            'content-length': undefined,
          },
          data: body,
          maxRedirects: 0,
        }),
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'El servicio de padrón no está disponible',
        });
      }
    }
  }
}