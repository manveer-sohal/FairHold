const { ethers } = require("hardhat");

async function main() {
  const Factory = await ethers.getContractFactory("AgreementFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const addr = await factory.getAddress();
  console.log("AgreementFactory:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
