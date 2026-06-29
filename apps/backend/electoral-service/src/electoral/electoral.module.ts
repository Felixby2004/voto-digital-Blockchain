import { Module } from '@nestjs/common';
import { ElectoralController } from './electoral.controller';
import { ElectoralService } from './electoral.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ElectoralController],
  providers: [ElectoralService, PrismaService],
  exports: [ElectoralService],
})
export class ElectoralModule {}