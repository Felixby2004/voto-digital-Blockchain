import { IsString, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsOptional()
  @IsUrl()
  foto?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  cargo: string;

  @IsOptional()
  @IsString()
  facultad?: string;

  @IsOptional()
  @IsString()
  escuela?: string;

  @IsUUID()
  eleccionId: string;
}