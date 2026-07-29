import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

// Sepolia 或本地 Hardhat
const defaultChainId = 11155111

export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(),
    [hardhat.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})

// 判断当前网络环境
const isSepolia = defaultChainId === 11155111

// 根据环境选择合约地址（部署后替换）
const FACTORY_ADDRESS = isSepolia ? '0x' : '0x'
const TOKEN_ADDRESS = isSepolia ? '0x' : '0x'
const STAKING_ADDRESS = isSepolia ? '0x' : '0x'

export { FACTORY_ADDRESS, TOKEN_ADDRESS, STAKING_ADDRESS }
