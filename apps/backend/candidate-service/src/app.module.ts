import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CandidateModule } from './candidate/candidate.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      cache: true,
    }),
    CandidateModule,
  ],
})
export class AppModule {}