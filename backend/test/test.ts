import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Voting", function () {
  let voting: Contract;
  let owner: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let unauthorizedUser: SignerWithAddress;

  beforeEach(async function () {
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy() as Contract;
    await voting.deployed();

    [owner, voter1, voter2, unauthorizedUser] = await ethers.getSigners();

    // Autorise le votant1
    await voting.authorize(voter1.address);
  });

  // Tests d'initialisation
  it("Devrait initialiser avec le propriétaire autorisé", async function () {
    expect(await voting.whitelist(owner.address)).to.equal(true);
  });

  // Tests d'autorisation
  it("Seul le propriétaire devrait pouvoir autoriser de nouveaux votants", async function () {
    await voting.connect(owner).authorize(voter2.address);
    expect(await voting.whitelist(voter2.address)).to.equal(true);
  });

  it("Un utilisateur non propriétaire ne devrait pas pouvoir autoriser de nouveaux votants", async function () {
    await expect(voting.connect(unauthorizedUser).authorize(voter2.address)).to.be.reverted;
  });

  it("L'événement Authorized devrait être émis lors de l'autorisation d'un votant", async function () {
    await expect(voting.connect(owner).authorize(voter2.address))
      .to.emit(voting, "Authorized")
      .withArgs(voter2.address);
  });

  // Tests de la session de proposition
  it("Un votant autorisé devrait pouvoir faire une proposition pendant la session de proposition", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition A");
    const proposal = await voting.proposlist(0);
    expect(proposal.description).to.equal("Proposition A");
  });

  it("Un votant non autorisé ne devrait pas pouvoir faire de proposition", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await expect(voting.connect(unauthorizedUser).faireProposition(unauthorizedUser.address, "Proposition non autorisée")).to.be.revertedWith("you are not authorized");
  });

  it("Les propositions ne devraient pas pouvoir être faites avant le début de la session de proposition", async function () {
    await expect(voting.connect(voter1).faireProposition(voter1.address, "Proposition prématurée")).to.be.reverted;
  });

  it("Les propositions ne devraient pas pouvoir être faites après la fin de la session de proposition", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(owner).fermerSessionProposition();
    await expect(voting.connect(voter1).faireProposition(voter1.address, "Proposition tardive")).to.be.reverted;
  });

  it("L'événement ProposalRegistered devrait être émis lors de l'enregistrement d'une proposition", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await expect(voting.connect(voter1).faireProposition(voter1.address, "Proposition B"))
      .to.emit(voting, "ProposalRegistered")
      .withArgs(0); // L'ID de la première proposition sera 0 (index du tableau)
  });

  it("L'événement WorkflowStatusChange devrait être émis au démarrage et à la fin de la session de proposition", async function () {
    await expect(voting.connect(owner).demarrerSessionProposition())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(0, 1); // RegisteringVoters -> ProposalsRegistrationStarted

    await expect(voting.connect(owner).fermerSessionProposition())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(1, 2); // ProposalsRegistrationStarted -> ProposalsRegistrationEnded
  });

  // Tests de la session de vote
  it("Un votant autorisé devrait pouvoir voter pendant la session de vote", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition à voter");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await expect(voting.connect(voter1).vote(voter1.address, 0)).to.not.be.reverted;
  });

  it("Un votant non autorisé ne devrait pas pouvoir voter", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition à voter");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await expect(voting.connect(unauthorizedUser).vote(unauthorizedUser.address, 0)).to.be.revertedWith("you are not authorized");
  });

  it("Les votes ne devraient pas pouvoir être effectués avant le début de la session de vote", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition à voter");
    await voting.connect(owner).fermerSessionProposition();
    await expect(voting.connect(voter1).vote(voter1.address, 0)).to.be.reverted;
  });

  it("Les votes ne devraient pas pouvoir être effectués après la fin de la session de vote", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition à voter");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await voting.connect(owner).fermerSessionVote();
    await expect(voting.connect(voter1).vote(voter1.address, 0)).to.be.reverted;
  });

  // Note: La logique pour empêcher un votant de voter plusieurs fois n'est pas encore complètement implémentée dans votre contrat.

  it("L'événement Voted devrait être émis lors d'un vote", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition à voter");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await expect(voting.connect(voter1).vote(voter1.address, 0))
      .to.emit(voting, "Voted")
      .withArgs(voter1.address, 0);
  });

  it("L'événement WorkflowStatusChange devrait être émis au démarrage et à la fin de la session de vote", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(owner).fermerSessionProposition();
    await expect(voting.connect(owner).demarrerSessionVote())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(2, 3); // ProposalsRegistrationEnded -> VotingSessionStarted

    await expect(voting.connect(owner).fermerSessionVote())
      .to.emit(voting, "WorkflowStatusChange")
      .withArgs(3, 4); // VotingSessionStarted -> VotingSessionEnded
  });

  // Tests du comptage des votes
  it("Seul le propriétaire devrait pouvoir compter les votes", async function () {
    await expect(voting.connect(unauthorizedUser).compterVote(await voting.proposlist())).to.be.reverted;
  });

  it("Devrait permettre au propriétaire de compter les votes et de retourner le gagnant (cas simple)", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition A");
    await voting.connect(voter1).faireProposition(voter1.address, "Proposition B");
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    await voting.connect(voter1).vote(voter1.address, 0); // Vote pour Proposition A
    await voting.connect(owner).fermerSessionVote();
    const winner = await voting.connect(owner).compterVote(await voting.proposlist());
    expect(winner[0]).to.equal("Proposition A");
    expect(winner[1]).to.equal(1);
    // Note: Votre fonction compterVote ne met pas encore à jour winningProposalId.
  });

  it("Devrait retourner une erreur si la liste des propositions est vide lors du comptage des votes", async function () {
    await expect(voting.connect(owner).compterVote()).to.be.revertedWith("Array is empty");
  });
});
