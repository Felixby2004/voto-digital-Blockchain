import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Public, Roles } from 'common';

const ADMIN_ROLES = ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR'];

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() };
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  async send(@Body() dto: SendNotificationDto) {
    return this.notificationService.send(dto);
  }

  @Post('send-bulk')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  async sendBulk(@Body() dtos: SendNotificationDto[]) {
    return this.notificationService.sendBulk(dtos);
  }

  @Post('election-opened')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  async electionOpened(
    @Body() body: { email: string; electionName: string; fechaInicio: Date; fechaFin: Date },
  ) {
    return this.notificationService.sendElectionOpened(
      body.email,
      body.electionName,
      body.fechaInicio,
      body.fechaFin,
    );
  }

  @Post('election-closed')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  async electionClosed(@Body() body: { email: string; electionName: string }) {
    return this.notificationService.sendElectionClosed(body.email, body.electionName);
  }

  @Post('vote-confirmation')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  async voteConfirmation(@Body() body: { email: string }) {
    return this.notificationService.sendVoteConfirmation(body.email);
  }
}
