import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { VotoService } from './voto.service';
import { CastVoteDto } from './dto/cast-vote.dto';

@Controller('voto')
export class VotoController {
  constructor(private votoService: VotoService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async castVote(@Body() dto: CastVoteDto, @Req() req: any) {
    const user = req.user;
    if (!user?.id) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Usuario no autenticado',
      };
    }

    const result = await this.votoService.castVote({
      candidatoId: dto.candidatoId,
      eleccionId: dto.eleccionId,
      userId: user.id,
    });

    return result;
  }
}
