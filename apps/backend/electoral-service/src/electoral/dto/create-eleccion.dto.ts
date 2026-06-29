import { IsString, IsOptional, IsDateString, IsArray, IsEnum } from 'class-validator';

export class CreateEleccionDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facultadesIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  escuelasIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  carrerasIds?: string[];
}