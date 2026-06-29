import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Controller('candidatos')
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCandidateDto) {
    return this.candidateService.create(dto);
  }

  @Get()
  findAll(@Query('eleccionId') eleccionId?: string) {
    return this.candidateService.findAll(eleccionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.candidateService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.candidateService.remove(id);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'candidate-service', timestamp: new Date().toISOString() };
  }
}