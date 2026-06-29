import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { GenerateProofDto } from './dto/generate-proof.dto';
import { VerifyProofDto } from './dto/verify-proof.dto';
import { MerkleTreeDto } from './dto/merkle-tree.dto';

@Controller('crypto')
export class CryptoController {
  constructor(private cryptoService: CryptoService) {}

  @Post('generate-proof')
  @HttpCode(HttpStatus.OK)
  async generateProof(@Body() dto: GenerateProofDto) {
    return this.cryptoService.generateProof({
      secret: dto.secret,
      merkleRoot: dto.merkleRoot,
      electionId: dto.electionId,
      path: dto.path,
      direction: dto.direction,
    });
  }

  @Post('verify-proof')
  @HttpCode(HttpStatus.OK)
  async verifyProof(@Body() dto: VerifyProofDto) {
    return this.cryptoService.verifyProof(dto.proof, dto.publicSignals);
  }

  @Post('merkle-tree')
  @HttpCode(HttpStatus.OK)
  async generateMerkleTree(@Body() dto: MerkleTreeDto) {
    return this.cryptoService.generateMerkleTree(dto.depth, dto.leaves);
  }

  @Post('merkle-path')
  @HttpCode(HttpStatus.OK)
  async getMerklePath(@Body() body: { tree: string[][]; index: number }) {
    return this.cryptoService.getMerklePath(body.tree, body.index);
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'crypto-service',
      timestamp: new Date().toISOString(),
    };
  }
}
