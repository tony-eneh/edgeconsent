import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy SubjectAttributeRegistry
  const SubjectRegistry = await ethers.getContractFactory("SubjectAttributeRegistry");
  const subjectRegistry = await SubjectRegistry.deploy();
  await subjectRegistry.waitForDeployment();
  const subjectAddr = await subjectRegistry.getAddress();
  console.log("SubjectAttributeRegistry:", subjectAddr);

  // 2. Deploy DataResourceRegistry
  const DataRegistry = await ethers.getContractFactory("DataResourceRegistry");
  const dataRegistry = await DataRegistry.deploy();
  await dataRegistry.waitForDeployment();
  const dataAddr = await dataRegistry.getAddress();
  console.log("DataResourceRegistry:    ", dataAddr);

  // 3. Deploy ConsentPolicyManager (needs both registry addresses)
  const ConsentManager = await ethers.getContractFactory("ConsentPolicyManager");
  const consentManager = await ConsentManager.deploy(subjectAddr, dataAddr);
  await consentManager.waitForDeployment();
  const consentAddr = await consentManager.getAddress();
  console.log("ConsentPolicyManager:    ", consentAddr);

  // 4. Deploy ConsentAuditLog
  const AuditLog = await ethers.getContractFactory("ConsentAuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  const auditAddr = await auditLog.getAddress();
  console.log("ConsentAuditLog:         ", auditAddr);

  console.log("\n--- Deployment complete ---");
  console.log(JSON.stringify({
    SubjectAttributeRegistry: subjectAddr,
    DataResourceRegistry: dataAddr,
    ConsentPolicyManager: consentAddr,
    ConsentAuditLog: auditAddr,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
