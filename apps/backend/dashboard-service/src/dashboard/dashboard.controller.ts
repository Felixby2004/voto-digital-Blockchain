import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Public, Roles } from 'common';

const READ_ROLES = ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR', 'AUDITOR'];

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'dashboard-service', timestamp: new Date().toISOString() };
  }

  @Get('stats')
  @Roles(...READ_ROLES)
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('eleccion/:id')
  @Roles(...READ_ROLES)
  getEleccionStats(@Param('id') id: string) {
    return this.dashboardService.getEleccionStats(id);
  }
}
