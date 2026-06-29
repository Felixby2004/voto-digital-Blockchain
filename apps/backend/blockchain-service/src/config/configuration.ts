export default () => ({
  blockchain: {
    rpcUrl: process.env.SYSCOIN_RPC_URL || 'https://rpc.syscoin.org',
    chainId: parseInt(process.env.SYSCOIN_CHAIN_ID || '5700', 10),
    privateKey: process.env.PRIVATE_KEY || '',
    votingContractAddress: process.env.VOTING_CONTRACT_ADDRESS || '',
    verifierContractAddress: process.env.VERIFIER_CONTRACT_ADDRESS || '',
    electionId: process.env.ELECTION_ID || '',
  },
});
