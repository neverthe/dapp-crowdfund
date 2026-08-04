'use client'

import { useState, useEffect } from 'react'
import { formatEther } from 'viem'
import { fetchDonations, fetchStakeActions, fetchRewardClaims } from '@/lib/subgraph'
import { useAccount } from 'wagmi'

type Tab = 'all' | 'donations' | 'staking'

interface ActivityItem {
  id: string
  type: 'donation' | 'stake' | 'unstake' | 'reward'
  user: string
  amount: bigint
  timestamp: bigint
  txHash: string
  campaignTitle?: string
  campaignId?: string
}

function shortenAddr(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function timeAgo(ts: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(ts)
  if (seconds < 60) return `${seconds}秒前`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
  return `${Math.floor(seconds / 86400)}天前`
}

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  donation: { label: '捐赠', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
  stake: { label: '质押', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  unstake: { label: '解除', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  reward: { label: '领取奖励', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
}

export default function ActivityPage() {
  const { address } = useAccount()
  const [tab, setTab] = useState<Tab>('all')
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // 三个子图查询并行执行,合并所有数据,统一格式化为 ActivityItem
    Promise.all([
      fetchDonations().catch(() => ({ donations: [] })),
      fetchStakeActions().catch(() => ({ stakeActions: [] })),
      fetchRewardClaims().catch(() => ({ rewardClaims: [] })),
    ]).then(([donations, stakes, rewards]) => {
      const list: ActivityItem[] = [
        ...donations.donations.map((d: any) => ({
          id: d.id,
          type: 'donation' as const,
          user: d.donor,
          amount: BigInt(d.amount),
          timestamp: BigInt(d.timestamp),
          txHash: d.txHash,
          campaignTitle: d.campaign?.title || undefined,
          campaignId: d.campaign?.id || undefined,
        })),
        ...stakes.stakeActions.map((s: any) => ({
          id: s.id,
          type: (s.type === 'Stake' ? 'stake' : 'unstake') as 'stake' | 'unstake',
          user: s.user,
          amount: BigInt(s.amount),
          timestamp: BigInt(s.timestamp),
          txHash: s.txHash,
        })),
        ...rewards.rewardClaims.map((r: any) => ({
          id: r.id,
          type: 'reward' as const,
          user: r.user,
          amount: BigInt(r.amount),
          timestamp: BigInt(r.timestamp),
          txHash: r.txHash,
        })),
      ]
        // 按时间排序（最新的在前）
      list.sort((a, b) => Number(b.timestamp - a.timestamp))
      setItems(list)
      setLoading(false)
    })
  }, [])

  const filtered = tab === 'all' ? items : items.filter(i => 
    tab === 'donations' ? i.type === 'donation' : ['stake', 'unstake', 'reward'].includes(i.type)
  )

  const myItems = address ? items.filter(i => i.user.toLowerCase() === address.toLowerCase()) : []
  const showMyItems = address && myItems.length > 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">活动历史</h1>

      {/* 标签切换 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {(['all', 'donations', 'staking'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
          >
            {{ all: '全部', donations: '捐赠记录', staking: 'Staking 记录' }[t]}
          </button>
        ))}
      </div>

      {/* 我的活动 */}
      {showMyItems && tab === 'all' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-[var(--muted-foreground)]">我的活动</h2>
          <div className="space-y-2">
            {myItems.slice(0, 10).map(item => <ActivityRow key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* 全部活动 */}
      <h2 className="text-lg font-semibold mb-3 text-[var(--muted-foreground)]">
        {tab === 'all' ? '最新动态' : ''}
      </h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-[var(--muted)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-2">暂无活动记录</p>
          <p className="text-sm">子图正在同步中，请稍后再查看</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => <ActivityRow key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = TYPE_META[item.type]
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${item.txHash}`

  return (
    <a
      href={etherscanUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:shadow-sm transition-shadow"
    >
      <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${meta.color} ${meta.bg}`}>
        {meta.label}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">
          {item.campaignTitle ? (
            <>众筹 <span className="font-medium">{item.campaignTitle}</span></>
          ) : (
            <><span className="font-mono">{shortenAddr(item.user)}</span></>
          )}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          {shortenAddr(item.user)} · {timeAgo(item.timestamp)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium">{formatEther(item.amount)}</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {item.type === 'donation' ? 'ETH' : 'CROWD'}
        </p>
      </div>
    </a>
  )
}
