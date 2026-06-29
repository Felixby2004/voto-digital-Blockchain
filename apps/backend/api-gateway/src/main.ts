import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as rateLimit from 'express-rate-limit'; // Importación con * como namespace
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Seguridad
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Rate Limiting global - usa rateLimit.default si es necesario
  app.use(
    rateLimit.default({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // 100 solicitudes por IP
      message: 'Demasiadas peticiones, por favor intente más tarde.',
    }),
  );

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = config.get<number>('GATEWAY_PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API Gateway corriendo en http://localhost:${port}`);
}
bootstrap();