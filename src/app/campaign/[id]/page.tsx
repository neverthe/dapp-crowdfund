'use client'

import { useParams } from 'next/navigation'//获取 URL 参数（众筹地址）
import { useState, useMemo, useEffect, useRef } from 'react'//useMemo缓存计算结果，useRef保存可变值（不触发重新渲染）
import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { formatEther } from 'viem'
import { useGetCampaign, useDonate, useWithdraw, useGetContributions, useGetContributorsCount, useRefund, useWatchCampaignEvents } from '@/hooks/useCampaign'
import { TxLink, AddressLink } from '@/components/EtherscanLink'//	区块浏览器链接组件
import { fetchCampaignDonations } from '@/lib/subgraph'//从子图查询捐款记录

const STATE_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: '募集中', color: 'text-blue-600', bg: 'bg-blue-50' },
  1: { label: '目标达成', color: 'text-green-600', bg: 'bg-green-50' },
  2: { label: '已过期', color: 'text-red-600', bg: 'bg-red-50' },
  3: { label: '已提现', color: 'text-gray-600', bg: 'bg-gray-100' },
}

export default function CampaignDetail() {
  const params = useParams()
  // ← 从 URL 获取合约地址   列表页跳转时： href={`/campaign/${campaign.id}`}   campaign.id 是 子图返回的众筹合约地址
  const campaignAddress = params.id as `0x${string}`
  const { address, isConnected } = useAccount()
  const queryClient = useQueryClient()
  const [donationAmount, setDonationAmount] = useState('0.01')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string; txHash?: `0x${string}` } | null>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [donationsLoading, setDonationsLoading] = useState(true)
  const donationsFirstLoad = useRef(true) // ← 区分首次加载和刷新

  const campaign = useGetCampaign(campaignAddress)//从合约读取数据 基本信息
  const { data: contribution } = useGetContributions(campaignAddress, address)// 我的捐赠
  const { data: contributorsCount } = useGetContributorsCount(campaignAddress)

  // 事件驱动：链上发生捐赠/提现/退款/状态变更时，进度条实时刷新
  useWatchCampaignEvents(campaignAddress)
 // 合约交互 Hooks
  const { donate, isPending: donatePending, hash: donateHash, isConfirming: isDonateConfirming, isConfirmed: isDonateConfirmed } = useDonate(campaignAddress)
  const { withdraw, isPending: withdrawPending, hash: withdrawHash, isConfirming: isWithdrawConfirming, isConfirmed: isWithdrawConfirmed } = useWithdraw(campaignAddress)
  const { refund, isPending: refundPending, hash: refundHash, isConfirming: isRefundConfirming, isConfirmed: isRefundConfirmed } = useRefund(campaignAddress)

  // 加载该众筹的捐款记录（来自子图）；捐赠/退款确认后子图索引有延迟，稍等再重新拉取
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const load = () => {
      setDonationsLoading(true)
      fetchCampaignDonations(campaignAddress)
        .then(data => { if (!cancelled) setDonations(data.donations || []) })
        .catch(() => { if (!cancelled) setDonations([]) })
        .finally(() => { if (!cancelled) setDonationsLoading(false) })
    }
    if (donationsFirstLoad.current) {
      donationsFirstLoad.current = false
      load()
    } else {
      timer = setTimeout(load, 3000)
    }
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [campaignAddress, isDonateConfirmed, isRefundConfirmed])

  // 交易确认后自动刷新 + Toast
  useEffect(() => {
    if (isDonateConfirmed) {
      queryClient.invalidateQueries()
      setToast({ type: 'success', msg: '捐赠成功！感谢您的支持。', txHash: donateHash })
    }
  }, [isDonateConfirmed, queryClient, donateHash])

  useEffect(() => {
    if (isWithdrawConfirmed) {
      queryClient.invalidateQueries()
      setToast({ type: 'success', msg: '提现成功！资金已转入您的钱包。', txHash: withdrawHash })
    }
  }, [isWithdrawConfirmed, queryClient, withdrawHash])

  useEffect(() => {
    if (isRefundConfirmed) {
      queryClient.invalidateQueries()
      setToast({ type: 'success', msg: '退款成功！', txHash: refundHash })
    }
  }, [isRefundConfirmed, queryClient, refundHash])

  // 自动清除 Toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 8000)
    return () => clearTimeout(t)
  }, [toast])

  const isProcessing = donatePending || isDonateConfirming || withdrawPending || isWithdrawConfirming || refundPending || isRefundConfirming

  const { goal, totalRaised, deadline, owner, state, title, description, imageUrl } = campaign

  // useMemo 的作用： 只在依赖变化时重新计算，避免每次渲染都重复计算
  const stats = useMemo(() => {
    if (goal === undefined || totalRaised === undefined || deadline === undefined || state === undefined) return null
    const goalEth = formatEther(goal)
    const raisedEth = formatEther(totalRaised)
    const progress = goal > 0n ? Number((totalRaised * 10000n) / goal) / 100 : 0
    const deadlineMs = Number(deadline) * 1000
    const now = Date.now()
    const daysLeft = Math.max(0, Math.ceil((deadlineMs - now) / (86400 * 1000)))
    const isPastDeadline = now > deadlineMs
    const stateInfo = STATE_MAP[Number(state)] || { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-50' }
    return { goalEth, raisedEth, progress, daysLeft, stateInfo, isPastDeadline }
  }, [goal, totalRaised, deadline, state])

  // 加载状态（骨架屏）
  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  const { goalEth, raisedEth, progress, daysLeft, stateInfo, isPastDeadline } = stats
  const isOwner = address?.toLowerCase() === owner?.toLowerCase()
  const currentState = Number(state || 0)
  const canDonate = currentState === 0 && !isPastDeadline
  const canWithdraw = isOwner && currentState === 1
  // 退款：合约要求 state=Fundraising(0) + 已过截止日期 + 有捐赠记录，直接退无需审核
  const canRefund = isConnected && (currentState === 0 || currentState === 2) && isPastDeadline && contribution !== undefined && contribution > 0n
  const displayStateLabel = (currentState === 0 || currentState === 2) && isPastDeadline ? '已过期 · 可退款' : stateInfo.label

  return (
    <div className="max-w-6xl mx-auto">
      <a href="/" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">
        ← 返回列表
      </a>

      {/* Toast 通知 */}
      {toast && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between gap-3 ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <span>{toast.msg}</span>
          <div className="flex items-center gap-2 shrink-0">
            {toast.txHash && <TxLink hash={toast.txHash} label="查看交易" />}
            <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 左侧详情 */}
        <div className="lg:col-span-3 space-y-6">
          {imageUrl ? (
            <div className="h-64 rounded-xl overflow-hidden">
              <img
                src={`https://gateway.pinata.cloud/ipfs/${imageUrl.replace('ipfs://', '')}`}
                alt={title || ''}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-5xl opacity-50">🚀</span>
            </div>
          )}

          <h1 className="text-3xl font-bold">{title || ''}</h1>
          <p className="text-gray-600 leading-relaxed">{description || ''}</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            <span>创建者: {owner ? <AddressLink address={owner as `0x${string}`} /> : '...'}</span>
            <span>
              状态:{' '}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stateInfo.color} ${stateInfo.bg}`}>
                {displayStateLabel}
              </span>
              {(currentState === 0 || currentState === 2) && isPastDeadline && (
                <span className="text-xs text-gray-400 ml-1">(智能合约自动处理退款)</span>
              )}
            </span>
            <span>{Number(contributorsCount || 0n)} 位捐赠者</span>
            {isConnected && contribution !== undefined && contribution > 0n && (
              <span>我已捐赠: <strong className="text-indigo-600">{formatEther(contribution)} ETH</strong></span>
            )}
          </div>
        </div>

        {/* 右侧卡片 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24 space-y-4">
            {/* 进度 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-lg">{raisedEth} ETH</span>
                <span className="text-gray-400">目标 {goalEth} ETH</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 rounded-full h-3 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">
                {progress.toFixed(0)}% · {daysLeft > 0 ? `${daysLeft} 天剩余` : '已截止'}
              </p>
            </div>

            {/* 捐赠表单 */}
            {isConnected && canDonate && (
              <>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-2">捐赠金额 (ETH)</label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={() => donate(donationAmount)}
                  disabled={isProcessing || !donationAmount || parseFloat(donationAmount) <= 0}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {donatePending ? '钱包确认中...' : isDonateConfirming ? '交易确认中...' : '确认捐赠'}
                </button>
              </>
            )}

            {/* 提现按钮 */}
            {isConnected && canWithdraw && (
              <button
                onClick={() => withdraw()}
                disabled={isProcessing}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawPending ? '钱包确认中...' : isWithdrawConfirming ? '交易确认中...' : '提现资金'}
              </button>
            )}

            {/* 退款按钮 */}
            {canRefund && (
              <button
                onClick={() => refund()}
                disabled={isProcessing}
                className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {refundPending ? '钱包确认中...' : isRefundConfirming ? '交易确认中...' : '申请退款'}
              </button>
            )}

            {!isConnected && (
              <p className="text-center text-gray-400 text-sm">
                连接钱包后可捐赠
              </p>
            )}
          </div>

          {/* 捐款记录 */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-4 border-b">
              <h3 className="font-bold">捐款记录</h3>
              <p className="text-xs text-gray-400 mt-0.5">{donations.length} 笔捐赠 · 链上公开透明</p>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {donationsLoading ? (
                <div className="p-5 text-sm text-gray-400 text-center">加载中...</div>
              ) : donations.length === 0 ? (
                <div className="p-5 text-sm text-gray-400 text-center">暂无捐赠记录</div>
              ) : (
                donations.map((d) => {
                  const isMine = address?.toLowerCase() === d.donor.toLowerCase()
                  return (
                    <div
                      key={d.id}
                      className={`px-5 py-3 flex items-center justify-between gap-3 ${isMine ? 'bg-indigo-50/50' : ''}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium font-mono truncate">
                            {d.donor.slice(0, 6)}...{d.donor.slice(-4)}
                          </span>
                          {isMine && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-600 text-white rounded">我</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(Number(d.timestamp) * 1000).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-indigo-600">{formatEther(BigInt(d.amount))} ETH</p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-indigo-600"
                        >
                          查看交易
                        </a>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
