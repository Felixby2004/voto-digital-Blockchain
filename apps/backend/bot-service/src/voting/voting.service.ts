import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VotingService {
  private readonly logger = new Logger(VotingService.name);
  private readonly gatewayUrl = 'http://api-gateway:3000/api';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async castVote(identificador: string, password: string, candidateId: string): Promise<string> {
    try {
      // 1. Authenticate to get the token
      const authResponse = await firstValueFrom(
        this.httpService.post(`${this.gatewayUrl}/auth/login`, {
          identificador,
          password,
        }),
      );

      const token = authResponse.data?.accessToken || authResponse.data?.tokens?.accessToken;
      if (!token) {
        throw new Error('Authentication failed: No token received.');
      }

      // 2. We need to find an active election or let the user provide it.
      // Assuming there's a way to get active elections or it's hardcoded for this demo.
      // For simplicity, we might just fetch the elections and use the active one.
      const electionsResponse = await firstValueFrom(
        this.httpService.get(`${this.gatewayUrl}/elecciones`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const activeElection = electionsResponse.data.find((e: any) => e.estado === 'ACTIVA');
      if (!activeElection) {
        return 'There is no active election to vote in at this moment.';
      }

      // 3. Cast the vote
      await firstValueFrom(
        this.httpService.post(
          `${this.gatewayUrl}/voto`,
          {
            eleccionId: activeElection.id,
            candidatoId: candidateId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      );

      return 'Your vote has been successfully cast and recorded on the blockchain!';
    } catch (error: any) {
      this.logger.error('Error during voting process', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || 'Failed to cast vote.');
    }
  }
  async getCandidates(query?: string): Promise<{ id: string; nombre: string; apellido: string; partidoId: string }[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gatewayUrl}/candidatos`),
      );
      const candidates = response.data || [];
      if (query) {
        const lowerQuery = query.toLowerCase();
        return candidates.filter((c: any) => 
          c.nombre.toLowerCase().includes(lowerQuery) || 
          c.apellido.toLowerCase().includes(lowerQuery)
        );
      }
      return candidates;
    } catch (error: any) {
      this.logger.error('Error fetching candidates', error?.response?.data || error.message);
      return [];
    }
  }
}
