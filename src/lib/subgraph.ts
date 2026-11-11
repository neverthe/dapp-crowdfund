const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || ''

// 只展示这两个真实项目；其余地址上的项目都是测试假数据，统一隐藏
export const VISIBLE_CAMPAIGN_IDS = [
  '0x1bcf30243f4fb410311b90bfd767de8bbc474e43', // ChainBuilder 2027 春季线下黑客松
  '0x655577f50fd848bd930ca67b6a674550acade511', // OpenGas · 开源 Gas 监控工具开发
]
// 子图查询工具库，封装了所有 GraphQL 查询函数，为前端提供链上数据的聚合查询能力。
export async function querySubgraph<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'Subgraph query failed')
  return json.data
}

// 子图里的 donationCount 是"捐款笔数"，不是"捐赠人数"；按 donor 去重得到真实捐赠者数
function withDonorCount(campaign: any) {
  const donors = new Set(
    ((campaign.donations || []) as any[]).map(d => String(d.donor).toLowerCase())
  )
  return { ...campaign, donorCount: donors.size }
}

export async function fetchCampaignsFromSubgraph() {
  const query = `
    query($ids: [String!]!) {
      campaigns(where: { id_in: $ids }, orderBy: createdAt, orderDirection: desc) {
        id
        owner
        goal
        deadline
        totalRaised
        state
        title
        description
        imageUrl
        donationCount
        donations { donor }
      }
    }
  `
  const data = await querySubgraph<{ campaigns: any[] }>(query, { ids: VISIBLE_CAMPAIGN_IDS })
  return { campaigns: (data.campaigns || []).map(withDonorCount) }
}

export async function fetchUserCampaignsFromSubgraph(owner: string) {
  const query = `
    query($owner: Bytes!, $ids: [String!]!) {
      campaigns(where: { owner: $owner, id_in: $ids }, orderBy: createdAt, orderDirection: desc) {
        id
        owner
        goal
        deadline
        totalRaised
        state
        title
        description
        imageUrl
        donationCount
        donations { donor }
      }
    }
  `
  const data = await querySubgraph<{ campaigns: any[] }>(query, { owner: owner.toLowerCase(), ids: VISIBLE_CAMPAIGN_IDS })
  return { campaigns: (data.campaigns || []).map(withDonorCount) }
}

export async function fetchGlobalStats() {
  const query = `
    {
      globalStats(id: "global") {
        totalCampaigns
        totalDonations
        totalDonatedEth
      }
    }
  `
  return querySubgraph<{ globalStats: any }>(query)
}

export async function fetchDonations() {
  const query = `
    query($ids: [String!]!) {
      donations(where: { campaign_in: $ids }, first: 50, orderBy: timestamp, orderDirection: desc) {
        id
        campaign { id title }
        donor
        amount
        timestamp
        txHash
      }
    }
  `
  return querySubgraph<{ donations: any[] }>(query, { ids: VISIBLE_CAMPAIGN_IDS })
}

export async function fetchCampaignDonations(campaignId: string) {
  const query = `
    query($campaignId: String!) {
      donations(where: { campaign: $campaignId }, orderBy: timestamp, orderDirection: desc) {
        id
        donor
        amount
        timestamp
        txHash
      }
    }
  `
  return querySubgraph<{ donations: any[] }>(query, { campaignId: campaignId.toLowerCase() })
}

export async function fetchStakeActions() {
  const query = `
    {
      stakeActions(first: 30, orderBy: timestamp, orderDirection: desc) {
        id
        user
        type
        amount
        timestamp
        txHash
      }
    }
  `
  return querySubgraph<{ stakeActions: any[] }>(query)
}

export async function fetchRewardClaims() {
  const query = `
    {
      rewardClaims(first: 30, orderBy: timestamp, orderDirection: desc) {
        id
        user
        amount
        timestamp
        txHash
      }
    }
  `
  return querySubgraph<{ rewardClaims: any[] }>(query)
}
