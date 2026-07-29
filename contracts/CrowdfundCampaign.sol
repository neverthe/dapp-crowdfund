// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * 众筹状态机
 */
enum CampaignState {
    Fundraising,  // 筹款中
    Successful,   // 成功（已达目标但未提款）
    Expired,      // 过期（未达目标，可退款）
    Withdrawn     // 已提款
}

/**
 * 单个众筹项目
 */
contract CrowdfundCampaign {
    address public owner;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalRaised;
    CampaignState public state;
    
    string public title;
    string public description;
    string public imageUrl;

    mapping(address => uint256) public contributions;
    address[] public contributors;

    event Donated(address indexed donor, uint256 amount, uint256 totalRaised);
    event Withdrawn(address indexed owner, uint256 amount);
    event Refunded(address indexed donor, uint256 amount);
    event StateChanged(CampaignState newState);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not campaign owner");
        _;
    }

    modifier inState(CampaignState _state) {
        require(state == _state, "Invalid campaign state");
        _;
    }

    constructor(
        address _owner,
        uint256 _goal,
        uint256 _durationDays,
        string memory _title,
        string memory _description,
        string memory _imageUrl
    ) {
        owner = _owner;
        goal = _goal;
        deadline = block.timestamp + (_durationDays * 1 days);
        title = _title;
        description = _description;
        imageUrl = _imageUrl;
        state = CampaignState.Fundraising;
    }

    /**
     * 捐赠 ETH
     */
    function donate() external payable inState(CampaignState.Fundraising) {
        require(block.timestamp < deadline, "Campaign expired");
        require(msg.value > 0, "Donation must be > 0");

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        emit Donated(msg.sender, msg.value, totalRaised);

        // 达成目标自动切换状态
        if (totalRaised >= goal) {
            state = CampaignState.Successful;
            emit StateChanged(CampaignState.Successful);
        }
    }

    /**
     * 创建者提取资金（仅在 Successful 状态）
     */
    function withdraw() external onlyOwner inState(CampaignState.Successful) {
        state = CampaignState.Withdrawn;
        uint256 amount = totalRaised;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdraw failed");

        emit Withdrawn(owner, amount);
        emit StateChanged(CampaignState.Withdrawn);
    }

    /**
     * 过期后捐赠者退款
     */
    function refund() external inState(CampaignState.Fundraising) {
        require(block.timestamp >= deadline, "Campaign not expired yet");
        require(contributions[msg.sender] > 0, "No contribution");

        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");

        emit Refunded(msg.sender, amount);
    }

    /**
     * 检查并更新过期状态
     */
    function checkIfExpired() external inState(CampaignState.Fundraising) {
        require(block.timestamp >= deadline, "Not expired");
        require(totalRaised < goal, "Goal reached");
        state = CampaignState.Expired;
        emit StateChanged(CampaignState.Expired);
    }

    function getContributorsCount() external view returns (uint256) {
        return contributors.length;
    }
}
