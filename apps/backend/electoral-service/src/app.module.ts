import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElectoralModule } from './electoral/electoral.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      cache: true,
    }),
    ElectoralModule,
  ],
})
export class AppModule {}