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
// 事件（Event）定义。这些事件让你的 DApp 能够实时响应合约变化，为用户提供良好的交互体验
    event Donated(address indexed donor, uint256 amount, uint256 totalRaised);
    event Withdrawn(address indexed owner, uint256 amount);
    event Refunded(address indexed donor, uint256 amount);
    //  状态发生改变时（在 donate、withdraw、checkIfExpired 中）
    event StateChanged(CampaignState newState);
// 函数修饰器（Function Modifier），用于在函数执行前进行状态检查。
// 权限控制（提款等管理操作）
    modifier onlyOwner() {
        require(msg.sender == owner, "Not campaign owner");
        _;
    }
// 	状态机控制（不同状态允许不同操作）。检查当前状态是否等于传入的状态。
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
    // inState 修饰器：Fundraising确保当前状态是筹款中
    function donate() external payable inState(CampaignState.Fundraising) {
        require(block.timestamp < deadline, "Campaign expired");
        require(msg.value > 0, "Donation must be > 0");
        // 如果为 0，说明是首次捐赠，将地址加入 contributors 数组。方便统计捐赠人数
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        // 触发 Donated 事件，通知外部监听者
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
        // 先改状态，再转账。即使转账过程中发生重入攻击，状态已变，无法再次提款
        state = CampaignState.Withdrawn;
        //从 storage仅仅 读取 1 次，存入 memory，节省Gas
        uint256 amount = totalRaised;
        //  Solidity 中最安全的转账方式
        // ("") 空数据参数，表示只转账不调用函数
        // .call() 返回两个值。第一个：转账是否成功（bool）第二个：返回数据（这里为空，所以用 () 忽略）
        // 如果直接用totalRaised 下面emit Withdrawn(owner, totalRaised); 还会再 从 storage 读取一次
        (bool success, ) = owner.call{value: amount}("");
        // require 失败 → 触发 REVERT 操作码,回滚整个交易。 如果 success == false：
        //交易立即停止执行,所有状态变更撤销,Gas 退还（扣除已使用的部分）,返回错误信息 "Withdraw failed"
        require(success, "Withdraw failed");

        emit Withdrawn(owner, amount);
        emit StateChanged(CampaignState.Withdrawn);
    }

    /**
     * 过期后捐赠者退款
     */
    //  活动过期后checkIfExpired() 会将状态变为 Expired,refund() 就无法调用了（因为状态检查是 Fundraising）
//    修复方案 允许多个状态 修复方案
    // require(state == CampaignState.Fundraising || state == CampaignState.Expired, "Invalid campaign state");
//     前端没有调用 checkIfExpired() state 始终是 Fundraising (0) refund() 始终可用，用户能正常退款
    // 但创建者手动调用、区块浏览器调用、其他合约调用一旦触发，所有用户的退款都永久失效
    // 已按方案 1 修复：同时允许 Fundraising(0) 和 Expired(2) 状态退款，checkIfExpired() 被调用也不会卡死资金
    function refund() external {
        require(state == CampaignState.Fundraising || state == CampaignState.Expired, "Invalid campaign state");
        // 只有在过期后才能退款（防止用户在活动进行中退款）
        require(block.timestamp >= deadline, "Campaign not expired yet");
        // 如果为 0，说明没有捐赠过，无法退款。防止恶意用户调用浪费 Gas
        require(contributions[msg.sender] > 0, "No contribution");
        // 重入攻击防护：先改状态，后转账（checks-effects-interactions）
        // contributions[msg.sender] = 0;  // ① 先清零
        // (bool success, ) = msg.sender.call{value: amount}("");  // ② 后转账
        // 即使 msg.sender 是恶意合约，在 receive() 中再次调用 refund()
        // 也会因为 contributions[msg.sender] == 0 而失败（无法重复退款）
        uint256 amount = contributions[msg.sender];                     // 先取出应退金额
        contributions[msg.sender] = 0;                                  // ① 先清零
        totalRaised -= amount;                                          // 退款后同步扣减，保持账目一致
        (bool success, ) = msg.sender.call{value: amount}("");          // ② 后转账
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
