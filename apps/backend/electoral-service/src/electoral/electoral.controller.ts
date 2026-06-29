import { Controller, Get, Post, Put, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ElectoralService } from './electoral.service';
import { CreateEleccionDto } from './dto/create-eleccion.dto';
import { UpdateEleccionDto } from './dto/update-eleccion.dto';

@Controller('elecciones')
export class ElectoralController {
  constructor(private electoralService: ElectoralService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEleccionDto) {
    return this.electoralService.create(dto);
  }

  @Get()
  findAll() {
    return this.electoralService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electoralService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEleccionDto) {
    return this.electoralService.update(id, dto);
  }

  @Patch(':id/activar')
  @HttpCode(HttpStatus.OK)
  activar(@Param('id') id: string) {
    return this.electoralService.activar(id);
  }

  @Patch(':id/cerrar')
  @HttpCode(HttpStatus.OK)
  cerrar(@Param('id') id: string) {
    return this.electoralService.cerrar(id);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'electoral-service', timestamp: new Date().toISOString() };
  }
}