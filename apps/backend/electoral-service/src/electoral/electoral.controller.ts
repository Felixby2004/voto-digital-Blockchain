import { Controller, Get, Post, Put, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ElectoralService } from './electoral.service';
import { CreateEleccionDto } from './dto/create-eleccion.dto';
import { UpdateEleccionDto } from './dto/update-eleccion.dto';
import { Public, Roles } from 'common';

const ADMIN_ROLES = ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR'];

@Controller('elecciones')
export class ElectoralController {
  constructor(private electoralService: ElectoralService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'electoral-service', timestamp: new Date().toISOString() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ADMIN_ROLES)
  create(@Body() dto: CreateEleccionDto) {
    return this.electoralService.create(dto);
  }

  @Get()
  async findAll() {
    console.log('[ElectoralController] findAll() invocado');
    const result = await this.electoralService.findAll();
    console.log('[ElectoralController] findAll() devolvió', Array.isArray(result) ? result.length : 'no-array', 'elementos');
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electoralService.findOne(id);
  }

  @Put(':id')
  @Roles(...ADMIN_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateEleccionDto) {
    return this.electoralService.update(id, dto);
  }

  @Patch(':id/programar')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  programar(@Param('id') id: string) {
    return this.electoralService.programar(id);
  }

  @Patch(':id/activar')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  activar(@Param('id') id: string) {
    return this.electoralService.activar(id);
  }

  @Patch(':id/cerrar')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  cerrar(@Param('id') id: string) {
    return this.electoralService.cerrar(id);
  }

  @Patch(':id/finalizar')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  finalizar(@Param('id') id: string) {
    return this.electoralService.finalizar(id);
  }

  @Patch(':id/archivar')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_ROLES)
  archivar(@Param('id') id: string) {
    return this.electoralService.archivar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...ADMIN_ROLES)
  delete(@Param('id') id: string) {
    return this.electoralService.delete(id);
  }
}
