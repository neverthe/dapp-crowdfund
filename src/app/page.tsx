'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import CampaignList from '@/components/CampaignList'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          去中心化众筹平台
        </h1>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
          基于以太坊的众筹 DApp — 创建众筹、ETH 捐赠、质押 CROWD 代币赚取收益。
          完全链上透明，智能合约自动执行。
        </p>
        
        {isConnected ? (
          <div className="flex justify-center gap-4">
            <a
              href="/create"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              发起众筹
            </a>
            <a
              href="/stake"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              Staking 挖矿
            </a>
          </div>
        ) : (
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        )}
      </div>

      {/* 众筹列表 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">进行中的众筹</h2>
        <CampaignList />
      </section>
    </div>
  )
}
