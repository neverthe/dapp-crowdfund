'use client'

import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { base } from 'wagmi/chains'
import { useEffect } from 'react'

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== base.id

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
