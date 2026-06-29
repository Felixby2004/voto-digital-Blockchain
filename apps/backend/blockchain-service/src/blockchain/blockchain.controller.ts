import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { CastVoteDto } from './dto/cast-vote.dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(private blockchainService: BlockchainService) {}

  // ============================================
  // 1. LECTURA (VIEW)
  // ============================================

  @Get('merkle-root')
  async getMerkleRoot() {
    return { merkleRoot: await this.blockchainService.getMerkleRoot() };
  }

  @Get('vote-count')
  async getVoteCount() {
    return { voteCount: await this.blockchainService.getVoteCount() };
  }

  @Get('encrypted-vote/:index')
  async getEncryptedVote(@Param('index') index: string) {
    return { encryptedVote: await this.blockchainService.getEncryptedVote(Number(index)) };
  }

  @Get('is-active')
  async getIsActive() {
    return { isActive: await this.blockchainService.getIsActive() };
  }

  @Get('nullifier/:nullifier')
  async isNullifierUsed(@Param('nullifier') nullifier: string) {
    return { used: await this.blockchainService.isNullifierUsed(nullifier) };
  }

  // ============================================
  // 2. ESCRITURA (TRANSACCIONES)
  // ============================================

  @Post('cast-vote')
  @HttpCode(HttpStatus.OK)
  async castVote(@Body() dto: CastVoteDto) {
    return this.blockchainService.castVote(dto.proof, dto.nullifier, dto.encryptedVote);
  }

  @Post('set-merkle-root')
  @HttpCode(HttpStatus.OK)
  async setMerkleRoot(@Body('root') root: string) {
    return this.blockchainService.setMerkleRoot(root);
  }

  @Post('close-election')
  @HttpCode(HttpStatus.OK)
  async closeElection() {
    return this.blockchainService.closeElection();
  }

  // ============================================
  // 3. HEALTH CHECK
  // ============================================

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'blockchain-service',
      timestamp: new Date().toISOString(),
    };
  }
}
