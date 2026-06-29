import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  tipoEvento: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsUUID()
  adminId?: string;

  @IsOptional()
  @IsUUID()
  eleccionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}