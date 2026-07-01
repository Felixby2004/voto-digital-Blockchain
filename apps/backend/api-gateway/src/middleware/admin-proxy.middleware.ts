import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdminProxyMiddleware implements NestMiddleware {
  private adminServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    const isDocker = this.config.get('DOCKER_ENV') === 'true';
    const host = isDocker ? 'admin-service' : 'localhost';
    const port = isDocker ? 3000 : this.config.get('ADMIN_PORT', 3013);
    this.adminServiceUrl = `http://${host}:${port}`;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.originalUrl.startsWith('/api/admin')) {
      return next();
    }

    try {
      const path = req.originalUrl.replace('/api', '');
      const url = `${this.adminServiceUrl}${path}`;
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
          message: 'El servicio administrativo no está disponible',
        });
      }
    }
  }
}
