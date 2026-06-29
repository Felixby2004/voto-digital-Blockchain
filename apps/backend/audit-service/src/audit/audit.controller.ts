import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Post('log')
  @HttpCode(HttpStatus.CREATED)
  async logEvent(@Body() dto: CreateAuditLogDto) {
    return this.auditService.logEvent(dto);
  }

  @Get('events')
  async findAll(@Query() query: QueryAuditLogDto) {
    return this.auditService.findAll(query);
  }

  @Get('events/:id')
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Get('summary')
  async getSummary() {
    return this.auditService.getSummary();
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'audit-service', timestamp: new Date().toISOString() };
  }
}