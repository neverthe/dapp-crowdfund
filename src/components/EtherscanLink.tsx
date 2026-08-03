'use client'

import { sepolia } from 'wagmi/chains'

const ETHERSCAN_BASE = 'https://sepolia.etherscan.io'

export function TxLink({ hash, label }: { hash: `0x${string}`; label?: string }) {
  return (
    <a
      href={`${ETHERSCAN_BASE}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 hover:underline text-sm inline-flex items-center gap-1"
    >
      {label || `${hash.slice(0, 6)}...${hash.slice(-4)}`}
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

export function AddressLink({ address, label }: { address: `0x${string}`; label?: string }) {
  return (
    <a
      href={`${ETHERSCAN_BASE}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 hover:underline text-sm inline-flex items-center gap-1"
    >
      {label || `${address.slice(0, 6)}...${address.slice(-4)}`}
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
