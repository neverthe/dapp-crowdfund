'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function CampaignDetail() {
  const params = useParams()
  const { isConnected } = useAccount()
  const [donationAmount, setDonationAmount] = useState('0.01')

  const campaign = {
    id: params.id,
    title: '社区花园建设',
    description: '为本地社区建设一个共享花园，种植有机蔬菜和花卉。让社区居民有一个共同的绿色空间，促进邻里关系的和谐发展。',
    goal: '5.0',
    raised: '3.2',
    deadline: Date.now() + 7 * 86400 * 1000,
    contributors: 12,
    owner: '0x1234...5678',
    state: 'Fundraising',
  }

  const progress = (parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100
  const daysLeft = Math.max(0, Math.ceil((campaign.deadline - Date.now()) / (86400 * 1000)))

  return (
    <div className="max-w-4xl mx-auto">
      <a href="/" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">
        ← 返回列表
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧详情 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-5xl opacity-50">🚀</span>
          </div>

          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <p className="text-gray-600 leading-relaxed">{campaign.description}</p>

          <div className="flex gap-4 text-sm text-gray-400">
            <span>创建者: {campaign.owner}</span>
            <span>状态: {campaign.state}</span>
            <span>{campaign.contributors} 位捐赠者</span>
          </div>
        </div>

        {/* 右侧捐赠卡片 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24 space-y-4">
            {/* 进度 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-lg">{campaign.raised} ETH</span>
                <span className="text-gray-400">目标 {campaign.goal} ETH</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 rounded-full h-3 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">
                {progress.toFixed(0)}% · {daysLeft} 天剩余
              </p>
            </div>

            {/* 捐赠 */}
            {isConnected && campaign.state === 'Fundraising' && (
              <>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-2">捐赠金额 (ETH)</label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  确认捐赠
                </button>
              </>
            )}

            {!isConnected && (
              <p className="text-center text-gray-400 text-sm">
                连接钱包后可捐赠
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
