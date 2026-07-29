// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * Staking 池 — 用户质押 CROWD 代币赚取 APY 收益
 * 简化版：固定年化收益率，按质押时长计算奖励
 */
contract StakingPool is Ownable, ReentrancyGuard {
    IERC20 public stakingToken;
    uint256 public rewardRate;       // 每秒每个代币的奖励（精度 1e18）
    uint256 public totalStaked;
    
    struct StakeInfo {
        uint256 amount;
        uint256 since;               // 质押开始时间
        uint256 rewardDebt;          // 已结算的奖励债务
    }

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _stakingToken, uint256 _aprPercent) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        // APR% → 每秒利率 = APR% / 100 / 365天 / 86400秒 * 1e18
        rewardRate = (_aprPercent * 1e18) / 100 / 365 days;
    }

    /**
     * 质押代币
     */
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");

        // 先结算已有奖励
        _claimReward();

        stakingToken.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].since = block.timestamp;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount);
    }

    /**
     * 提取质押 + 奖励
     */
    function unstake(uint256 _amount) external nonReentrant {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount >= _amount, "Insufficient staked");

        _claimReward();
        
        s.amount -= _amount;
        totalStaked -= _amount;
        stakingToken.transfer(msg.sender, _amount);

        emit Unstaked(msg.sender, _amount);
    }

    /**
     * 只提取奖励
     */
    function claimReward() external nonReentrant {
        _claimReward();
    }

    /**
     * 查询待领取奖励
     */
    function pendingReward(address _user) public view returns (uint256) {
        StakeInfo storage s = stakes[_user];
        if (s.amount == 0) return 0;
        uint256 duration = block.timestamp - s.since;
        return (s.amount * rewardRate * duration) / 1e18 + s.rewardDebt;
    }

    function _claimReward() internal {
        uint256 reward = pendingReward(msg.sender);
        if (reward > 0) {
            stakes[msg.sender].rewardDebt = 0;
            stakes[msg.sender].since = block.timestamp;
            stakingToken.transfer(msg.sender, reward);
            emit RewardsClaimed(msg.sender, reward);
        }
    }

    function setRewardRate(uint256 _aprPercent) external onlyOwner {
        rewardRate = (_aprPercent * 1e18) / 100 / 365 days;
    }
}
