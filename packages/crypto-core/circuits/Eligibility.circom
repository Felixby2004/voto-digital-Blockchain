pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";

/**
 * @title Eligibility Circuit
 * @dev Prueba de elegibilidad para votación anónima.
 * 
 * INPUTS PRIVADOS:
 *   - secret: Secret aleatorio del votante (s)
 *   - path[depth]: Array de hashes del camino en el Merkle Tree
 *   - direction[depth]: Array de bits (0=izquierda, 1=derecha) para el camino
 *
 * INPUTS PÚBLICOS:
 *   - merkleRoot: Raíz del Merkle Tree publicada en el Smart Contract
 *   - electionId: Identificador de la elección
 *
 * OUTPUTS:
 *   - nullifier: Poseidon(secret, electionId) -> garantiza 1 voto por estudiante
 */
template Eligibility(depth) {
    // ------------------------------
    // ENTRADAS
    // ------------------------------
    signal input secret;
    signal input path[depth];
    signal input direction[depth];
    signal input merkleRoot;
    signal input electionId;

    // ------------------------------
    // SALIDAS
    // ------------------------------
    signal output nullifier;

    // ------------------------------
    // 1. CALCULAR COMMITMENT: C = Poseidon(secret)
    // ------------------------------
    component commitHasher = Poseidon(1);
    commitHasher.inputs[0] <== secret;
    signal leaf <== commitHasher.out;

    // ------------------------------
    // 2. CALCULAR NULLIFIER: N = Poseidon(secret, electionId)
    // ------------------------------
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== electionId;
    nullifier <== nullifierHasher.out;

    // ------------------------------
    // 3. VERIFICAR INCLUSIÓN EN MERKLE TREE
    // ------------------------------
    signal left[depth];
    signal right[depth];
    signal hashPath[depth + 1];
    hashPath[0] <== leaf;

    component hasher[depth];

    for (var i = 0; i < depth; i++) {
        // Asegurar que direction[i] sea 0 o 1
        direction[i] * (1 - direction[i]) === 0;

        // Seleccionar el orden de los hijos según la dirección
        left[i] <== (path[i] - hashPath[i]) * direction[i] + hashPath[i];
        right[i] <== (hashPath[i] - path[i]) * direction[i] + path[i];

        // Calcular hash de los dos hijos
        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== left[i];
        hasher[i].inputs[1] <== right[i];
        hashPath[i + 1] <== hasher[i].out;
    }

    // Verificar que la raíz calculada coincide con la pública
    merkleRoot === hashPath[depth];
}

// Instanciar el circuito con profundidad 20 (soporta ~1 millón de votantes)
component main { public [merkleRoot, electionId] } = Eligibility(20);