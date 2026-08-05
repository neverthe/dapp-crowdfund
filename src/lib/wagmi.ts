import { http, createConfig, fallback } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import FactoryAbi from '@/abis/CrowdfundFactory.json'

// 从 .env 读取配置
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY || '0x'
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_CROWD_TOKEN || '0x'
const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_POOL || '0x'

// Sepolia RPC 列表（Infura 优先，公共 RPC 做备选）
const sepoliaRpcUrls = [
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  'https://ethereum-sepolia.publicnode.com',
  'https://1rpc.io/sepolia',
  'https://rpc.sepolia.ethpandaops.io',
  'https://endpoints.omniatech.io/1/ethereum/sepolia/public',
].filter(Boolean) as string[]

export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Crowdfund DApp',
        url: 'http://173.254.234.4:8080',
      },
    }),
    walletConnect({ projectId: 'e618174c67748f7b65e9d54b89ed2741' }),
  ],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: fallback(sepoliaRpcUrls.map(url => http(url, {
      timeout: 60_000,
      retryCount: 2,
      retryDelay: 1000,
    }))),
  },
  batch: {
    multicall: false,
  },
})

export { FACTORY_ADDRESS, TOKEN_ADDRESS, STAKING_ADDRESS }
export const CONTRACT_CONFIG = {
  factoryAddress: FACTORY_ADDRESS,
  tokenAddress: TOKEN_ADDRESS,
  stakingAddress: STAKING_ADDRESS,
  factoryAbi: FactoryAbi.abi,
}
