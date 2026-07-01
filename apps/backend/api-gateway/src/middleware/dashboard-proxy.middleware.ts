import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardProxyMiddleware implements NestMiddleware {
  private dashboardServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    const isDocker = this.config.get('DOCKER_ENV') === 'true';
    const host = isDocker ? 'dashboard-service' : 'localhost';
    const port = isDocker ? 3000 : this.config.get('DASHBOARD_PORT', 3007);
    this.dashboardServiceUrl = `http://${host}:${port}`;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.originalUrl.startsWith('/api/dashboard')) {
      return next();
    }

    try {
      const path = req.originalUrl.replace('/api', '');
      const url = `${this.dashboardServiceUrl}${path}`;
      const method = req.method;
      const headers = req.headers as Record<string, string>;
      const body = req.body;

      // Configurar validateStatus para aceptar 304 como éxito (no lanzar error)
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
          validateStatus: (status) => status >= 200 && status < 400, // Acepta 304
        }),
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      // Solo errores de red o 5xx
      console.error('❌ Error en proxy dashboard:', error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'El servicio de dashboard no está disponible',
        });
      }
    }
  }
}