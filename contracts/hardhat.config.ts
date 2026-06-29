import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Red de prueba de Syscoin (Mainnet es 57, Testnet es 5700)
    syscoin_testnet: {
      url: process.env.SYSCOIN_RPC_URL || "https://rpc.syscoin.org",
      chainId: parseInt(process.env.SYSCOIN_CHAIN_ID || "57"),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Hardhat local para pruebas
    hardhat: {
      chainId: 1337,
    },
  },
};

export default config;