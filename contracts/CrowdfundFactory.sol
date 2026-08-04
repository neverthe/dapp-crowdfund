// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CrowdfundCampaign.sol";

/**
 * 众筹工厂 — 创建并追踪所有众筹项目
 */
contract CrowdfundFactory {
    // 存储所有创建的众筹合约实例
    CrowdfundCampaign[] public campaigns;
    // 某个用户创建了哪些众筹项目.存储的是 campaigns 数组的索引，不是地址
    mapping(address => uint256[]) public userCampaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed owner,
        uint256 goal,
        uint256 deadline
    );

    function createCampaign(
        uint256 _goal,
        uint256 _durationDays,
        string memory _title,
        string memory _description,
        string memory _imageUrl
    ) external returns (address) {
        // 创建一个新的 CrowdfundCampaign 合约实例
        CrowdfundCampaign campaign = new CrowdfundCampaign(
            msg.sender,
            _goal,
            _durationDays,
            _title,
            _description,
            _imageUrl
        );

        campaigns.push(campaign);
        // 记录用户创建的项目,存索引,索引比地址更节省存储空间
        userCampaigns[msg.sender].push(campaigns.length - 1);

        emit CampaignCreated(
            address(campaign),
            msg.sender,
            _goal,
            block.timestamp + (_durationDays * 1 days)
        );

        return address(campaign);
    }

    function getCampaignsCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getUserCampaigns(address _user) external view returns (uint256[] memory) {
        return userCampaigns[_user];
    }
}
