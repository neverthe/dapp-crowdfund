import { BigInt } from "@graphprotocol/graph-ts"
import { Staked, Unstaked, RewardsClaimed } from "../generated/StakingPool/StakingPool"
import { StakeAction, RewardClaim } from "../generated/schema"
import { getOrCreateUser, getOrCreateGlobalStats } from "./helpers"

export function handleStaked(event: Staked): void {
  let userAddr = event.params.user.toHexString()
  let amount = event.params.amount

  let action = new StakeAction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  action.user = event.params.user
  action.type = "Stake"
  action.amount = amount
  action.timestamp = event.block.timestamp
  action.txHash = event.transaction.hash
  action.save()

  // 用户统计
  let user = getOrCreateUser(event.params.user)
  user.totalStaked = user.totalStaked.plus(amount)
  user.stakeCount += 1
  user.save()

  // 全局统计
  let stats = getOrCreateGlobalStats()
  stats.totalStaked = stats.totalStaked.plus(amount)
  stats.save()
}

export function handleUnstaked(event: Unstaked): void {
  let userAddr = event.params.user.toHexString()
  let amount = event.params.amount

  let action = new StakeAction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  action.user = event.params.user
  action.type = "Unstake"
  action.amount = amount
  action.timestamp = event.block.timestamp
  action.txHash = event.transaction.hash
  action.save()

  // 用户统计
  let user = getOrCreateUser(event.params.user)
  user.totalUnstaked = user.totalUnstaked.plus(amount)
  user.stakeCount += 1
  user.save()

  // 全局统计
  let stats = getOrCreateGlobalStats()
  stats.totalStaked = stats.totalStaked.minus(amount)
  stats.save()
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  let amount = event.params.amount

  let claim = new RewardClaim(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  claim.user = event.params.user
  claim.amount = amount
  claim.timestamp = event.block.timestamp
  claim.txHash = event.transaction.hash
  claim.save()

  // 用户统计
  let user = getOrCreateUser(event.params.user)
  user.totalRewardsClaimed = user.totalRewardsClaimed.plus(amount)
  user.save()

  // 全局统计
  let stats = getOrCreateGlobalStats()
  stats.totalRewardsClaimed = stats.totalRewardsClaimed.plus(amount)
  stats.save()
}
