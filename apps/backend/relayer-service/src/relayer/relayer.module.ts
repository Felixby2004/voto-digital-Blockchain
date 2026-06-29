import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RelayerController } from './relayer.controller';
import { RelayerService } from './relayer.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 0,
    }),
  ],
  controllers: [RelayerController],
  providers: [RelayerService],
  exports: [RelayerService],
})
export class RelayerModule {}
