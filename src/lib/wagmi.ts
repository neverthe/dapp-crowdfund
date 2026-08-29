import { http, createConfig, fallback } from 'wagmi'
import { hardhat, base } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import FactoryAbi from '@/abis/CrowdfundFactory.json'

// 从 .env 读取配置
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY || '0x'
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_CROWD_TOKEN || '0x'
const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_POOL || '0x'

// Base 主网 RPC 列表（自定义优先，公共 RPC 做备选）
const baseRpcUrls = [
  process.env.NEXT_PUBLIC_BASE_RPC_URL,
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://base-rpc.publicnode.com',
  'https://1rpc.io/base',
].filter(Boolean) as string[]

export const config = createConfig({
  chains: [base, hardhat],
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
    [base.id]: fallback(baseRpcUrls.map(url => http(url, {
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
