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

@Controller('padron')
export class PadronController {
  constructor(private padronService: PadronService) {}

  @Post('importar/:tipo')
  @UseInterceptors(FileInterceptor('archivo'))
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
  async listarEstudiantes() {
    return this.padronService.listarEstudiantes();
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'padron-service', timestamp: new Date().toISOString() };
  }
}