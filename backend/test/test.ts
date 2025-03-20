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

    // Autorise le votant1 et le votant2
    await voting.authorize(voter1.address);
    await voting.authorize(voter2.address);
  });

  // ... (vos tests précédents ici) ...

  // Tests pour le bouton d'arrêt d'urgence (Panic Button)
  describe("Panic Button (Arrêt d'Urgence)", function () {
    it("Seul le propriétaire devrait pouvoir mettre le vote en pause", async function () {
      await expect(voting.connect(unauthorizedUser).toggleVotingPause()).to.be.reverted;
    });

    it("Le propriétaire devrait pouvoir mettre le vote en pause et l'événement VotingPaused devrait être émis", async function () {
      await voting.connect(owner).demarrerSessionVote();
      expect(await voting.isVotingPaused()).to.equal(false);
      await expect(voting.connect(owner).toggleVotingPause())
        .to.emit(voting, "VotingPaused")
        .withArgs(owner.address);
      expect(await voting.isVotingPaused()).to.equal(true);
    });

    it("Le propriétaire devrait pouvoir reprendre le vote et l'événement VotingResumed devrait être émis", async function () {
      await voting.connect(owner).demarrerSessionVote();
      await voting.connect(owner).toggleVotingPause(); // Mettre en pause d'abord
      expect(await voting.isVotingPaused()).to.equal(true);
      await expect(voting.connect(owner).toggleVotingPause())
        .to.emit(voting, "VotingResumed")
        .withArgs(owner.address);
      expect(await voting.isVotingPaused()).to.equal(false);
    });

    it("Un votant autorisé ne devrait pas pouvoir voter lorsque le vote est en pause", async function () {
      await voting.connect(owner).demarrerSessionProposition();
      await voting.connect(voter1).faireProposition(voter1.address, "Proposition test");
      await voting.connect(owner).fermerSessionProposition();
      await voting.connect(owner).demarrerSessionVote();
      await voting.connect(owner).toggleVotingPause(); // Mettre le vote en pause
      await expect(voting.connect(voter1).vote(voter1.address, 0)).to.be.revertedWith("Vous n'êtes pas autorisé ou le vote est actuellement suspendu.");
    });

    it("Un votant autorisé devrait pouvoir voter lorsque le vote n'est pas en pause", async function () {
      await voting.connect(owner).demarrerSessionProposition();
      await voting.connect(voter1).faireProposition(voter1.address, "Proposition test");
      await voting.connect(owner).fermerSessionProposition();
      await voting.connect(owner).demarrerSessionVote();
      await expect(voting.connect(voter1).vote(voter1.address, 0)).to.not.be.reverted;
    });
  });

  // Tests pour la condition d'abstention (plus de 50% d'abstention)
  describe("Condition d'Abstention (Plus de 50%)", function () {
    beforeEach(async function () {
      // S'assurer que la session de proposition est terminée et la session de vote a démarré
      await voting.connect(owner).demarrerSessionProposition();
      await voting.connect(voter1).faireProposition(voter1.address, "Proposition 1");
      await voting.connect(owner).fermerSessionProposition();
      await voting.connect(owner).demarrerSessionVote();
    });

    it("Si plus de 50% des votants autorisés n'ont pas voté, le vote ne devrait pas être comptabilisé", async function () {
      // Seul le votant1 a été autorisé (en plus du propriétaire).
      // Si seul le propriétaire vote (ou personne), l'abstention est de 50% ou plus (en considérant le propriétaire comme votant autorisé).
      await voting.connect(owner).fermerSessionVote();
      await voting.connect(owner).compterVoteFinal();
      expect(await voting.winningProposalId()).to.equal(0); // Devrait rester à la valeur par défaut ou être mis à une valeur indiquant l'échec
      // Vérifier l'émission de l'annonce (si vous l'avez implémentée)
      const eventFilter = voting.filters.VoterAnnouncement("Le vote n'a pas été comptabilisé car le seuil de participation n'a pas été atteint.");
      const events = await voting.queryFilter(eventFilter);
      expect(events.length).to.equal(1);
    });

    it("Si plus de 50% des votants autorisés ont voté, le vote devrait être comptabilisé", async function () {
      // Autorisation de 2 votants (voter1 et voter2) + le propriétaire (3 au total).
      // Si au moins 2 personnes votent, le seuil est atteint.
      await voting.connect(voter1).vote(voter1.address, 0);
      await voting.connect(voter2).vote(voter2.address, 0);
      await voting.connect(owner).fermerSessionVote();
      await voting.connect(owner).compterVoteFinal();
      expect(await voting.winningProposalId()).to.equal(0); // La proposition à l'index 0 devrait être la gagnante
      const eventFilter = voting.filters.VoterAnnouncement("Le vote n'a pas été comptabilisé car le seuil de participation n'a pas été atteint.");
      const events = await voting.queryFilter(eventFilter);
      expect(events.length).to.equal(0);
    });

    it("Si exactement 50% des votants autorisés ont voté, le vote ne devrait pas être comptabilisé (en supposant une majorité stricte > 50%)", async function () {
      // Autorisation de 2 votants (voter1 et voter2) + le propriétaire (3 au total).
      // Si seulement 1 personne vote (en plus du propriétaire qui ne vote pas dans ce scénario), l'abstention est supérieure à 50%.
      await voting.connect(voter1).vote(voter1.address, 0);
      await voting.connect(owner).fermerSessionVote();
      await voting.connect(owner).compterVoteFinal();
      expect(await voting.winningProposalId()).to.equal(0);
      const eventFilter = voting.filters.VoterAnnouncement("Le vote n'a pas été comptabilisé car le seuil de participation n'a pas été atteint.");
      const events = await voting.queryFilter(eventFilter);
      expect(events.length).to.equal(1);
    });

    it("Le propriétaire devrait pouvoir compter les votes après la fin de la session de vote", async function () {
      await voting.connect(owner).fermerSessionVote();
      await expect(voting.connect(owner).compterVoteFinal()).to.not.be.reverted;
    });

    it("Tenter de compter les votes avant la fin de la session de vote devrait échouer", async function () {
      await expect(voting.connect(owner).compterVoteFinal()).to.be.revertedWith("La session de vote doit être terminée pour compter les votes.");
    });
  });
});