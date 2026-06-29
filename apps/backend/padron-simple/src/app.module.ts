import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PadronModule } from './padron/padron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      cache: true,
    }),
    PadronModule,
  ],
})
export class AppModule {}