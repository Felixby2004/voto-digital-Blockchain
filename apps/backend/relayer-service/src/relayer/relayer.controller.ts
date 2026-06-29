import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RelayerService } from './relayer.service';
import { RelayVoteDto } from './dto/relay-vote.dto';

@Controller('relayer')
export class RelayerController {
  constructor(private relayerService: RelayerService) {}

  @Post('relay')
  @HttpCode(HttpStatus.ACCEPTED)
  async relayVote(@Body() dto: RelayVoteDto) {
    return this.relayerService.relayVote(dto);
  }

  @Post('health')
  health() {
    return {
      status: 'ok',
      service: 'relayer-service',
      timestamp: new Date().toISOString(),
    };
  }
}
