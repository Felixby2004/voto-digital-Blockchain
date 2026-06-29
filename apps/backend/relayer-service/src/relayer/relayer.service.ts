import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RelayVoteDto } from './dto/relay-vote.dto';

@Injectable()
export class RelayerService {
  private readonly logger = new Logger(RelayerService.name);
  private readonly blockchainServiceUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.blockchainServiceUrl =
      this.configService.get<string>('relayer.blockchainServiceUrl') ||
      'http://localhost:3010';
  }

  /**
   * Recibe un voto cifrado + prueba ZK, oculta el origen y lo envía a la blockchain.
   * Simula el comportamiento de Mixnet y Cover Traffic (anonimización).
   */
  async relayVote(dto: RelayVoteDto): Promise<any> {
    try {
      // 1. Validación básica (sin logs de identidad)
      this.logger.log(
        `📨 Voto recibido. Nullifier: ${dto.nullifier.slice(0, 10)}...`,
      );

      // 2. Simular anonimización (Mixnet + Cover Traffic)
      //    - Añadir un delay aleatorio para romper patrones temporales
      const delay = Math.floor(Math.random() * 2000) + 500; // 500-2500ms
      this.logger.log(`⏳ Simulando Mixnet: delay de ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // 3. Ocultar el origen real (IP, timestamp) - en un entorno real usaríamos Tor o proxies
      //    Aquí solo simulamos enviando desde una dirección genérica.
      this.logger.log(
        `🔄 Reenviando voto anonimizado a Blockchain Service...`,
      );

      // 4. Enviar al Blockchain Service (POST /blockchain/cast-vote)
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.blockchainServiceUrl}/blockchain/cast-vote`,
          {
            proof: dto.proof,
            nullifier: dto.nullifier,
            encryptedVote: dto.encryptedVote,
          },
          {
            timeout: 15000,
          },
        ),
      );

      this.logger.log(
        `✅ Voto enviado a blockchain. Tx: ${response.data?.txHash || 'N/A'}`,
      );
      return {
        success: true,
        message: 'Voto procesado y enviado a blockchain',
        txHash: response.data?.txHash || 'pending',
        relayedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`❌ Error al relayear el voto: ${error.message}`);
      throw new BadRequestException(
        `Error al procesar el voto: ${error.message}`,
      );
    }
  }

  /**
   * Simula tráfico de cobertura (Cover Traffic) - genera votos falsos
   * para confundir ataques de correlación.
   */
  async generateCoverTraffic(): Promise<void> {
    setInterval(() => {
      const fakeNullifier = `0x${Math.random()
        .toString(16)
        .padStart(64, '0')}`;
      this.logger.debug(
        `🕵️ Cover Traffic: Voto falso ${fakeNullifier.slice(0, 10)}...`,
      );
      // En un entorno real, aquí se enviarían transacciones inválidas a la red.
    }, 30000); // cada 30 segundos
  }
}
