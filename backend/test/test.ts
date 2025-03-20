import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SimpleStorage", function () {
  let simpleStorage: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy() as Contract;
    await simpleStorage.deployed();
    [owner, user1] = await ethers.getSigners();
  });

  it("Should initialize with number 0", async function () {
    expect(await simpleStorage.getNumber()).to.equal(0);
  });

  it("Should allow the owner to set a new number", async function () {
    await simpleStorage.setNumber(42);
    expect(await simpleStorage.getNumber()).to.equal(42);
  });

  it("Should allow any external user to set a new number", async function () {
    await simpleStorage.connect(user1).setNumber(123);
    expect(await simpleStorage.getNumber()).to.equal(123);
  });

  it("Should allow setting the number to zero", async function () {
    await simpleStorage.setNumber(0);
    expect(await simpleStorage.getNumber()).to.equal(0);
  });

  it("Should allow setting a large number", async function () {
    const largeNumber = "10000000000000000000000000000000000000000000000000"; // Example large number
    await simpleStorage.setNumber(largeNumber);
    expect(await simpleStorage.getNumber()).to.equal(largeNumber);
  });

  it("Should allow setting the same number multiple times", async function () {
    await simpleStorage.setNumber(77);
    await simpleStorage.setNumber(77);
    expect(await simpleStorage.getNumber()).to.equal(77);
  });

  it("Should allow different users to set different numbers", async function () {
    await simpleStorage.connect(owner).setNumber(55);
    await simpleStorage.connect(user1).setNumber(66);
    expect(await simpleStorage.connect(owner).getNumber()).to.equal(55);
    expect(await simpleStorage.connect(user1).getNumber()).to.equal(66);
  });

  it("Should emit no events on setNumber or getNumber", async function () {
    await expect(simpleStorage.setNumber(99)).to.not.emit(simpleStorage, "NumberSet"); // Assuming no event is defined
    await expect(simpleStorage.getNumber()).to.not.emit(simpleStorage, "NumberGet"); // Assuming no event is defined
  });

  it("Should handle setting and getting the maximum uint256 value", async function () {
    const maxUint = ethers.constants.MaxUint256;
    await simpleStorage.setNumber(maxUint);
    expect(await simpleStorage.getNumber()).to.equal(maxUint);
  });

  it("Should treat input as uint256 (no negative numbers)", async function () {
    await simpleStorage.setNumber(-5); // Solidity will interpret this as a very large positive number due to underflow
    const result = await simpleStorage.getNumber();
    expect(result.toString()).to.not.equal("-5");
    expect(result.toString()).to.equal("115792089237316195423570985008687907853269984665640564039457584007913129639931"); // Expected underflow behavior
  });
});

describe("Voting", function () {
  let voting: Contract;
  let owner: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;

  beforeEach(async function () {
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy() as Contract;
    await voting.deployed();
    [owner, voter1, voter2] = await ethers.getSigners();

    // Authorize voter1
    await voting.authorize(voter1.address);
  });

  it("Should initialize with the owner authorized", async function () {
    expect(await voting.whitelist(owner.address)).to.equal(true);
  });

  it("Should allow the owner to authorize new voters", async function () {
    await voting.authorize(voter2.address);
    expect(await voting.whitelist(voter2.address)).to.equal(true);
  });

  it("Should allow an authorized voter to make a proposal during the proposition session", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposal 1");
    const proposals = await voting.proposlist(0);
    expect(proposals.description).to.equal("Proposal 1");
  });

  it("Should not allow an unauthorized voter to make a proposal", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await expect(voting.connect(voter2).faireProposition(voter2.address, "Proposal 2")).to.be.revertedWith("you are not authorized");
  });

  it("Should allow the owner to start and end the proposition session", async function () {
    expect(await voting.isActiveProposition()).to.equal(false);
    await voting.connect(owner).demarrerSessionProposition();
    expect(await voting.isActiveProposition()).to.equal(true);
    await voting.connect(owner).fermerSessionProposition();
    expect(await voting.isActiveProposition()).to.equal(false);
  });

  it("Should allow an authorized voter to vote during the voting session", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposal to vote for");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await voting.connect(voter1).vote(voter1.address, 0);
    // We can't directly check the vote count from here without a getter, but the absence of revert implies success
  });

  it("Should not allow an unauthorized voter to vote", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposal to vote for");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await expect(voting.connect(voter2).vote(voter2.address, 0)).to.be.revertedWith("you are not authorized");
  });

  it("Should not allow voting before the voting session starts", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposal to vote for");
    await voting.connect(owner).fermerSessionProposition();
    await expect(voting.connect(voter1).vote(voter1.address, 0)).to.be.reverted; // Should revert as voting hasn't started
  });

  it("Should allow the owner to start and end the voting session", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposal to vote for");
    await voting.connect(owner).fermerSessionProposition();
    expect(await voting.isActiveVote()).to.equal(false);
    await voting.connect(owner).demarrerSessionVote();
    expect(await voting.isActiveVote()).to.equal(true);
    await voting.connect(owner).fermerSessionVote();
    expect(await voting.isActiveVote()).to.equal(false);
  });

  it("Should allow the owner to count votes and get the winner (basic case)", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposal A");
    await voting.connect(voter1).faireProposition(voter1.address, "Proposal B");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await voting.connect(voter1).vote(voter1.address, 0); // Vote for Proposal A
    await voting.connect(owner).fermerSessionVote();
    const winner = await voting.connect(owner).compterVote(await voting.proposlist());
    expect(winner[0]).to.equal("Proposal A");
    expect(winner[1]).to.equal(1);
  });
});



