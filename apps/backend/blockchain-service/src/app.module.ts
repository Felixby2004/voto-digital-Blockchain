import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import configuration from './config/configuration';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../../../.env')],
      cache: true,
    }),
    BlockchainModule,
  ],
})
export class AppModule {}
