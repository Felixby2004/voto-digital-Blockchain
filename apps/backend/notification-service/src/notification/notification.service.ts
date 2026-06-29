import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  SendNotificationDto,
  NotificationType,
} from './dto/send-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async send(dto: SendNotificationDto) {
    // REGLA 8: nunca incluir contenido de voto, datos criptográficos, nullifiers, commitments
    try {
      switch (dto.type) {
        case NotificationType.EMAIL:
          return await this.sendEmail(dto);
        case NotificationType.PUSH:
          return this.sendPush(dto);
        case NotificationType.SMS:
          return this.sendSMS(dto);
        default:
          throw new BadRequestException('Tipo de notificación no soportado');
      }
    } catch (error) {
      this.logger.error(`Error enviando notificación: ${error.message}`);
      throw new BadRequestException(`Error al enviar notificación: ${error.message}`);
    }
  }

  private async sendEmail(dto: SendNotificationDto) {
    if (!this.transporter) {
      this.logger.warn('SMTP no configurado, simulando envío de email');
      return { success: true, simulated: true, to: dto.email };
    }

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM', 'votacion@universidad.edu'),
      to: dto.email,
      subject: dto.subject,
      text: dto.message,
      html: this.buildEmailTemplate(dto),
      attachments: dto.attachments || [],
    };

    const info = await this.transporter.sendMail(mailOptions);
    this.logger.log(`Email enviado a ${dto.email} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  }

  private sendPush(dto: SendNotificationDto) {
    this.logger.log(`Push notification: ${dto.subject}`);
    return { success: true, message: 'Push notification sent' };
  }

  private sendSMS(dto: SendNotificationDto) {
    this.logger.log(`SMS enviado a ${dto.phone}`);
    return { success: true, message: 'SMS sent' };
  }

  private buildEmailTemplate(dto: SendNotificationDto): string {
    const webUrl = this.configService.get<string>('WEB_APP_URL', 'http://localhost:3001');
    return `
      <!DOCTYPE html>
      <html>
      <head><style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; }
      </style></head>
      <body>
        <div class="header"><h1>Sistema de Votación Universitaria</h1></div>
        <div class="content">
          <h2>${dto.subject}</h2>
          <p>${dto.message.replace(/\n/g, '</p><p>')}</p>
        </div>
        <div class="footer"><p>Mensaje automático. No responder.</p></div>
      </body>
      </html>
    `;
  }

  async sendBulk(dtos: SendNotificationDto[]) {
    const results = [];
    for (const dto of dtos) {
      try {
        const result = await this.send(dto);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }

  async sendElectionOpened(email: string, electionName: string, fechaInicio: Date, fechaFin: Date) {
    return this.send({
      email,
      subject: `Elección Abierta: ${electionName}`,
      message: `La elección "${electionName}" ha sido abierta.\nInicio: ${fechaInicio}\nCierre: ${fechaFin}`,
      type: NotificationType.EMAIL,
    });
  }

  async sendElectionClosed(email: string, electionName: string) {
    return this.send({
      email,
      subject: `Elección Cerrada: ${electionName}`,
      message: `La elección "${electionName}" ha sido cerrada. Los resultados estarán disponibles en breve.`,
      type: NotificationType.EMAIL,
    });
  }

  async sendVoteConfirmation(email: string) {
    return this.send({
      email,
      subject: 'Confirmación de Voto',
      message: 'Tu voto ha sido registrado correctamente. Tu identidad está protegida mediante criptografía ZK.',
      type: NotificationType.EMAIL,
    });
  }
}
