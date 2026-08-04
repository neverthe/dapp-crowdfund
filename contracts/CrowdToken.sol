// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * 平台代币 — 捐赠者获得 CROWD 作为奖励凭证，之后可用于质押挖矿
 */
// 支持继承多个合约
contract CrowdToken is ERC20, Ownable {
    // ① 初始化 ERC20（设置代币名称和符号），设置 owner 为部署者
    constructor() ERC20("CrowdToken", "CROWD") Ownable(msg.sender) {}
    // 铸造新代币，接收地址，铸造数量
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
