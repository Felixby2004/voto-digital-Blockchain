import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ElectoralProxyMiddleware implements NestMiddleware {
  private electoralServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    const isDocker = this.config.get('DOCKER_ENV') === 'true';
    const host = isDocker ? 'electoral-service' : 'localhost';
    const port = isDocker ? 3000 : this.config.get('ELECTORAL_PORT', 3003);
    this.electoralServiceUrl = `http://${host}:${port}`;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (
      !req.originalUrl.startsWith('/api/elecciones') &&
      !req.originalUrl.startsWith('/api/voto')
    ) {
      return next();
    }

    const path = req.originalUrl.replace('/api', '');
    const url = `${this.electoralServiceUrl}${path}`;
    console.log(`[ElectoralProxy] ${req.method} ${req.originalUrl} → ${url}`);
    console.log(`[ElectoralProxy] Authorization header presente?`, !!req.headers['authorization']);

    try {
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

      console.log(`[ElectoralProxy] Respuesta ${response.status} para ${url}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[ElectoralProxy] Error proxying ${url}:`, error.message || error);
      if (error.response) {
        console.error(`[ElectoralProxy] Status error:`, error.response.status, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'El servicio electoral no está disponible',
        });
      }
    }
  }
}