import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { AdminRol } from './create-admin.dto';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(AdminRol)
  rolAdmin?: AdminRol;
}
