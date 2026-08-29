import "dotenv/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.28",
  plugins: [hardhatToolboxViem],
  // 合约验证：Base 使用 Basescan（Etherscan 统一 API），一个 API Key 即可
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
    },
    base: {
      type: "http",
      url: BASE_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
