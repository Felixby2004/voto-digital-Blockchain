import { Module } from '@nestjs/common';
import { VotoController } from './voto.controller';
import { VotoService } from './voto.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VotoController],
  providers: [VotoService, PrismaService],
})
export class VotoModule {}
