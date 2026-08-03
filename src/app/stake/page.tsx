'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { formatEther, parseEther, maxUint256 } from 'viem'
import { useApr, useStakingStats, useStakeInfo, usePendingReward, useStake, useUnstake, useClaimReward, useSetRewardRate } from '@/hooks/useStaking'
import { useTokenBalance, useTokenAllowance, useApproveToken, useTokenOwner, useMintToken } from '@/hooks/useToken'
import { CONTRACT_CONFIG } from '@/lib/wagmi'

export default function StakePage() {
  const { address, isConnected } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')

  const { apr } = useApr()
  const { totalStaked } = useStakingStats()
  const { data: stakeInfo } = useStakeInfo(address)
  const { data: pendingReward } = usePendingReward(address)

  const { data: tokenBalance } = useTokenBalance(address)
  const { data: allowance } = useTokenAllowance(address, CONTRACT_CONFIG.stakingAddress as `0x${string}`)
  const { approve, isPending: approvePending, hash: approveHash } = useApproveToken(CONTRACT_CONFIG.stakingAddress as `0x${string}`)

  const { stake, isPending: stakePending, hash: stakeHash } = useStake()
  const { unstake, isPending: unstakePending, hash: unstakeHash } = useUnstake()
  const { claimReward, isPending: claimPending, hash: claimHash } = useClaimReward()

  const tokenOwner = useTokenOwner()
  const { mint, isPending: mintPending, hash: mintHash, isConfirming: isMintConfirming, isConfirmed: isMintConfirmed } = useMintToken()
  const { setRate, isPending: setRatePending, hash: setRateHash, isConfirmed: isSetRateConfirmed } = useSetRewardRate()
  const queryClient = useQueryClient()
  const isOwner = !!address && !!tokenOwner && address.toLowerCase() === tokenOwner.toLowerCase()

  const [customApr, setCustomApr] = useState('100')

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } =
    useWaitForTransactionReceipt({ hash: stakeHash })
  const { isLoading: isUnstakeConfirming, isSuccess: isUnstakeSuccess } =
    useWaitForTransactionReceipt({ hash: unstakeHash })
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({ hash: claimHash })

  // 交易确认后自动刷新数据
  useEffect(() => {
    if (isApproveSuccess || isStakeSuccess || isUnstakeSuccess || isClaimSuccess || isMintConfirmed || isSetRateConfirmed) {
      queryClient.invalidateQueries()
    }
  }, [isApproveSuccess, isStakeSuccess, isUnstakeSuccess, isClaimSuccess, isMintConfirmed, isSetRateConfirmed, queryClient])

  const isProcessing =
    approvePending || isApproveConfirming ||
    stakePending || isStakeConfirming ||
    unstakePending || isUnstakeConfirming ||
    claimPending || isClaimConfirming ||
    mintPending || isMintConfirming ||
    setRatePending

  const stakedAmount = stakeInfo?.[0] || 0n
  const needApproval = allowance !== undefined && allowance < (stakeAmount ? parseEther(stakeAmount) : 0n)

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">请先连接 MetaMask 钱包</p>
        <a href="/" className="text-indigo-600 hover:underline">返回首页</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Staking 挖矿</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        {/* 概览 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">APR</p>
            <p className="text-2xl font-bold text-indigo-600">{apr ? `${apr}%` : '...'}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">TVL</p>
            <p className="text-2xl font-bold text-indigo-600">
              {totalStaked !== undefined ? `${formatEther(totalStaked)} CROWD` : '...'}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">我的质押</p>
            <p className="text-2xl font-bold text-indigo-600">
              {stakedAmount > 0n ? `${formatEther(stakedAmount)} CROWD` : '0 CROWD'}
            </p>
          </div>
        </div>

        {/* 待领取奖励 */}
        <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div>
            <p className="text-sm text-yellow-700 font-medium">待领取奖励</p>
            <p className="text-lg font-bold text-yellow-800">
              {pendingReward !== undefined ? `${formatEther(pendingReward)} CROWD` : '...'}
            </p>
          </div>
          <button
            onClick={() => claimReward()}
            disabled={isProcessing || !pendingReward || pendingReward === 0n}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claimPending ? '确认中...' : isClaimConfirming ? '确认中...' : '领取'}
          </button>
        </div>

        {isClaimSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            奖励领取成功！
          </div>
        )}

        {/* 质押操作 */}
        <div className="border-t pt-6">
          <h3 className="font-bold mb-3">质押 CROWD</h3>
          <p className="text-sm text-gray-400 mb-3">
            余额: {tokenBalance !== undefined ? formatEther(tokenBalance) : '...'} CROWD
          </p>
          <div className="flex gap-4">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="质押数量"
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            {needApproval ? (
              <button
                onClick={() => approve(maxUint256)}
                disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approvePending || isApproveConfirming ? '授权中...' : '授权'}
              </button>
            ) : (
              <button
                onClick={() => stake(parseEther(stakeAmount))}
                disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stakePending ? '确认中...' : isStakeConfirming ? '确认中...' : '质押'}
              </button>
            )}
          </div>
          {isStakeSuccess && (
            <p className="text-sm text-green-600 mt-2">质押成功！之前的奖励已自动发放到钱包</p>
          )}
        </div>

        {/* 解除质押 */}
        {stakedAmount > 0n && (
          <div className="border-t pt-6">
            <h3 className="font-bold mb-3">解除质押</h3>
            <p className="text-sm text-gray-400 mb-3">
              已质押: {formatEther(stakedAmount)} CROWD
            </p>
            <div className="flex gap-4">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="解除质押数量"
                disabled={isProcessing}
                max={formatEther(stakedAmount)}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={() => unstake(parseEther(unstakeAmount))}
                disabled={isProcessing || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unstakePending ? '确认中...' : isUnstakeConfirming ? '确认中...' : '解除'}
              </button>
            </div>
            {isUnstakeSuccess && (
              <p className="text-sm text-green-600 mt-2">解除质押成功！奖励已自动发放到钱包</p>
            )}
          </div>
        )}

        {isApproveSuccess && (
          <p className="text-sm text-green-600 mt-2">授权成功，现在可以质押了。</p>
        )}

        <p className="text-sm text-gray-400 mt-3">
          质押 CROWD 代币，按 APR {apr || '...'}% 赚取实时收益。随时可提取。
        </p>

        {/* 测试代币水龙头（仅合约所有者可见） */}
        {address && isOwner && (
          <div className="border-t pt-6">
            <h3 className="font-bold mb-2 text-orange-600">🪙 测试代币水龙头</h3>
            <p className="text-sm text-gray-400 mb-3">
              铸造 1000 CROWD 测试代币到当前钱包（仅合约所有者可用）
            </p>
            <button
              onClick={() => mint(address, '1000')}
              disabled={isProcessing}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mintPending || isMintConfirming ? '铸造中...' : '铸造 1000 CROWD'}
            </button>
            {isMintConfirmed && (
              <p className="text-sm text-green-600 mt-2">铸造成功！1000 CROWD 已到账</p>
            )}
          </div>
        )}

        {/* 管理员设置（仅合约所有者可见） */}
        {address && isOwner && (
          <div className="border-t pt-6">
            <h3 className="font-bold mb-2 text-purple-600">⚙️ 管理员设置</h3>
            <p className="text-sm text-gray-400 mb-3">
              当前 APR：{apr || '...'}% — 输入新 APR 百分比后确认
            </p>
            <div className="flex gap-4">
              <input
                type="number"
                value={customApr}
                onChange={(e) => setCustomApr(e.target.value)}
                placeholder="新 APR (%)"
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                onClick={() => setRate(BigInt(customApr))}
                disabled={isProcessing || !customApr || parseInt(customApr) <= 0}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {setRatePending ? '确认中...' : '更新 APR'}
              </button>
            </div>
            {isSetRateConfirmed && (
              <p className="text-sm text-green-600 mt-2">APR 更新成功！</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
