'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { TOKEN_ADDRESS } from '@/lib/wagmi'
import tokenAbi from '@/abis/CrowdToken.json'
import { parseEther } from 'viem'

export function useTokenBalance(address: `0x${string}` | undefined) {
  const { data, ...rest } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,

    abi: tokenAbi.abi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address },
    // 轮询自动刷新，铸造/质押后余额自动更新
    refetchInterval: 8000,
  })
  return { ...rest, data: data as bigint | undefined }
}

export function useTokenAllowance(owner: `0x${string}` | undefined, spender: `0x${string}`) {
  const { data, ...rest } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,

    abi: tokenAbi.abi,
    functionName: 'allowance',
    args: [owner, spender],
    query: { enabled: !!owner && !!spender },
    refetchInterval: 8000,
  })
  return { ...rest, data: data as bigint | undefined }
}

export function useApproveToken(spender: `0x${string}`) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const approve = async (amount: bigint) => {
    writeContract({
      address: TOKEN_ADDRESS as `0x${string}`,

      abi: tokenAbi.abi,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,

    abi: tokenAbi.abi,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,

    abi: tokenAbi.abi,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,

    abi: tokenAbi.abi,
    functionName: 'decimals',
  })

  return { name: name as string | undefined, symbol: symbol as string | undefined, decimals: decimals as number | undefined }
}

export function useTokenOwner() {
  const { data } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,
    abi: tokenAbi.abi,
    functionName: 'owner',
  })
  return data as `0x${string}` | undefined
}

export function useMintToken() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const mint = async (to: `0x${string}`, amount: string) => {
    writeContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: tokenAbi.abi,
      functionName: 'mint',
      args: [to, parseEther(amount)],
    })
  }

  return { mint, hash, isPending, isConfirming, isConfirmed, error }
}
