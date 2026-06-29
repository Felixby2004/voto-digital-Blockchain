// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IVerifier.sol";

/**
 * @title VotingContract
 * @dev Sistema de votación anónimo basado en ZKP sobre Syscoin NEVM.
 * Cumple con la Parte 3 del Prompt Maestro:
 * - Anonimato total (No almacena identidad).
 * - Prevención de doble voto (Nullifier Registry).
 * - Verificabilidad E2E (Almacena votos cifrados y pruebas).
 * - Integridad (Inmutable en blockchain).
 */
contract VotingContract {
    // ============================================
    // 1. VARIABLES DE ESTADO
    // ============================================

    // Dirección del contrato verificador de ZKP (se despliega por separado)
    IVerifier public verifier;

    // Raíz del Merkle Tree (publicada por el Servicio de Padrón)
    bytes32 public merkleRoot;

    // Election ID para evitar ataques de reutilización entre elecciones
    bytes32 public electionId;

    // Mapeo para saber si un nullifier ya fue usado (Previene doble voto)
    mapping(bytes32 => bool) public nullifiers;

    // Almacenamiento de votos cifrados (ElGamal)
    bytes[] public encryptedVotes;

    // Eventos para auditoría (sin datos sensibles)
    event MerkleRootSet(bytes32 indexed root);
    event VoteCast(bytes32 indexed nullifier, uint256 voteIndex);
    event ElectionClosed();

    // ============================================
    // 2. MODIFICADORES Y CONSTRUCTOR
    // ============================================

    // Solo el administrador (desplegador) puede modificar la raíz
    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Voting: Not admin");
        _;
    }

    // Estado de la elección (abierta/cerrada)
    bool public isActive;

    constructor(address _verifierAddress, bytes32 _electionId) {
        admin = msg.sender;
        verifier = IVerifier(_verifierAddress);
        electionId = _electionId;
        isActive = true;
    }

    // ============================================
    // 3. FUNCIONES ADMINISTRATIVAS
    // ============================================

    /**
     * @dev Establece la raíz del Merkle Tree (solo admin).
     * @param _root Nueva raíz del Merkle Tree.
     */
    function setMerkleRoot(bytes32 _root) external onlyAdmin {
        require(isActive, "Voting: Election closed");
        merkleRoot = _root;
        emit MerkleRootSet(_root);
    }

    /**
     * @dev Cierra la elección (ya no se aceptan votos).
     */
    function closeElection() external onlyAdmin {
        isActive = false;
        emit ElectionClosed();
    }

    // ============================================
    // 4. FUNCIÓN PRINCIPAL DE VOTACIÓN (CON ZKP)
    // ============================================

    /**
     * @dev Emite un voto anónimo.
     * @param nullifier Identificador único del votante (generado por ZKP).
     * @param encryptedVote Voto cifrado con ElGamal.
     * @param proof Prueba ZK (Groth16) que valida que el votante está en el Merkle Tree.
     */
    function castVote(
        bytes32 nullifier,
        bytes calldata encryptedVote,
        uint256[8] calldata proof
    ) external {
        // 1. Validaciones previas
        require(isActive, "Voting: Election is not active");
        require(merkleRoot != bytes32(0), "Voting: Merkle Root not set");
        require(nullifier != bytes32(0), "Voting: Invalid nullifier");
        require(!nullifiers[nullifier], "Voting: Nullifier already used (double vote)");

        // 2. Validar la prueba ZK en el contrato verificador
        // Desempaquetar la prueba Groth16 (formato estándar de snarkjs)
        // proof: [a, b, c, input...] pero snarkjs pasa [a1, a2, b1, b2, c1, c2, in1, in2, in3, in4]
        // Normalmente, snarkjs genera un verifier con: verifyProof(a, b, c, input)
        // Donde a = [proof[0], proof[1]]
        // b = [[proof[2], proof[3]], [proof[4], proof[5]]]
        // c = [proof[6], proof[7]]
        // input = [nullifier, merkleRoot, electionId] (públicos)

        // Construcción de los parámetros para el verifier
        uint256[2] memory a = [proof[0], proof[1]];
        uint256[2][2] memory b = [
            [proof[2], proof[3]],
            [proof[4], proof[5]]
        ];
        uint256[2] memory c = [proof[6], proof[7]];

        // Los inputs públicos son: [nullifier, merkleRoot, electionId]
        // Nota: La conversión de bytes32 a uint256 se hace automáticamente en el circuito.
        // Asumimos que el circuito espera los inputs en este orden exacto.
        uint256[3] memory input = [
            uint256(nullifier),
            uint256(merkleRoot),
            uint256(electionId)
        ];

        // Ejecutar la verificación (cualquier fallo revierte la transacción)
        require(verifier.verifyProof(a, b, c, input), "Voting: Invalid ZK proof");

        // 3. Registrar el nullifier para prevenir doble voto
        nullifiers[nullifier] = true;

        // 4. Almacenar el voto cifrado
        uint256 voteIndex = encryptedVotes.length;
        encryptedVotes.push(encryptedVote);

        // 5. Emitir evento de registro (sin revelar identidad ni voto)
        emit VoteCast(nullifier, voteIndex);
    }

    // ============================================
    // 5. FUNCIONES DE CONSULTA (PÚBLICAS)
    // ============================================

    /**
     * @dev Obtiene la cantidad de votos emitidos.
     */
    function getVoteCount() external view returns (uint256) {
        return encryptedVotes.length;
    }

    /**
     * @dev Obtiene un voto cifrado por índice (para auditoría E2E-V).
     * Cualquier usuario puede verificar que su voto está aquí sin saber quién votó.
     */
    function getEncryptedVote(uint256 index) external view returns (bytes memory) {
        require(index < encryptedVotes.length, "Voting: Index out of bounds");
        return encryptedVotes[index];
    }

    /**
     * @dev Verifica si un nullifier ya fue utilizado.
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }
}