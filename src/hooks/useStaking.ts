'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { STAKING_ADDRESS } from '@/lib/wagmi'
import stakingAbi from '@/abis/StakingPool.json'
// 查询用户质押信息
export function useStakeInfo(address: `0x${string}` | undefined) {
  const { data, ...rest } = useReadContract({
    address: STAKING_ADDRESS as `0x${string}`,

    abi: stakingAbi.abi,
    functionName: 'stakes',
    args: [address],
    query: { enabled: !!address },
  })
  return { ...rest, data: data as readonly [bigint, bigint, bigint] | undefined }
}
//  查询待领取奖励
export function usePendingReward(address: `0x${string}` | undefined) {
  const { data, ...rest } = useReadContract({
    address: STAKING_ADDRESS as `0x${string}`,

    abi: stakingAbi.abi,
    functionName: 'pendingReward',
    args: [address],
    query: { enabled: !!address },
  })
  return { ...rest, data: data as bigint | undefined }
}
//  质押
export function useStake() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const stake = async (amount: bigint) => {
    writeContract({
      address: STAKING_ADDRESS as `0x${string}`,

      abi: stakingAbi.abi,
      functionName: 'stake',
      args: [amount],
    })
  }
  //组件里 const { stake, isPending } = useStake()
  // stake(parseEther('100'))  // 质押 100 CROWD
// stake是上面的const stake函数
  return {
    stake,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
// 解锁质押
export function useUnstake() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const unstake = async (amount: bigint) => {
    writeContract({
      address: STAKING_ADDRESS as `0x${string}`,

      abi: stakingAbi.abi,
      functionName: 'unstake',
      args: [amount],
    })
  }

  return {
    unstake,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
//  领取奖励
export function useClaimReward() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const claimReward = async () => {
    writeContract({
      address: STAKING_ADDRESS as `0x${string}`,

      abi: stakingAbi.abi,
      functionName: 'claimReward',
    })
  }

  return {
    claimReward,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useStakingStats() {
  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS as `0x${string}`,

    abi: stakingAbi.abi,
    functionName: 'totalStaked',
  })

  const { data: rewardRate } = useReadContract({
    address: STAKING_ADDRESS as `0x${string}`,

    abi: stakingAbi.abi,
    functionName: 'rewardRate',
  })
// 不用 ...rest  有两个独立的查询，状态会冲突
  return { totalStaked: totalStaked as bigint | undefined, rewardRate: rewardRate as bigint | undefined }
}

export function useApr() {
  const { data: rewardRate } = useReadContract({
    address: STAKING_ADDRESS as `0x${string}`,
    abi: stakingAbi.abi,
    functionName: 'rewardRate',
    query: {
      // 轮询自动刷新，避免依赖交易确认时机导致 APR 显示滞后
      refetchInterval: 8000,
    },
  })

  const rr = rewardRate as bigint | undefined
  let apr = 0
  if (rr) {
    // rewardRate = (aprPercent * 1e18) / 100 / (365*86400)
    // => aprPercent = rewardRate * 100 * 365 * 86400 / 1e18
    // 用 Number() 转浮点避免 BigInt 除法截断，精度足够显示
    apr = Number(rr * 365n * 86400n * 100n) / Number(1e18)
    // 四舍五入保留 2 位小数
    apr = Math.round(apr * 100) / 100
  }

  return { apr, rewardRate: rr }
}
// 设置奖励率（管理员）
export function useSetRewardRate() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const setRate = async (aprPercent: bigint) => {
    writeContract({
      address: STAKING_ADDRESS as `0x${string}`,
      abi: stakingAbi.abi,
      functionName: 'setRewardRate',
      args: [aprPercent],
    })
  }

  return { setRate, hash, isPending, isConfirming, isConfirmed, error }
}
