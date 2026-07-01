import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { Public, Roles } from 'common';

const ADMIN_ROLES = ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR'];

@Controller('candidatos')
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'candidate-service', timestamp: new Date().toISOString() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ADMIN_ROLES)
  create(@Body() dto: CreateCandidateDto) {
    return this.candidateService.create(dto);
  }

  @Public()
  @Get()
  async findAll(@Query('eleccionId') eleccionId?: string) {
    console.log('[CandidateController] findAll() invocado — eleccionId:', eleccionId);
    const result = await this.candidateService.findAll(eleccionId);
    console.log('[CandidateController] findAll() devolvió', Array.isArray(result) ? result.length : 'no-array', 'elementos');
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateService.findOne(id);
  }

  @Put(':id')
  @Roles(...ADMIN_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidateService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...ADMIN_ROLES)
  async remove(@Param('id') id: string) {
    await this.candidateService.remove(id);
  }
}
