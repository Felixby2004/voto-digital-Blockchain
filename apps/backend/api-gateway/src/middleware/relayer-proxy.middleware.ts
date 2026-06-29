import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RelayerProxyMiddleware implements NestMiddleware {
  private relayerServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    const port = this.config.get('RELAYER_PORT', 3012);
    this.relayerServiceUrl = `http://localhost:${port}`;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Solo interceptar rutas que empiecen con /api/relayer
    if (!req.originalUrl.startsWith('/api/relayer')) {
      return next();
    }

    try {
      // Eliminar el prefijo /api para enviar la ruta limpia al servicio
      const path = req.originalUrl.replace('/api', '');
      const url = `${this.relayerServiceUrl}${path}`;
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
    } catch (error: any) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'El servicio de relayer no está disponible',
        });
      }
    }
  }
}
