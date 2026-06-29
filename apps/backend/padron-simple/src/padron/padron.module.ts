import { Module } from '@nestjs/common';
import { PadronController } from './padron.controller';
import { PadronService } from './padron.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PadronController],
  providers: [PadronService, PrismaService],
  exports: [PadronService],
})
export class PadronModule {}