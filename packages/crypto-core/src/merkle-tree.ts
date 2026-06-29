// @ts-ignore
import { buildPoseidon } from 'circomlibjs';

export class MerkleTree {
  private depth: number;
  private leaves: bigint[];
  private tree: bigint[][] = [];
  private zeroValue: bigint;
  private poseidon: any;

  private constructor(depth: number, leaves: bigint[], poseidonInstance: any) {
    this.depth = depth;
    this.leaves = leaves;
    this.zeroValue = BigInt(0);
    this.poseidon = poseidonInstance;
  }

  static async create(depth: number, leaves: bigint[]): Promise<MerkleTree> {
    const poseidonInstance = await buildPoseidon();
    const treeObj = new MerkleTree(depth, leaves, poseidonInstance);
    await treeObj.buildTree();
    return treeObj;
  }

  private async buildTree(): Promise<void> {
    const size = 1 << this.depth;
    let currentLevel: bigint[] = [];

    // Inicializar hojas (con ceros si no hay suficientes)
    for (let i = 0; i < size; i++) {
      currentLevel[i] = this.leaves[i] || this.zeroValue;
    }
    this.tree.push(currentLevel);

    // Construir niveles superiores
    while (currentLevel.length > 1) {
      const nextLevel: bigint[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || this.zeroValue;
        
        // Poseidon hash
        const hashField = this.poseidon([left, right]);
        const hash = BigInt(this.poseidon.F.toString(hashField));
        
        nextLevel.push(hash);
      }
      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }
  }

  getRoot(): bigint {
    return this.tree[this.tree.length - 1][0];
  }

  getPath(index: number): { path: bigint[]; direction: number[] } {
    const path: bigint[] = [];
    const direction: number[] = [];
    let idx = index;
    for (let level = 0; level < this.depth; level++) {
      const sibling = idx % 2 === 0
        ? this.tree[level][idx + 1] || this.zeroValue
        : this.tree[level][idx - 1] || this.zeroValue;
      path.push(sibling);
      direction.push(idx % 2);
      idx = Math.floor(idx / 2);
    }
    return { path, direction };
  }
}
