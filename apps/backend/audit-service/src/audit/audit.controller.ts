import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { Public, Roles } from 'common';

const READ_ROLES = ['AUDITOR', 'ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR'];
const WRITE_ROLES = ['SUPER_ADMINISTRADOR'];

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'audit-service', timestamp: new Date().toISOString() };
  }

  @Post('log')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...WRITE_ROLES)
  async logEvent(@Body() dto: CreateAuditLogDto) {
    return this.auditService.logEvent(dto);
  }

  @Get('events')
  @Roles(...READ_ROLES)
  async findAll(@Query() query: QueryAuditLogDto) {
    return this.auditService.findAll(query);
  }

  @Get('events/:id')
  @Roles(...READ_ROLES)
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Get('summary')
  @Roles(...READ_ROLES)
  async getSummary() {
    return this.auditService.getSummary();
  }
}
