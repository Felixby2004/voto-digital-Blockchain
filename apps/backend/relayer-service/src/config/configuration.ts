export default () => ({
  relayer: {
    port: parseInt(process.env.RELAYER_PORT || '3012', 10),
    blockchainServiceUrl: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3010',
    delayBetweenVotes: parseInt(process.env.RELAYER_DELAY || '500', 10),
  },
});
