import { MerkleTree } from './merkle-tree';
// @ts-ignore
import { buildPoseidon } from 'circomlibjs';
// @ts-ignore
import { groth16 } from 'snarkjs';
import * as fs from 'fs';
import * as path from 'path';

async function fullFlowTest() {
  console.log('🚀 Iniciando prueba de flujo completo de votación...');

  // 1. Inicializar poseidon
  const poseidon = await buildPoseidon();

  // 2. Generar secrets para estudiantes
  const secrets = [
    BigInt('1234567890'),
    BigInt('0987654321'),
    BigInt('1122334455'),
    BigInt('5544332211'),
  ];

  // 3. Calcular commitments: C = Poseidon(secret)
  const commitments = secrets.map((s) => {
    const hash = poseidon([s]);
    return BigInt(poseidon.F.toString(hash));
  });

  console.log(`📝 Commitments generados: ${commitments.map((c: any) => c.toString()).join(', ')}`);

  // 4. Construir Merkle Tree
  const tree = await MerkleTree.create(20, commitments);
  const root = tree.getRoot();
  console.log(`🌳 Merkle Root: ${root.toString()}`);

  // 5. Seleccionar un votante de prueba (índice 0)
  const voterIndex = 0;
  const secret = secrets[voterIndex];
  const { path: merklePath, direction } = tree.getPath(voterIndex);

  // 6. Generar prueba ZK
  console.log('🔄 Generando prueba ZK...');

  const input = {
    secret: secret.toString(),
    merkleRoot: root.toString(),
    electionId: "123456",
    path: merklePath.map(p => p.toString()),
    direction: direction.map(d => d.toString()),
  };

  // Cargar wasm y zkey
  const wasmPath = path.join(__dirname, '../build/Eligibility_js/Eligibility.wasm');
  const zkeyPath = path.join(__dirname, '../build/Eligibility.zkey');

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    wasmPath,
    zkeyPath
  );

  console.log('✅ Prueba generada con éxito');
  console.log('📤 Public signals:', publicSignals);

  // 7. Simular voto cifrado
  const vote = 'Si';
  const encryptedVote = Buffer.from(vote).toString('hex');

  // 8. Enviar al relayer (simulación)
  console.log('📨 Enviando voto al Relayer...');
  // En un flujo real, aquí harías un POST a http://localhost:3012/relayer/relay

  console.log('✅ Flujo completo exitoso');
}

fullFlowTest().catch(console.error);
