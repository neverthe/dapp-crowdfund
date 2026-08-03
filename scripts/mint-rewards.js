import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const connection = await hre.network.create();
  const [deployer] = await connection.viem.getWalletClients();

  const CROWD_TOKEN = "0xb7b78772e15d0d6a4dc28ada32c0fb80922b6758";
  const STAKING_POOL = "0xd21afae87398e7f16d6bcb28bfa38e93c7f3f8cb";

  console.log("=== 预铸奖励代币给 StakingPool === ");
  const tx = await deployer.writeContract({
    address: CROWD_TOKEN,
    abi: (await connection.viem.getContractAt("CrowdToken", CROWD_TOKEN)).abi,
    functionName: "mint",
    args: [STAKING_POOL, parseEther("1000000")],
  });
  console.log("已铸币 1,000,000 CROWD 给 StakingPool, tx:", tx);
  console.log("全部完成！");
}

main().catch(console.error);
