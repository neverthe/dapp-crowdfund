const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || ''

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

export async function fetchCampaignsFromSubgraph() {
  const query = `
    {
      campaigns(first: 50, orderBy: createdAt, orderDirection: desc) {
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
      }
    }
  `
  return querySubgraph<{ campaigns: any[] }>(query)
}

export async function fetchUserCampaignsFromSubgraph(owner: string) {
  const query = `
    query($owner: Bytes!) {
      campaigns(where: { owner: $owner }, orderBy: createdAt, orderDirection: desc) {
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
      }
    }
  `
  return querySubgraph<{ campaigns: any[] }>(query, { owner: owner.toLowerCase() })
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
    {
      donations(first: 30, orderBy: timestamp, orderDirection: desc) {
        id
        campaign { id title }
        donor
        amount
        timestamp
        txHash
      }
    }
  `
  return querySubgraph<{ donations: any[] }>(query)
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
