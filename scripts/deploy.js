import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const connection = await hre.network.connect();

  console.log("=== 部署 CrowdToken === ");
  const CrowdToken = await connection.viem.deployContract("CrowdToken", []);
  console.log("CrowdToken 已部署到:", CrowdToken.address);

  console.log("\n=== 部署 CrowdfundFactory === ");
  const Factory = await connection.viem.deployContract("CrowdfundFactory", []);
  console.log("CrowdfundFactory 已部署到:", Factory.address);

  console.log("\n=== 部署 StakingPool (APR=10%) === ");
  const StakingPool = await connection.viem.deployContract("StakingPool", [
    CrowdToken.address,
    10n
  ]);
  console.log("StakingPool 已部署到:", StakingPool.address);

  // 给 StakingPool 预铸奖励代币（1,000,000 CROWD）
  const [deployer] = await connection.viem.getWalletClients();
  
  console.log("\n=== 预铸奖励代币给 StakingPool === ");
  const mintTx = await deployer.writeContract({
    address: CrowdToken.address,
    abi: CrowdToken.abi,
    functionName: "mint",
    args: [StakingPool.address, parseEther("1000000")],
  });
  console.log("已铸币 1,000,000 CROWD 给 StakingPool, tx:", mintTx);

  console.log("\n=== 部署完成 ===");
  console.log("CrowdToken:", CrowdToken.address);
  console.log("CrowdfundFactory:", Factory.address);
  console.log("StakingPool:", StakingPool.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
