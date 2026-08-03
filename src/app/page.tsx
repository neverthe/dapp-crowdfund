'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { ConnectButton } from '@/components/ConnectButton'
import CampaignList from '@/components/CampaignList'
import { fetchGlobalStats } from '@/lib/subgraph'

export default function Home() {
  const { isConnected } = useAccount()
  const [stats, setStats] = useState<{ totalCampaigns: number; totalDonations: number; totalDonatedEth: string } | null>(null)

  useEffect(() => {
    fetchGlobalStats()
      .then(data => setStats(data.globalStats))
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          去中心化众筹平台
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
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
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors font-medium"
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

      {/* 仪表盘统计 */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.totalCampaigns}</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">总众筹项目</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.totalDonations}</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">总捐赠次数</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Number(formatEther(BigInt(stats.totalDonatedEth))).toFixed(4)}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">总捐赠 ETH</p>
          </div>
        </div>
      )}

      {/* 众筹列表 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">进行中的众筹</h2>
          <a href="/activity" className="text-sm text-indigo-600 hover:underline">
            查看全部活动 →
          </a>
        </div>
        <CampaignList />
      </section>
    </div>
  )
}
