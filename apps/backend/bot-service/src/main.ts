import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // We don't necessarily need to listen on an HTTP port if it's purely a worker/bot, 
  // but many hosting environments require it.
  await app.listen(3015);
  console.log(`Bot Service is running on: ${await app.getUrl()}`);
}
bootstrap();
