// Interfaz para el ABI mínimo del VotingContract
export interface VotingContractInterface {
  // Funciones de solo lectura
  merkleRoot(): Promise<string>;
  isActive(): Promise<boolean>;
  getVoteCount(): Promise<number>;
  getEncryptedVote(index: number): Promise<string>;
  isNullifierUsed(nullifier: string): Promise<boolean>;

  // Funciones de escritura (transacciones)
  castVote(proof: any, nullifier: string, encryptedVote: string): Promise<any>;
  setMerkleRoot(root: string): Promise<any>;
  closeElection(): Promise<any>;
}
