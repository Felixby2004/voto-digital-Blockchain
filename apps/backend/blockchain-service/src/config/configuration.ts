export default () => ({
  blockchain: {
    rpcUrl:
      process.env.BLOCKCHAIN_RPC_URL ||
      process.env.ZKTANENBAUM_RPC_URL ||
      process.env.SYSCOIN_RPC_URL ||
      'https://rpc-zk.tanenbaum.io',
    chainId: parseInt(
      process.env.BLOCKCHAIN_CHAIN_ID ||
        process.env.ZKTANENBAUM_CHAIN_ID ||
        process.env.SYSCOIN_CHAIN_ID ||
        '57057',
      10,
    ),
    privateKey: process.env.PRIVATE_KEY || '',
    votingContractAddress:
      process.env.VOTING_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS || '',
    verifierContractAddress: process.env.VERIFIER_CONTRACT_ADDRESS || '',
    electionId: process.env.ELECTION_ID || '',
  },
});
