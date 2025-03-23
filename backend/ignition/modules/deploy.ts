import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const votingModule = buildModule("VotingModule", (m) => {
  const voting = m.contract("Voting");

  return { voting };
});

export default votingModule;

async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  console.log(`✅ Voting contract deployed at: ${await voting.getAddress()}`);
  console.log(`✅ Owned by: ${await voting.owner()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});