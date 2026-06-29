import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';

export enum AdminRol {
  ADMIN_ELECTORAL = 'ADMIN_ELECTORAL',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class CreateAdminDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(AdminRol)
  rolAdmin?: AdminRol;
}
