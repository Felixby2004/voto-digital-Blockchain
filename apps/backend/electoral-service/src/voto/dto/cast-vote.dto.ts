import { IsString, IsNotEmpty } from 'class-validator';

export class CastVoteDto {
  @IsString()
  @IsNotEmpty()
  candidatoId: string;

  @IsString()
  @IsNotEmpty()
  eleccionId: string;
}
