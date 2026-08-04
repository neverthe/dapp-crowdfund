'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { parseEther } from 'viem'
import campaignAbi from '@/abis/CrowdfundCampaign.json'

/**
 * 事件驱动 UI：监听众筹合约的链上事件，触发 onLogs 回调 → refresh(),事件发生后自动刷新合约数据，
 * 让进度条/金额/状态实时更新（替代手动轮询）。
 */
//`0x${string}` 是一个以太坊地址类型"。
export function useWatchCampaignEvents(campaignAddress: `0x${string}` | undefined) {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries()

  useWatchContractEvent({
    address: campaignAddress,
    abi: campaignAbi.abi,
    eventName: 'Donated',
    onLogs: refresh,
    enabled: !!campaignAddress,
  })

  useWatchContractEvent({
    address: campaignAddress,
    abi: campaignAbi.abi,
    eventName: 'Withdrawn',
    onLogs: refresh,
    enabled: !!campaignAddress,
  })

  useWatchContractEvent({
    address: campaignAddress,
    abi: campaignAbi.abi,
    eventName: 'Refunded',
    onLogs: refresh,
    enabled: !!campaignAddress,
  })

  useWatchContractEvent({
    address: campaignAddress,
    abi: campaignAbi.abi,
    eventName: 'StateChanged',
    onLogs: refresh,
    enabled: !!campaignAddress,
  })
}
// 用 8 个独立查询而不是 1 个.每个字段独立缓存,更细粒度的刷新控制
export function useGetCampaign(address: `0x${string}` | undefined) {
  // functionName: 'owner',  Solidity 合约中定义的函数名或公共变量名。公共变量自动生成 getter 函数
  // 双重否定：将地址转为布尔值.	是否启用这个查询
  const { data: owner } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'owner',
    query: { enabled: !!address },
  })

  const { data: goal } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'goal',
    query: { enabled: !!address },
  })

  const { data: deadline } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'deadline',
    query: { enabled: !!address },
  })

  const { data: totalRaised } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'totalRaised',
    query: { enabled: !!address },
  })

  const { data: state } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'state',
    query: { enabled: !!address },
  })

  const { data: title } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'title',
    query: { enabled: !!address },
  })

  const { data: description } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'description',
    query: { enabled: !!address },
  })

  const { data: imageUrl } = useReadContract({
    address,
    abi: campaignAbi.abi,
    functionName: 'imageUrl',
    query: { enabled: !!address },
  })

  return {
    owner: owner as `0x${string}` | undefined,
    goal: goal as bigint | undefined,
    deadline: deadline as bigint | undefined,
    totalRaised: totalRaised as bigint | undefined,
    state: state as number | undefined,
    title: title as string | undefined,
    description: description as string | undefined,
    imageUrl: imageUrl as string | undefined,
  }
}

export function useDonate(campaignAddress: `0x${string}`) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const donate = async (amountInEth: string) => {
    writeContract({
      address: campaignAddress,
      abi: campaignAbi.abi,
      functionName: 'donate',
      value: parseEther(amountInEth),
    })
  }

  return {
    donate,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useWithdraw(campaignAddress: `0x${string}`) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const withdraw = async () => {
    writeContract({
      address: campaignAddress,
      abi: campaignAbi.abi,
      functionName: 'withdraw',
    })
  }

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useGetContributions(campaignAddress: `0x${string}`, userAddress: `0x${string}` | undefined) {
//   使用解构提取,rest 包含除 data 外的所有属性
// 包含isLoading, isSuccess, isError, refetch, status, error 等所有属性
// 只返回 data	简洁，清晰   返回 data + 部分状态灵活，可控   使用 ...rest完整，灵活
  const { data, ...rest } = useReadContract({
    address: campaignAddress,
    abi: campaignAbi.abi,
    functionName: 'contributions',
    args: [userAddress],
    query: {
      enabled: !!campaignAddress && !!userAddress,
    },
  })
  // ...rest 展开所有属性。 
  // data: data as bigint | undefined 告诉 TypeScript data是 bigint 或 undefined
  return { ...rest, data: data as bigint | undefined }
}

export function useGetContributorsCount(campaignAddress: `0x${string}` | undefined) {
  const { data, ...rest } = useReadContract({
    address: campaignAddress,
    abi: campaignAbi.abi,
    functionName: 'getContributorsCount',
    query: { enabled: !!campaignAddress },
  })
  return { ...rest, data: data as bigint | undefined }
}

export function useCheckIfExpired(campaignAddress: `0x${string}`) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const checkExpired = async () => {
    writeContract({
      address: campaignAddress,
      abi: campaignAbi.abi,
      functionName: 'checkIfExpired',
    })
  }

  return { checkExpired, hash, isPending, isConfirming, isConfirmed, error }
}

export function useRefund(campaignAddress: `0x${string}`) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const refund = async () => {
    writeContract({
      address: campaignAddress,
      abi: campaignAbi.abi,
      functionName: 'refund',
    })
  }

  return { refund, hash, isPending, isConfirming, isConfirmed, error }
}
