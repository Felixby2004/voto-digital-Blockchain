import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PadronService } from './padron.service';
import { Public, Roles } from 'common';

const ADMIN_ROLES = ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR'];
const READ_ROLES = ['ADMINISTRADOR_ELECTORAL', 'SUPER_ADMINISTRADOR', 'AUDITOR'];

@Controller('padron')
export class PadronController {
  constructor(private padronService: PadronService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'padron-service', timestamp: new Date().toISOString() };
  }

  @Post('importar/:tipo')
  @UseInterceptors(FileInterceptor('archivo'))
  @Roles(...ADMIN_ROLES)
  async importarVotantes(
    @UploadedFile() file: Express.Multer.File,
    @Param('tipo') tipo: 'ESTUDIANTE' | 'PROFESOR',
    @Query('habilitar') habilitar: string = 'true',
  ) {
    if (!file) {
      throw new BadRequestException('Archivo no recibido');
    }
    const habilitarBool = habilitar === 'true' || habilitar === '1';
    return this.padronService.importarVotantes(file, tipo, habilitarBool);
  }

  @Get('estudiantes')
  @Roles(...READ_ROLES)
  async listarEstudiantes() {
    return this.padronService.listarEstudiantes();
  }
}
