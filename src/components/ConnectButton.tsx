'use client'

import { useConnect } from 'wagmi'

export function ConnectButton() {
  const { connectors, connect } = useConnect()

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
    >
      连接 MetaMask
    </button>
  )
}
