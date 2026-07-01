// ⚠️  MUST be first — loads .env BEFORE PrismaClient is instantiated at module-import time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env'), override: true });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter, LoggingInterceptor } from 'common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = config.get<number>('CANDIDATE_PORT', 3004);
  await app.listen(port);
  console.log(`👤 Candidate Service corriendo en http://localhost:${port}`);
}
bootstrap();
