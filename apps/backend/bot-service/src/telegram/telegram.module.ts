import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { GroqModule } from '../groq/groq.module';
import { VotingModule } from '../voting/voting.module';

@Module({
  imports: [GroqModule, VotingModule],
  providers: [TelegramService],
})
export class TelegramModule {}
