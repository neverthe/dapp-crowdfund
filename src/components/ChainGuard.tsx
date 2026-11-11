'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'

export function ChainGuard({ children }: { children: React.ReactNode }) {
  // 必须用 useAccount 里的 chainId（钱包真实所在链）。
  // useChainId() 在钱包切到未配置的链时会停留在默认链，检测不到「网络不对」。
  const { isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== undefined && chainId !== base.id

  if (!isWrongNetwork) return <>{children}</>

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-white px-4 py-3 text-center text-sm font-medium shadow-lg">
      <span>请切换到 Base 主网 </span>
      <button
        onClick={() => switchChain({ chainId: base.id })}
        className="ml-2 px-3 py-1 bg-white text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors font-semibold"
      >
        切换网络
      </button>
    </div>
  )
}
