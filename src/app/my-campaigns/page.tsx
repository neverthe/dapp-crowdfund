'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { useSubgraphUserCampaigns, SubgraphCampaign } from '@/hooks/useSubgraphCampaigns'

function CampaignCard({ campaign }: { campaign: SubgraphCampaign }) {
  const goal = BigInt(campaign.goal)
  const totalRaised = BigInt(campaign.totalRaised)
  const deadline = BigInt(campaign.deadline)
  const goalEth = formatEther(goal)
  const raisedEth = formatEther(totalRaised)
  const progress = goal > 0n ? Number((totalRaised * 10000n) / goal) / 100 : 0
  const daysLeft = Math.max(0, Math.ceil((Number(deadline) * 1000 - Date.now()) / (86400 * 1000)))

  const stateLabels = ['募集中', '目标达成', '已过期', '已提现']
  const stateColors = [
    'text-blue-600 bg-blue-50',
    'text-green-600 bg-green-50',
    'text-red-600 bg-red-50',
    'text-gray-600 bg-gray-100',
  ]

  return (
    <Link
      href={`/campaign/${campaign.id}`}
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg truncate flex-1">{campaign.title || '未命名项目'}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${stateColors[campaign.state] || ''}`}>
            {stateLabels[campaign.state] || '未知'}
          </span>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{raisedEth} ETH</span>
            <span className="text-gray-400">{goalEth} ETH</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 rounded-full h-2 transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>{campaign.donationCount} 位捐赠者</span>
          <span>{daysLeft > 0 ? `${daysLeft} 天剩余` : '已截止'}</span>
        </div>
      </div>
    </Link>
  )
}

export default function MyCampaignsPage() {
  const { address, isConnected } = useAccount()
  const { campaigns, loading, error } = useSubgraphUserCampaigns(address)

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">请先连接钱包查看您创建的众筹项目</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">我的众筹</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 显示 3 个占位卡片，animate-pulse 实现呼吸动画，提升用户体验（减少白屏等待感） */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-5 h-48 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold mb-4">我的众筹</h1>
        <p className="text-gray-400 mb-4">子图暂时不可用，正在自动重试中...</p>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold mb-4">我的众筹</h1>
        <p className="text-gray-400 mb-4">您还没有创建过众筹项目</p>
        <Link href="/create" className="text-indigo-600 hover:underline">
          发起第一个众筹 →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">我的众筹</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
      </div>
    </div>
  )
}
