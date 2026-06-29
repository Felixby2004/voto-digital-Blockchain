import { All, Controller, Req, Res, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('padron')
export class PadronProxyController {
  private padronServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    const port = this.config.get('PADRON_PORT', 3005);
    this.padronServiceUrl = `http://localhost:${port}`;
  }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    try {
      // Eliminamos el prefijo /api para que la ruta sea relativa al servicio destino
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
      console.error('❌ Error en proxy padron:', error.message);
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