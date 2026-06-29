import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// @ts-ignore
import { groth16 } from 'snarkjs';
// @ts-ignore
import { buildPoseidon } from 'circomlibjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);
  private wasmPath: string;
  private zkeyPath: string;
  private poseidon: any;

  constructor(private configService: ConfigService) {
    this.wasmPath = path.resolve(this.configService.get('crypto.circuitWasmPath') || '');
    this.zkeyPath = path.resolve(this.configService.get('crypto.circuitZkeyPath') || '');
  }

  async onModuleInit() {
    try {
      this.poseidon = await buildPoseidon();
      this.logger.log('✅ Poseidon hasher inicializado correctamente');
    } catch (err: any) {
      this.logger.error(`❌ Error al inicializar Poseidon: ${err.message}`);
    }
  }

  // ============================================
  // 1. GENERAR PRUEBA ZK (Groth16)
  // ============================================
  async generateProof(input: {
    secret: string;
    merkleRoot: string;
    electionId: string;
    path: string[];
    direction: string[];
  }) {
    try {
      this.logger.log('🔄 Generando prueba ZK...');

      // Verificar que los archivos existan
      if (!fs.existsSync(this.wasmPath)) {
        throw new Error(`Archivo WASM no encontrado: ${this.wasmPath}`);
      }
      if (!fs.existsSync(this.zkeyPath)) {
        throw new Error(`Archivo ZKEY no encontrado: ${this.zkeyPath}`);
      }

      // Generar la prueba
      const { proof, publicSignals } = await groth16.fullProve(
        {
          secret: input.secret,
          merkleRoot: input.merkleRoot,
          electionId: input.electionId,
          path: input.path,
          direction: input.direction,
        },
        this.wasmPath,
        this.zkeyPath,
      );

      this.logger.log('✅ Prueba generada con éxito');

      // Extraer nullifier de los publicSignals
      const nullifier = publicSignals[0];

      return {
        proof: [
          proof.pi_a[0].toString(),
          proof.pi_a[1].toString(),
          proof.pi_b[0][0].toString(),
          proof.pi_b[0][1].toString(),
          proof.pi_b[1][0].toString(),
          proof.pi_b[1][1].toString(),
          proof.pi_c[0].toString(),
          proof.pi_c[1].toString(),
        ],
        publicSignals,
        nullifier: `0x${BigInt(nullifier).toString(16).padStart(64, '0')}`,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error generando prueba: ${error.message}`);
      throw new BadRequestException(`Error generando prueba ZK: ${error.message}`);
    }
  }

  // ============================================
  // 2. VERIFICAR PRUEBA ZK (Opcional)
  // ============================================
  async verifyProof(proof: string[], publicSignals: any[]) {
    try {
      // Cargar el verificador desde el zkey
      const vkey = await this.loadVerificationKey();

      // Convertir proof a formato BigInt
      const proofBigInt = {
        pi_a: [BigInt(proof[0]), BigInt(proof[1])],
        pi_b: [
          [BigInt(proof[2]), BigInt(proof[3])],
          [BigInt(proof[4]), BigInt(proof[5])],
        ],
        pi_c: [BigInt(proof[6]), BigInt(proof[7])],
      };

      const publicSignalsBigInt = publicSignals.map((s: string) => BigInt(s));

      const isValid = await groth16.verify(
        vkey,
        publicSignalsBigInt,
        proofBigInt,
      );

      return {
        isValid,
        publicSignals,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error verificando prueba: ${error.message}`);
      throw new BadRequestException(`Error verificando prueba ZK: ${error.message}`);
    }
  }

  // ============================================
  // 3. GENERAR MERKLE TREE
  // ============================================
  async generateMerkleTree(depth: number, leaves: string[]) {
    try {
      this.logger.log(`🌳 Generando Merkle Tree con ${leaves.length} hojas...`);

      // Convertir hojas a bigint
      const leafBigInts = leaves.map((l) => BigInt(l));

      // Construir árbol
      const tree = await this.buildTree(depth, leafBigInts);
      const root = tree[tree.length - 1][0];

      this.logger.log(`✅ Merkle Tree generado. Root: ${root.toString()}`);

      return {
        root: `0x${root.toString(16).padStart(64, '0')}`,
        tree: tree.map((level) => level.map((node) => `0x${node.toString(16).padStart(64, '0')}`)),
      };
    } catch (error: any) {
      this.logger.error(`❌ Error generando Merkle Tree: ${error.message}`);
      throw new BadRequestException(`Error generando Merkle Tree: ${error.message}`);
    }
  }

  // ============================================
  // 4. OBTENER CAMINO DE MERKLE TREE
  // ============================================
  async getMerklePath(treeLevels: string[][], index: number) {
    try {
      const depth = treeLevels.length;
      const path: string[] = [];
      const direction: number[] = [];

      let idx = index;
      for (let level = 0; level < depth; level++) {
        const currentLevel = treeLevels[level].map((node) => BigInt(node));
        const sibling = idx % 2 === 0
          ? currentLevel[idx + 1] || BigInt(0)
          : currentLevel[idx - 1] || BigInt(0);
        path.push(`0x${sibling.toString(16).padStart(64, '0')}`);
        direction.push(idx % 2);
        idx = Math.floor(idx / 2);
      }

      return {
        path,
        direction,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error obteniendo camino: ${error.message}`);
      throw new BadRequestException(`Error obteniendo camino del Merkle Tree: ${error.message}`);
    }
  }

  // ============================================
  // 5. UTILIDADES PRIVADAS
  // ============================================

  private async loadVerificationKey() {
    // En un entorno real, cargarías el verificador desde el zkey
    // o desde un archivo JSON generado por snarkjs.
    // Simulación básica:
    return {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 4,
      vk_alpha_1: [BigInt(0), BigInt(0)],
      vk_beta_2: [[BigInt(0), BigInt(0)], [BigInt(0), BigInt(0)]],
      vk_gamma_2: [[BigInt(0), BigInt(0)], [BigInt(0), BigInt(0)]],
      vk_delta_2: [[BigInt(0), BigInt(0)], [BigInt(0), BigInt(0)]],
      vk_alphabeta_12: [BigInt(0), BigInt(0)],
      IC: [[BigInt(0), BigInt(0)]],
    };
  }

  private async buildTree(depth: number, leaves: bigint[]): Promise<bigint[][]> {
    const tree: bigint[][] = [];
    const size = 1 << depth;
    let currentLevel: bigint[] = [];

    // Inicializar con hojas (rellenar con 0 si faltan)
    for (let i = 0; i < size; i++) {
      currentLevel[i] = leaves[i] || BigInt(0);
    }
    tree.push(currentLevel);

    // Construir niveles superiores
    while (currentLevel.length > 1) {
      const nextLevel: bigint[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || BigInt(0);
        const hash = await this.poseidonHash([left, right]);
        nextLevel.push(hash);
      }
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    return tree;
  }

  private async poseidonHash(inputs: bigint[]): Promise<bigint> {
    const hash = this.poseidon(inputs);
    return BigInt(this.poseidon.F.toString(hash));
  }
}
