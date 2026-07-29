'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Mock 数据（后续换成子图查询）
const MOCK_CAMPAIGNS = [
  {
    id: 1,
    title: '社区花园建设',
    description: '为本地社区建设一个共享花园，种植有机蔬菜和花卉。',
    goal: '5.0',
    raised: '3.2',
    deadline: Date.now() + 7 * 86400 * 1000,
    contributors: 12,
    imageUrl: '',
  },
  {
    id: 2,
    title: '开源项目资助',
    description: '资助一个开源的去中心化身份认证项目开发。',
    goal: '10.0',
    raised: '8.5',
    deadline: Date.now() + 14 * 86400 * 1000,
    contributors: 28,
    imageUrl: '',
  },
]

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS)

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
      {campaigns.map((campaign) => {
        const progress = (parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100
        const daysLeft = Math.max(0, Math.ceil((campaign.deadline - Date.now()) / (86400 * 1000)))

        return (
          <Link
            key={campaign.id}
            href={`/campaign/${campaign.id}`}
            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* 封面 */}
            <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-3xl opacity-50">🚀</span>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 truncate">{campaign.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.description}</p>

              {/* 进度条 */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{campaign.raised} ETH</span>
                  <span className="text-gray-400">{campaign.goal} ETH</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>{campaign.contributors} 位捐赠者</span>
                <span>{daysLeft} 天剩余</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
