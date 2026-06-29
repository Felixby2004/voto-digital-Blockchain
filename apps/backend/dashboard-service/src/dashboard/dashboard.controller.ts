import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('eleccion/:id')
  getEleccionStats(@Param('id') id: string) {
    return this.dashboardService.getEleccionStats(id);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'dashboard-service', timestamp: new Date().toISOString() };
  }
}