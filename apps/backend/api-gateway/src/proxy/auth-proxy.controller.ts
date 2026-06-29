import { All, Controller, Req, Res, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthProxyController {
  private authServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    const port = this.config.get('AUTH_PORT', 3001);
    this.authServiceUrl = `http://localhost:${port}`;
  }

  @All('/*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    try {
      // Construir la URL del Auth Service
      const url = `${this.authServiceUrl}${req.originalUrl}`;
      
      // Obtener el método, headers y body
      const method = req.method;
      const headers = req.headers as Record<string, string>;
      const body = req.body;

      // Hacer la petición al Auth Service
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          headers: {
            ...headers,
            // Quitamos headers que puedan causar problemas
            host: undefined,
            'content-length': undefined,
          },
          data: body,
          // No seguimos redirecciones para mantener el control
          maxRedirects: 0,
        }),
      );

      // Reenviar el status y los datos
      res.status(response.status).json(response.data);
    } catch (error) {
      // Si el Auth Service no responde o hay error
      if (error.response) {
        // El servicio respondió con un error
        res.status(error.response.status).json(error.response.data);
      } else {
        // Error de conexión o timeout
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'El servicio de autenticación no está disponible',
        });
      }
    }
  }
}