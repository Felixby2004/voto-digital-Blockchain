import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VotingService } from './voting.service';

@Module({
  imports: [HttpModule],
  providers: [VotingService],
  exports: [VotingService],
})
export class VotingModule {}
