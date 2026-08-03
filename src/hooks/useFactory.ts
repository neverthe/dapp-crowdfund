'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { FACTORY_ADDRESS } from '@/lib/wagmi'
import factoryAbi from '@/abis/CrowdfundFactory.json'

export function useFactoryAddress() {
  return FACTORY_ADDRESS
}

export function useFactoryAbi() {
  return factoryAbi.abi
}

export function useGetCampaignsCount() {
  const { data, ...rest } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: factoryAbi.abi,
    functionName: 'getCampaignsCount',
  })
  return { ...rest, data: data as bigint | undefined }
}

export function useGetUserCampaigns(address: `0x${string}` | undefined) {
  return useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: factoryAbi.abi,
    functionName: 'getUserCampaigns',
    args: [address],
    query: {
      enabled: !!address,
    },
  })
}

export function useCreateCampaign() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const createCampaign = async (goal: bigint, durationDays: bigint, title: string, description: string, imageUrl: string) => {
    writeContract({
      address: FACTORY_ADDRESS as `0x${string}`,
      abi: factoryAbi.abi,
      functionName: 'createCampaign',
      args: [goal, durationDays, title, description, imageUrl],
    })
  }

  return {
    createCampaign,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
