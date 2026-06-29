import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';

interface PersonaImport {
  dni: string;
  codigo: string;
  nombre: string;
  email: string;
  facultad: string;
  escuela?: string;
  carrera?: string;
  departamento?: string;
  tipo: 'ESTUDIANTE' | 'PROFESOR';
}

@Injectable()
export class PadronService {
  private readonly logger = new Logger(PadronService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================
  // 1. IMPORTAR VOTANTES (ESTUDIANTES O PROFESORES)
  // ============================================================
  async importarVotantes(
    file: Express.Multer.File,
    tipo: 'ESTUDIANTE' | 'PROFESOR',
    habilitarAutomaticamente = true,
  ) {
    const personas = await this.parseFile(file, tipo);

    const resultados = {
      exitosos: 0,
      fallidos: 0,
      errores: [] as string[],
    };

    for (const persona of personas) {
      try {
        // Verificar si ya existe por email, DNI o código
        const existe = await this.prisma.usuario.findFirst({
          where: {
            OR: [
              { email: persona.email },
              { dni: persona.dni },
              ...(tipo === 'ESTUDIANTE'
                ? [
                    { estudiante: { dni: persona.dni } },
                    { estudiante: { codigoUniversitario: persona.codigo } },
                  ]
                : [
                    { profesor: { dni: persona.dni } },
                    { profesor: { codigoEmpleado: persona.codigo } },
                  ]),
            ],
          },
        });

        if (existe) {
          resultados.fallidos++;
          resultados.errores.push(`Persona con DNI ${persona.dni} o email ${persona.email} ya existe`);
          continue;
        }

        // Generar contraseña temporal
        const passwordTemporal = this.generarPasswordTemporal();
        const hashedPassword = await bcrypt.hash(passwordTemporal, 10);

        // Crear usuario
        const usuario = await this.prisma.usuario.create({
          data: {
            nombre: persona.nombre,
            email: persona.email,
            dni: persona.dni,
            passwordHash: hashedPassword,
            rol: tipo === 'ESTUDIANTE' ? 'ESTUDIANTE' : 'PROFESOR',
            estado: 'ACTIVO',
          },
        });

        // Crear el registro específico
        if (tipo === 'ESTUDIANTE') {
          await this.prisma.estudiante.create({
            data: {
              usuarioId: usuario.id,
              dni: persona.dni,
              codigoUniversitario: persona.codigo,
              facultad: persona.facultad,
              escuela: persona.escuela || '',
              carrera: persona.carrera || '',
              estadoHabilitado: habilitarAutomaticamente,
            },
          });
        } else {
          await this.prisma.profesor.create({
            data: {
              usuarioId: usuario.id,
              dni: persona.dni,
              codigoEmpleado: persona.codigo,
              facultad: persona.facultad,
              escuela: persona.escuela || null,
              departamento: persona.departamento || null,
              estadoHabilitado: habilitarAutomaticamente,
            },
          });
        }

        resultados.exitosos++;
      } catch (error) {
        resultados.fallidos++;
        resultados.errores.push(`Error con ${persona.dni}: ${error.message}`);
      }
    }

    this.logger.log(`Importación ${tipo}: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos`);
    return resultados;
  }

  // ============================================================
  // 2. PARSEAR CSV / EXCEL
  // ============================================================
  private async parseFile(file: Express.Multer.File, tipo: 'ESTUDIANTE' | 'PROFESOR'): Promise<PersonaImport[]> {
    const buffer = file.buffer;
    const mimeType = file.mimetype;

    let rawData: any[] = [];
    if (mimeType === 'text/csv' || file.originalname.endsWith('.csv')) {
      rawData = await this.parseCSV(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.xlsx')) {
      rawData = this.parseExcel(buffer);
    } else {
      throw new BadRequestException('Formato no soportado. Use CSV o Excel (.xlsx)');
    }

    return rawData.map(row => {
      const base = {
        dni: row.dni?.toString().trim() || '',
        nombre: row.nombre?.toString().trim() || '',
        email: row.email?.toString().trim() || '',
        facultad: row.facultad?.toString().trim() || '',
        tipo,
      };

      if (tipo === 'ESTUDIANTE') {
        return {
          ...base,
          codigo: row.codigoUniversitario?.toString().trim() || '',
          escuela: row.escuela?.toString().trim() || '',
          carrera: row.carrera?.toString().trim() || '',
          departamento: undefined,
        };
      } else {
        return {
          ...base,
          codigo: row.codigoEmpleado?.toString().trim() || '',
          escuela: row.escuela?.toString().trim() || '',
          carrera: undefined,
          departamento: row.departamento?.toString().trim() || '',
        };
      }
    });
  }

  private parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const parser = parse({ columns: true, skip_empty_lines: true, trim: true });
      const results: any[] = [];
      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) results.push(record);
      });
      parser.on('error', reject);
      parser.on('end', () => resolve(results));
      parser.write(buffer.toString());
      parser.end();
    });
  }

  private parseExcel(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<any>(sheet);
  }

  // ============================================================
  // 3. LISTAR ESTUDIANTES
  // ============================================================
  async listarEstudiantes() {
    return await this.prisma.estudiante.findMany({
      include: { usuario: true },
      take: 10,
    });
  }

  // ============================================================
  // 4. UTILIDAD
  // ============================================================
  private generarPasswordTemporal(): string {
    return Math.random().toString(36).slice(-8);
  }
}