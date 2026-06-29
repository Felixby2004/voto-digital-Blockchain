import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VotingContract...");

  // 1. Desplegar el Verificador real generado por snarkjs (Groth16Verifier)
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();

  console.log(`Groth16Verifier deployed to: ${verifierAddress}`);

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