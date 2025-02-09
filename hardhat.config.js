// import 'dotenv/config'
// import 'hardhat-deploy'
// import 'hardhat-contract-sizer'
// import '@nomiclabs/hardhat-ethers'
// import '@layerzerolabs/toolbox-hardhat'
// import { HardhatUserConfig, HttpNetworkAccountsUserConfig, NetworkUserConfig } from 'hardhat/types'

// import { EndpointId } from '@layerzerolabs/lz-definitions'

// // Network configuration type
// interface NetworkConfig {
//     eid: number
//     url: string
//     verifyApiKey?: string
//     defaultGasPrice?: number
// }

// // Network configurations
// const NETWORKS: { [key: string]: NetworkConfig } = {
//     'base-sepolia-testnet': {
//         eid: EndpointId.BASESEP_V2_TESTNET,
//         url: process.env.BASE_RPC_URL || 'https://sepolia.base.org',
//         verifyApiKey: process.env.BASE_VERIFY_API_KEY,
//     },
//     'flowEvm-testnet': {
//         eid: EndpointId.FLOW_V2_TESTNET,
//         url: process.env.FLOW_EVM_RPC_URL || 'https://testnet.evm.nodes.onflow.org',
//         verifyApiKey: process.env.FLOW_VERIFY_API_KEY,
//     },
//     'bsc-testnet': {
//         eid: EndpointId.BSC_V2_TESTNET,
//         url: process.env.BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
//         verifyApiKey: process.env.BSC_VERIFY_API_KEY,
//         defaultGasPrice: 10000000000, // 10 gwei
//     },
// }

// // Validation function for environment variables
// function validateEnvironment() {
//     const requiredEnvVars = ['MNEMONIC', 'PRIVATE_KEY']
//     const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

//     if (missingEnvVars.length > 0) {
//         console.warn(
//             `Warning: Missing environment variables: ${missingEnvVars.join(', ')}\n` +
//                 'Some features may not work without these variables set.'
//         )
//     }
// }

// // Get authentication configuration
// function getAuthConfig(): HttpNetworkAccountsUserConfig | undefined {
//     if (process.env.MNEMONIC) {
//         return { mnemonic: process.env.MNEMONIC }
//     }

//     if (process.env.PRIVATE_KEY) {
//         if (!process.env.PRIVATE_KEY.startsWith('0x')) {
//             return ['0x' + process.env.PRIVATE_KEY]
//         }
//         return [process.env.PRIVATE_KEY]
//     }

//     return undefined
// }

// // Build network configurations
// function buildNetworkConfigs() {
//     const accounts = getAuthConfig()

//     if (!accounts) {
//         console.warn(
//             'No authentication method configured. Transactions will not be possible.\n' +
//                 'Please set either MNEMONIC or PRIVATE_KEY in your environment.'
//         )
//     }

//     const networkConfigs: { [key: string]: NetworkUserConfig } = {}

//     for (const [name, config] of Object.entries(NETWORKS)) {
//         networkConfigs[name] = {
//             eid: config.eid,
//             url: config.url,
//             accounts,
//             verify: config.verifyApiKey
//                 ? {
//                       etherscan: {
//                           apiKey: config.verifyApiKey,
//                       },
//                   }
//                 : undefined,
//             gasPrice: config.defaultGasPrice,
//         }
//     }

//     return networkConfigs
// }

// // Validate environment before proceeding
// validateEnvironment()

// const config: HardhatUserConfig = {
//     paths: {
//         cache: 'cache/hardhat',
//         artifacts: './artifacts',
//         deployments: './deployments',
//         sources: './test/hardhat',
//     },
//     solidity: {
//         compilers: [
//             {
//                 version: '0.8.22',
//                 settings: {
//                     optimizer: {
//                         enabled: true,
//                         runs: 200,
//                     },
//                     viaIR: true, // Enable IR-based optimization
//                 },
//             },
//         ],
//     },
//     networks: {
//         ...buildNetworkConfigs(),
//         hardhat: {
//             allowUnlimitedContractSize: true,
//             mining: {
//                 auto: true,
//                 interval: 0,
//             },
//         },
//     },
//     namedAccounts: {
//         deployer: {
//             default: 0,
//         },
//     },
//     // gasReporter: {
//     //     enabled: process.env.REPORT_GAS === 'true',
//     //     currency: 'USD',
//     //     coinmarketcap: process.env.COINMARKETCAP_API_KEY,
//     // },
//     // etherscan: {
//     //     apiKey: process.env.ETHERSCAN_API_KEY,
//     // },
//     mocha: {
//         timeout: 40000,
//     },
// }

// export default config
