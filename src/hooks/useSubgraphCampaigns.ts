'use client'

import { useState, useEffect } from 'react'
import { fetchCampaignsFromSubgraph, fetchUserCampaignsFromSubgraph } from '@/lib/subgraph'
// 首页显示所有众筹 和  首页显示所有众筹 数据
// 众筹列表需要轮询（需要 Hook），其他的直接调用 lib/subgraph.ts里的函数只需要加载一次
export interface SubgraphCampaign {
  id: string
  owner: string
  goal: string
  deadline: string
  totalRaised: string
  state: number
  title: string | null
  description: string | null
  imageUrl: string | null
  donationCount: number
}

export function useSubgraphCampaigns() {
  const [campaigns, setCampaigns] = useState<SubgraphCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      fetchCampaignsFromSubgraph()
        .then(data => { if (active) { setCampaigns(data.campaigns || []); setError(null) } })
        .catch(e => { if (active) setError(e) })
        .finally(() => { if (active) setLoading(false) })
    }
    load()
    // 子图索引有延迟，轮询让新创建的众筹自动出现
    const timer = setInterval(load, 8000)
    return () => { active = false; clearInterval(timer) }
  }, [])

  return { campaigns, loading, error }
}

export function useSubgraphUserCampaigns(address: string | undefined) {
  const [campaigns, setCampaigns] = useState<SubgraphCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!address) {
      setLoading(false)
      return
    }
    let active = true
    const load = () => {
      fetchUserCampaignsFromSubgraph(address)
        .then(data => { if (active) { setCampaigns(data.campaigns || []); setError(null) } })
        .catch(e => { if (active) setError(e) })
        .finally(() => { if (active) setLoading(false) })
    }
    setLoading(true)
    load()
    // 子图索引有延迟，轮询让新创建的众筹自动出现
    const timer = setInterval(load, 8000)
    return () => { active = false; clearInterval(timer) }
  }, [address])

  return { campaigns, loading, error }
}
