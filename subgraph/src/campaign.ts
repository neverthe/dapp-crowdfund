import { BigInt } from "@graphprotocol/graph-ts"
import { Donated, Withdrawn, Refunded, StateChanged } from "../generated/templates/CrowdfundCampaign/CrowdfundCampaign"
import { Campaign, Donation, CampaignStateChange } from "../generated/schema"
import { getOrCreateUser, getOrCreateGlobalStats } from "./helpers"

export function handleDonated(event: Donated): void {
  let campaignAddr = event.address.toHexString()
  let campaign = Campaign.load(campaignAddr)
  if (!campaign) return

  // 更新 Campaign 数据
  campaign.totalRaised = event.params.totalRaised
  campaign.donationCount += 1
  campaign.save()

  // 创建捐赠记录
  let donation = new Donation(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  donation.campaign = campaignAddr
  donation.donor = event.params.donor
  donation.amount = event.params.amount
  donation.totalRaisedAfter = event.params.totalRaised
  donation.timestamp = event.block.timestamp
  donation.txHash = event.transaction.hash
  donation.save()

  // 统计捐赠者
  let user = getOrCreateUser(event.params.donor)
  user.totalDonated = user.totalDonated.plus(event.params.amount)
  user.donationCount += 1
  user.save()

  // 全局统计
  let stats = getOrCreateGlobalStats()
  stats.totalDonations += 1
  stats.totalDonatedEth = stats.totalDonatedEth.plus(event.params.amount)
  stats.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let campaignAddr = event.address.toHexString()
  let campaign = Campaign.load(campaignAddr)
  if (!campaign) return

  campaign.state = 3  // Withdrawn
  campaign.save()
}

export function handleRefunded(event: Refunded): void {
  let campaignAddr = event.address.toHexString()
  let campaign = Campaign.load(campaignAddr)
  if (!campaign) return

  // 合约 refund() 已同步扣减 totalRaised，这里保持一致，确保子图与链上账目一致
  campaign.totalRaised = campaign.totalRaised.minus(event.params.amount)
  campaign.save()
}

export function handleStateChanged(event: StateChanged): void {
  let campaignAddr = event.address.toHexString()
  let campaign = Campaign.load(campaignAddr)
  if (!campaign) return

  campaign.state = event.params.newState
  campaign.save()

  // 记录状态变更
  let change = new CampaignStateChange(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  change.campaign = campaignAddr
  change.newState = event.params.newState
  change.timestamp = event.block.timestamp
  change.txHash = event.transaction.hash
  change.save()
}
