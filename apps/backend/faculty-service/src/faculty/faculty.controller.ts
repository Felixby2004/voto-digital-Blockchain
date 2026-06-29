import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import {
  CreateFacultadDto,
  CreateEscuelaDto,
  CreateCarreraDto,
  UpdateFacultadDto,
  UpdateEscuelaDto,
  UpdateCarreraDto,
} from './dto/faculty.dto';
import { Public, Roles } from 'common';

const ADMIN_ROLES = ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR'];

@Controller()
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'faculty-service', timestamp: new Date().toISOString() };
  }

  // ===================== FACULTADES =====================
  @Get('facultades')
  findAllFacultades() {
    return this.facultyService.findAllFacultades();
  }

  @Get('facultades/:id')
  findOneFacultad(@Param('id') id: string) {
    return this.facultyService.findOneFacultad(id);
  }

  @Get('facultades/:id/escuelas')
  findEscuelasByFacultad(@Param('id') id: string) {
    return this.facultyService.findAllEscuelas(id);
  }

  @Post('facultades')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ADMIN_ROLES)
  createFacultad(@Body() dto: CreateFacultadDto) {
    return this.facultyService.createFacultad(dto);
  }

  @Patch('facultades/:id')
  @Roles(...ADMIN_ROLES)
  updateFacultad(@Param('id') id: string, @Body() dto: UpdateFacultadDto) {
    return this.facultyService.updateFacultad(id, dto);
  }

  // ===================== ESCUELAS =====================
  @Get('escuelas')
  findAllEscuelas(@Query('facultadId') facultadId?: string) {
    return this.facultyService.findAllEscuelas(facultadId);
  }

  @Get('escuelas/:id')
  findOneEscuela(@Param('id') id: string) {
    return this.facultyService.findOneEscuela(id);
  }

  @Get('escuelas/:id/carreras')
  findCarrerasByEscuela(@Param('id') id: string) {
    return this.facultyService.findAllCarreras(id);
  }

  @Post('escuelas')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ADMIN_ROLES)
  createEscuela(@Body() dto: CreateEscuelaDto) {
    return this.facultyService.createEscuela(dto);
  }

  @Patch('escuelas/:id')
  @Roles(...ADMIN_ROLES)
  updateEscuela(@Param('id') id: string, @Body() dto: UpdateEscuelaDto) {
    return this.facultyService.updateEscuela(id, dto);
  }

  // ===================== CARRERAS =====================
  @Get('carreras')
  findAllCarreras(@Query('escuelaId') escuelaId?: string) {
    return this.facultyService.findAllCarreras(escuelaId);
  }

  @Get('carreras/:id')
  findOneCarrera(@Param('id') id: string) {
    return this.facultyService.findOneCarrera(id);
  }

  @Post('carreras')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ADMIN_ROLES)
  createCarrera(@Body() dto: CreateCarreraDto) {
    return this.facultyService.createCarrera(dto);
  }

  @Patch('carreras/:id')
  @Roles(...ADMIN_ROLES)
  updateCarrera(@Param('id') id: string, @Body() dto: UpdateCarreraDto) {
    return this.facultyService.updateCarrera(id, dto);
  }
}
