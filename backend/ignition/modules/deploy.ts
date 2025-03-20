import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const votingModule = buildModule("VotingModule", (m) => {

  const voting = m.contract("Voting");

  console.log("Voting contract deployment initiated");

  return { voting };
});

export default votingModule;