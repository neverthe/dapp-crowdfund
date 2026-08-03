import { BigInt } from "@graphprotocol/graph-ts"
import { CampaignCreated as CampaignCreatedEvent } from "../generated/CrowdfundFactory/CrowdfundFactory"
import { CrowdfundCampaign as CrowdfundCampaignContract } from "../generated/CrowdfundFactory/CrowdfundCampaign"
import { CrowdfundCampaign as CrowdfundCampaignTemplate } from "../generated/templates"
import { Campaign } from "../generated/schema"
import { getOrCreateUser, getOrCreateGlobalStats } from "./helpers"

export function handleCampaignCreated(event: CampaignCreatedEvent): void {
  let campaignAddr = event.params.campaignAddress
  let owner = event.params.owner

  // 创建 Campaign 实体
  let campaign = new Campaign(campaignAddr.toHexString())
  campaign.owner = owner
  campaign.goal = event.params.goal
  campaign.deadline = event.params.deadline
  campaign.totalRaised = BigInt.zero()
  campaign.state = 0  // Fundraising
  campaign.createdAt = event.block.timestamp
  campaign.createdTx = event.transaction.hash
  campaign.donationCount = 0

  // 尝试读取链上 title/description/imageUrl
  let campaignContract = CrowdfundCampaignContract.bind(campaignAddr)
  let titleResult = campaignContract.try_title()
  if (!titleResult.reverted) {
    campaign.title = titleResult.value
  }
  let descResult = campaignContract.try_description()
  if (!descResult.reverted) {
    campaign.description = descResult.value
  }
  let imgResult = campaignContract.try_imageUrl()
  if (!imgResult.reverted) {
    campaign.imageUrl = imgResult.value
  }

  campaign.save()

  // 动态创建 Campaign 数据源，开始监听该合约的事件
  CrowdfundCampaignTemplate.create(campaignAddr)

  // 更新创建者统计
  let user = getOrCreateUser(owner)
  user.campaignCount += 1
  user.save()

  // 更新全局统计
  let stats = getOrCreateGlobalStats()
  stats.totalCampaigns += 1
  stats.save()
}
