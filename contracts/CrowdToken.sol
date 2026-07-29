// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * 平台代币 — 捐赠者获得 CROWD 作为奖励凭证，之后可用于质押挖矿
 */
contract CrowdToken is ERC20, Ownable {
    constructor() ERC20("CrowdToken", "CROWD") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
