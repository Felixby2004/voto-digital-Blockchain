import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import votingContractABI from './abi/VotingContract.json';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const rpcUrl = this.configService.get<string>('blockchain.rpcUrl');
      const privateKey = this.configService.get<string>('blockchain.privateKey');
      this.contractAddress = this.configService.get<string>('blockchain.votingContractAddress') || '';

      if (!rpcUrl || !privateKey || !this.contractAddress) {
        throw new Error('Faltan configuraciones de blockchain (RPC, PK o Contract Address)');
      }

      // Conectar a la red
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Instanciar el contrato
      this.contract = new ethers.Contract(
        this.contractAddress,
        votingContractABI,
        this.wallet,
      );

      this.logger.log(`Conectado a blockchain en ${rpcUrl}`);
      this.logger.log(`Contrato cargado en: ${this.contractAddress}`);

      // Verificar conexión
      const block = await this.provider.getBlockNumber();
      this.logger.log(`Bloque actual: ${block}`);
    } catch (error) {
      this.logger.error(`Error al conectar con blockchain: ${error.message}`);
    }
  }

  // ============================================
  // 1. FUNCIONES DE LECTURA (VIEW)
  // ============================================

  async getMerkleRoot(): Promise<string> {
    try {
      return await this.contract.merkleRoot();
    } catch (error) {
      this.logger.error(`Error al obtener MerkleRoot: ${error.message}`);
      throw new BadRequestException('Error al obtener la raíz del Merkle Tree');
    }
  }

  async getVoteCount(): Promise<number> {
    try {
      const count = await this.contract.getVoteCount();
      return Number(count);
    } catch (error) {
      this.logger.error(`Error al obtener conteo de votos: ${error.message}`);
      throw new BadRequestException('Error al obtener el conteo de votos');
    }
  }

  async getEncryptedVote(index: number): Promise<string> {
    try {
      return await this.contract.getEncryptedVote(index);
    } catch (error) {
      this.logger.error(`Error al obtener voto cifrado ${index}: ${error.message}`);
      throw new BadRequestException('Error al obtener el voto cifrado');
    }
  }

  async getIsActive(): Promise<boolean> {
    try {
      return await this.contract.isActive();
    } catch (error) {
      this.logger.error(`Error al obtener estado de elección: ${error.message}`);
      throw new BadRequestException('Error al obtener el estado de la elección');
    }
  }

  async isNullifierUsed(nullifier: string): Promise<boolean> {
    try {
      return await this.contract.isNullifierUsed(nullifier);
    } catch (error) {
      this.logger.error(`Error al verificar nullifier: ${error.message}`);
      throw new BadRequestException('Error al verificar el nullifier');
    }
  }

  // ============================================
  // 2. FUNCIONES DE ESCRITURA (TRANSACCIONES)
  // ============================================

  /**
   * Emite un voto anónimo en la blockchain
   * @param proof - Prueba ZK (Groth16) generada por el circuito
   * @param nullifier - Identificador único del votante
   * @param encryptedVote - Voto cifrado con ElGamal
   */
  async castVote(proof: string[], nullifier: string, encryptedVote: string): Promise<any> {
    try {
      // Verificar que la elección esté activa
      const isActive = await this.getIsActive();
      if (!isActive) {
        throw new BadRequestException('La elección no está activa');
      }

      // Verificar que el nullifier no esté usado
      const used = await this.isNullifierUsed(nullifier);
      if (used) {
        throw new BadRequestException('Este nullifier ya fue utilizado (doble voto)');
      }

      // Verificar que MerkleRoot existe
      const root = await this.getMerkleRoot();
      if (root === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw new BadRequestException('Merkle Root no configurado');
      }

      // Convertir el proof al formato esperado por el contrato (uint256[8])
      const proofArray = proof.map(p => BigInt(p));

      // Estimar gas
      const gasEstimate = await this.contract.castVote.estimateGas(
        proofArray,
        nullifier,
        encryptedVote,
      );

      // Enviar transacción
      const tx = await this.contract.castVote(
        proofArray,
        nullifier,
        encryptedVote,
        {
          gasLimit: (gasEstimate * BigInt(120)) / BigInt(100), // 20% más para seguridad
        },
      );

      this.logger.log(`Voto enviado. Tx hash: ${tx.hash}`);

      // Esperar confirmación
      const receipt = await tx.wait();
      this.logger.log(`Voto confirmado en bloque: ${receipt.blockNumber}`);

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      this.logger.error(`Error al emitir voto: ${error.message}`);
      throw new BadRequestException(`Error al emitir voto: ${error.message}`);
    }
  }

  /**
   * Actualiza la raíz del Merkle Tree (solo admin)
   */
  async setMerkleRoot(newRoot: string): Promise<any> {
    try {
      const tx = await this.contract.setMerkleRoot(newRoot);
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Error al actualizar MerkleRoot: ${error.message}`);
      throw new BadRequestException('Error al actualizar la raíz del Merkle Tree');
    }
  }

  /**
   * Cierra la elección (solo admin)
   */
  async closeElection(): Promise<any> {
    try {
      const tx = await this.contract.closeElection();
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Error al cerrar la elección: ${error.message}`);
      throw new BadRequestException('Error al cerrar la elección');
    }
  }
}
