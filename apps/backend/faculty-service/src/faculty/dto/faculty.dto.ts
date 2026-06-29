import { IsString, IsOptional } from 'class-validator';

export class CreateFacultadDto {
  @IsString()
  nombre: string;
}

export class CreateEscuelaDto {
  @IsString()
  nombre: string;

  @IsString()
  facultadId: string;
}

export class CreateCarreraDto {
  @IsString()
  nombre: string;

  @IsString()
  escuelaId: string;
}

export class UpdateFacultadDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}

export class UpdateEscuelaDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}

export class UpdateCarreraDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}
