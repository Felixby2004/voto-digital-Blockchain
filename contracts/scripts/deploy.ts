import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VotingContract...");

  // 1. Desplegar el Verificador (por ahora usamos una dirección mock o lo desplegamos vacío)
  // Nota: En la Parte 3-B (ZKP), generaremos el Verificador real.
  // Por ahora, desplegamos un contrato "dummy" para probar la estructura.
  // En producción, aquí se desplegaría el contrato generado por snarkjs.

  // Simulamos el despliegue del Verificador (lo haremos real en el siguiente paso)
  // const Verifier = await ethers.getContractFactory("Verifier");
  // const verifier = await Verifier.deploy();

  // Por ahora, usamos una dirección de prueba (0x...)
  // En la práctica, desplegaremos el Verificador real generado por snarkjs.
  const verifierAddress = "0x0000000000000000000000000000000000000000"; // Placeholder

  const electionId = ethers.id("Eleccion-Consejo-2026");

  const VotingContract = await ethers.getContractFactory("VotingContract");
  const voting = await VotingContract.deploy(verifierAddress, electionId);

  await voting.waitForDeployment();

  console.log(`VotingContract deployed to: ${await voting.getAddress()}`);
  console.log(`Election ID: ${electionId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});