export default () => ({
  crypto: {
    port: parseInt(process.env.CRYPTO_PORT || '3011', 10),
    circuitWasmPath: process.env.CIRCUIT_WASM_PATH || 'packages/crypto-core/build/Eligibility_js/Eligibility.wasm',
    circuitZkeyPath: process.env.CIRCUIT_ZKEY_PATH || 'packages/crypto-core/build/Eligibility.zkey',
  },
});
