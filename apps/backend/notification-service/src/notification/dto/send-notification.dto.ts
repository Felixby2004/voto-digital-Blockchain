import { IsString, IsEmail, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}

export class SendNotificationDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsArray()
  attachments?: Array<{
    filename: string;
    content?: string;
    path?: string;
  }>;
}
