import hre from "hardhat";

async function main() {
  console.log("=== 部署 CrowdToken === ");
  const CrowdToken = await hre.viem.deployContract("CrowdToken", []);
  console.log("CrowdToken 已部署到:", CrowdToken.address);

  console.log("\n=== 部署 CrowdfundFactory === ");
  const Factory = await hre.viem.deployContract("CrowdfundFactory", []);
  console.log("CrowdfundFactory 已部署到:", Factory.address);

  console.log("\n=== 部署 StakingPool (APR=10%) === ");
  const StakingPool = await hre.viem.deployContract("StakingPool", [
    CrowdToken.address,
    10n
  ]);
  console.log("StakingPool 已部署到:", StakingPool.address);

  const [deployer] = await hre.viem.getWalletClients();
  
  console.log("\n=== 授权 StakingPool 铸币权 === ");
  const tx = await deployer.writeContract({
    address: CrowdToken.address,
    abi: CrowdToken.abi,
    functionName: "transferOwnership",
    args: [StakingPool.address],
  });
  console.log("铸币权已转移给 StakingPool, tx:", tx);

  console.log("\n部署完成！");
  console.log("CrowdToken:", CrowdToken.address);
  console.log("CrowdfundFactory:", Factory.address);
  console.log("StakingPool:", StakingPool.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
