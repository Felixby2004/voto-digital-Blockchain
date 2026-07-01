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

    // 3. Generar un hash de transacción simulado (placeholder hasta integración blockchain)
    const hashInput = `${userId}:${eleccionId}:${candidatoId}:${Date.now()}`;
    const hashTransaccion = createHash('sha256').update(hashInput).digest('hex');

    // Nota: En una implementación completa con blockchain/ZK-proofs,
    // este servicio debería orquestar la llamada al relayer o blockchain-service.
    // Por ahora devolvemos una confirmación funcional para que el frontend fluya.

    return {
      success: true,
      hashTransaccion,
      eleccionId,
      candidatoId,
      timestamp: new Date().toISOString(),
    };
  }
}
