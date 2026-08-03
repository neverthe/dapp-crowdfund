'use client'

import Link from 'next/link'
import { formatEther } from 'viem'
import { useSubgraphCampaigns, SubgraphCampaign } from '@/hooks/useSubgraphCampaigns'

function getStateInfo(state: number) {
  switch (state) {
    case 0: return { label: '募集中', color: 'text-blue-600', bg: 'bg-blue-50' }
    case 1: return { label: '目标达成', color: 'text-green-600', bg: 'bg-green-50' }
    case 2: return { label: '已过期', color: 'text-red-600', bg: 'bg-red-50' }
    case 3: return { label: '已提现', color: 'text-gray-600', bg: 'bg-gray-100' }
    default: return { label: '未知', color: 'text-gray-600', bg: 'bg-gray-100' }
  }
}

function CampaignCard({ campaign }: { campaign: SubgraphCampaign }) {
  const goal = BigInt(campaign.goal)
  const totalRaised = BigInt(campaign.totalRaised)
  const deadline = BigInt(campaign.deadline)
  const goalEth = formatEther(goal)
  const raisedEth = formatEther(totalRaised)
  const progress = goal > 0n ? Number((totalRaised * 10000n) / goal) / 100 : 0
  const deadlineMs = Number(deadline) * 1000
  const daysLeft = Math.max(0, Math.ceil((deadlineMs - Date.now()) / (86400 * 1000)))
  const stateInfo = getStateInfo(campaign.state)
  const isPastDeadline = deadlineMs > 0 && Date.now() > deadlineMs
  const displayState = campaign.state === 0 && isPastDeadline ? '已截止' : stateInfo.label
  const displayColor = campaign.state === 0 && isPastDeadline ? 'text-yellow-600' : stateInfo.color
  const displayBg = campaign.state === 0 && isPastDeadline ? 'bg-yellow-50' : stateInfo.bg
  const imgUrl = campaign.imageUrl
    ? `https://gateway.pinata.cloud/ipfs/${campaign.imageUrl.replace('ipfs://', '')}`
    : ''

  return (
    <Link
      href={`/campaign/${campaign.id}`}
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
    >
      {imgUrl ? (
        <div className="h-40 overflow-hidden">
          <img src={imgUrl} alt={campaign.title || ''} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <span className="text-white text-3xl opacity-50">🚀</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg truncate flex-1">{campaign.title || '未命名项目'}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${displayColor} ${displayBg}`}>
            {displayState}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.description || ''}</p>
        <div className="mb-3">
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

export default function CampaignList() {
  const { campaigns, loading, error } = useSubgraphCampaigns()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-5 h-64 animate-pulse">
            <div className="h-40 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-2">子图暂时不可用</p>
        <p>正在自动重试中，请稍候...</p>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-2">暂无众筹项目</p>
        <p>成为第一个发起众筹的人！</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  )
}
