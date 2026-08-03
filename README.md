# Crowdfund + Staking DApp（众筹 + 质押挖矿）

一个基于以太坊的去中心化众筹 + 质押挖矿一体化 DApp。用户用 MetaMask / WalletConnect 连接钱包，创建众筹项目、用 ETH 捐赠、目标达成后创建者提现、过期未达标可退款；同时支持质押项目代币 CROWD 赚取 APR 收益。**没有后端服务器和数据库**——所有业务数据都在链上，前端通过 The Graph 子图索引查询链上数据。

已部署到 **Sepolia 测试网**，合约地址和子图链接见下文。

## 功能特性

| 功能 | 说明 |
|---|---|
| 创建众筹 | 设置目标金额、截止日期、标题、描述，图片上传到 IPFS（Pinata），链上存 CID |
| 捐赠 + 实时进度条 | 捐赠实时更新进度，**事件驱动**：监听链上 `Donated` 事件自动刷新，无需手动轮询 |
| 提现资金 | 仅创建者（onlyOwner），目标达成后一次性提取全部资金 |
| 过期退款 | 状态机 + 时间锁定，过期未达标时捐赠者按贡献额自动退款 |
| 质押挖矿 | stake / unstake / claim，按 APR 累计收益，每次操作自动结算已产生奖励 |
| APR 管理 | 合约所有者可更新年化收益率 |
| 代币水龙头 | 合约所有者可铸造测试代币（方便演示） |
| 活动历史 | 我的捐赠/质押/奖励记录 + 全网最新动态，均来自子图 |
| 聚合统计 | 首页展示总项目数、总捐赠、总质押、TVL 等全局数据（子图一次查询） |

## 技术栈

- **前端**：Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **链上交互**：wagmi v3 + viem v2（useReadContract / useWriteContract / useWaitForTransactionReceipt / useWatchContractEvent）
- **状态管理**：@tanstack/react-query（缓存 + 轮询兜底）
- **合约**：Solidity ^0.8.28 + Hardhat + OpenZeppelin
- **数据索引**：The Graph（Subgraph Studio，Sepolia）
- **存储**：IPFS + Pinata（图片内容存 IPFS，链上只存 CID 索引）
- **钱包**：MetaMask + WalletConnect

## 合约架构

| 合约 | 作用 |
|---|---|
| `CrowdfundFactory` | 工厂合约：创建众筹项目（每次创建部署一个独立 `CrowdfundCampaign`），记录用户的项目索引 |
| `CrowdfundCampaign` | 单个众筹项目：目标、截止日期、状态机、捐款、提现、退款 |
| `CrowdToken` | ERC20 代币（CROWD），用于质押 |
| `StakingPool` | 质押池：stake / unstake / claim，固定 APR → 每秒利率累计奖励，`ReentrancyGuard` 防重入 |

**众筹状态机**：

```
募集中(0) --目标达成--> 成功(1) --创建者提现--> 已提现(3)
    |
    └--过期且未达标--> 可退款（捐赠者按贡献额退款）
```

**子图索引**：链上事件 → 可查询实体（`Campaign`、`Donation`、`StakeAction`、`RewardClaim`、`GlobalStats`、`UserStats`），前端用 GraphQL 一次拿到聚合统计与历史记录。

## 已部署地址（Sepolia 测试网）

| 合约 | 地址 |
|---|---|
| CrowdToken (ERC20) | `0xeca866861030cf9e5c717675024d3fb770576fe9` |
| CrowdfundFactory | `0x8fe3846c7227c45d4b893be3b3c07e9de971a4cd` |
| StakingPool | `0x385c8bb028dc3582ebc8b4f72532da2dfcce68e1` |

- 子图：[crowdfund-staking-sepolia v0.0.4](https://api.studio.thegraph.com/query/1757085/crowdfund-staking-sepolia/v0.0.4)
- 可在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 输入合约地址查看链上数据

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（见下，复制 .env.example 为 .env 并填写）
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

> 需要测试 CROWD 代币？连接部署者钱包后，在 Staking 页面使用"测试代币水龙头"铸造。

## 环境变量

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_NETWORK` | 网络，`sepolia` |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Sepolia RPC 节点 |
| `NEXT_PUBLIC_CROWD_TOKEN` | CROWD 代币合约地址 |
| `NEXT_PUBLIC_FACTORY` | 众筹工厂合约地址 |
| `NEXT_PUBLIC_STAKING_POOL` | 质押池合约地址 |
| `NEXT_PUBLIC_SUBGRAPH_URL` | 子图 GraphQL 端点 |
| `NEXT_PUBLIC_PINATA_JWT` | Pinata API Key（用于图片上传到 IPFS） |
| `DEPLOYER_PRIVATE_KEY` | 仅用于 Hardhat 部署脚本，前端不需要 |

## 子图部署（可选）

```bash
cd subgraph
npm install
npm run codegen   # 生成 AssemblyScript 类型
npm run build     # 构建
npm run deploy    # 部署到 Subgraph Studio
```

## 项目结构

```
dapp-crowdfund/
├── contracts/            # Solidity 合约（Hardhat）
├── src/
│   ├── app/              # Next.js 页面
│   │   ├── page.tsx      # 首页：进行中的众筹 + 聚合统计
│   │   ├── create/       # 创建众筹（Pinata 上传图片）
│   │   ├── campaign/[id] # 众筹详情：捐赠/提现/退款 + 捐款记录
│   │   ├── my-campaigns/ # 我的众筹
│   │   ├── stake/        # 质押挖矿
│   │   └── activity/     # 活动历史
│   ├── hooks/            # wagmi 封装 hooks（useFactory/useCampaign/useStaking/useToken/useSubgraph）
│   ├── lib/              # wagmi 配置、子图查询、IPFS 上传
│   ├── components/       # 通用组件（列表、钱包按钮、Etherscan 链接）
│   └── abis/             # 合约 ABI
├── subgraph/             # The Graph 子图（schema + mappings）
└── scripts/              # Hardhat 部署脚本
```

## 技术要点

- **读 vs 写 vs 事件**：读（`useReadContract`）免费即时；写（`useWriteContract` + `useWaitForTransactionReceipt`）付 gas、等区块确认；实时数据用 `useWatchContractEvent` 监听链上事件驱动 UI 刷新。
- **链上 + 链下混合存储**：图片等大体积内容存 IPFS，链上只存 CID 索引，兼顾去中心化与成本。
- **子图替代循环读合约**：聚合统计、历史记录一次 GraphQL 查询完成。
- **ERC20 授权**：质押前 approve + transferFrom，前端使用 `maxUint256` 全量授权，一次授权永久生效。
