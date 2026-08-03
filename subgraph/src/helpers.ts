import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { UserStats, GlobalStats } from "../generated/schema"

export function getOrCreateUser(address: Address): UserStats {
  let id = address.toHexString()
  let user = UserStats.load(id)
  if (!user) {
    user = new UserStats(id)
    user.totalDonated = BigInt.zero()
    user.totalStaked = BigInt.zero()
    user.totalUnstaked = BigInt.zero()
    user.totalRewardsClaimed = BigInt.zero()
    user.campaignCount = 0
    user.donationCount = 0
    user.stakeCount = 0
    user.save()
  }
  return user
}

export function getOrCreateGlobalStats(): GlobalStats {
  let stats = GlobalStats.load("global")
  if (!stats) {
    stats = new GlobalStats("global")
    stats.totalCampaigns = 0
    stats.totalDonations = 0
    stats.totalDonatedEth = BigInt.zero()
    stats.totalStaked = BigInt.zero()
    stats.totalRewardsClaimed = BigInt.zero()
    stats.save()
  }
  return stats
}
