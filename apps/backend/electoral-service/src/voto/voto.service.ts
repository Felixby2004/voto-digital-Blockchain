import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

interface CastVoteInput {
  candidatoId: string;
  eleccionId: string;
  userId: string;
}

@Injectable()
export class VotoService {
  constructor(private prisma: PrismaService) {}

  async castVote(input: CastVoteInput) {
    const { candidatoId, eleccionId, userId } = input;

    // 1. Verificar que la elección exista y esté ACTIVA
    const eleccion = await this.prisma.eleccion.findUnique({ where: { id: eleccionId } });
    if (!eleccion) {
      throw new NotFoundException('Elección no encontrada');
    }
    if (eleccion.estado !== 'ACTIVA') {
      throw new BadRequestException('La elección no está activa');
    }

    // 2. Verificar que el candidato exista y pertenezca a la elección
    const candidato = await this.prisma.candidato.findFirst({
      where: { id: candidatoId, eleccionId },
    });
    if (!candidato) {
      throw new BadRequestException('Candidato no válido para esta elección');
    }

    // 3. Verificar que el usuario esté en el padrón y no haya votado ya
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { estudiante: true, profesor: true },
    });
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const padron = await this.prisma.padronElectoral.findFirst({
      where: {
        eleccionId,
        estadoHabilitado: true,
        ...(usuario.estudiante?.id && { estudianteId: usuario.estudiante.id }),
        ...(usuario.profesor?.id && { profesorId: usuario.profesor.id }),
      },
    });

    if (!padron) {
      throw new BadRequestException('No estás habilitado para votar en esta elección');
    }
    if (padron.haVotado) {
      throw new BadRequestException('Ya emitiste tu voto en esta elección');
    }

    // 4. Marcar como votado en el padrón
    await this.prisma.padronElectoral.update({
      where: { id: padron.id },
      data: { haVotado: true },
    });

    // 5. Generar un hash de transacción simulado (placeholder hasta integración blockchain)
    const hashInput = `${userId}:${eleccionId}:${candidatoId}:${Date.now()}`;
    const hashTransaccion = createHash('sha256').update(hashInput).digest('hex');

    return {
      success: true,
      hashTransaccion,
      eleccionId,
      candidatoId,
      timestamp: new Date().toISOString(),
    };
  }
}
