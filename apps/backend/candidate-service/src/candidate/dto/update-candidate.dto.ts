import { IsString, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsUrl()
  foto?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  facultad?: string;

  @IsOptional()
  @IsString()
  escuela?: string;

  @IsOptional()
  @IsUUID()
  eleccionId?: string;
}