import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RelayerModule } from './relayer/relayer.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env'],
      cache: true,
    }),
    RelayerModule,
  ],
})
export class AppModule {}
