import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Voting", function () {
  let voting: Contract;
  let owner: SignerWithAddress;
  let voter1: SignerWithAddress;

  beforeEach(async function () {
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy() as Contract;
    await voting.deployed();

    [owner, voter1] = await ethers.getSigners();

    await voting.authorize(voter1.address);
  });

  it("Devrait permettre au propriétaire de démarrer la session de proposition", async function () {
    // Appelle la fonction demarrerSessionProposition sur l'instance du contrat 'voting'
    await voting.connect(owner).demarrerSessionProposition();
    // Vérifiez que l'état 'isActiveProposition' est passé à true
    expect(await voting.isActiveProposition()).to.equal(true);
  });

  it("Devrait permettre au propriétaire de terminer la session de proposition", async function () {
    await voting.connect(owner).demarrerSessionProposition();
    // Appelle la fonction fermerSessionProposition
    await voting.connect(owner).fermerSessionProposition();
    // Vérifiez que l'état 'isActiveProposition' est revenu à false
    expect(await voting.isActiveProposition()).to.equal(false);
  });

  it("Devrait permettre au propriétaire de démarrer la session de vote", async function () {
    // Assurez-vous que la session de proposition est terminée
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(owner).fermerSessionProposition();
    // Appelle la fonction demarrerSessionVote
    await voting.connect(owner).demarrerSessionVote();
    // Vérifiez que l'état 'isActiveVote' est passé à true
    expect(await voting.isActiveVote()).to.equal(true);
  });

  it("Devrait permettre au propriétaire de terminer la session de vote", async function () {
    // Assurez-vous que la session de vote est démarrée
    await voting.connect(owner).demarrerSessionProposition();
    await voting.connect(owner).fermerSessionProposition();
    await voting.connect(owner).demarrerSessionVote();
    // Appelle la fonction fermerSessionVote
    await voting.connect(owner).fermerSessionVote();
    // Vérifiez que l'état 'isActiveVote' est revenu à false
    expect(await voting.isActiveVote()).to.equal(false);
  });

  // Vous pouvez ajouter d'autres tests pour les autres fonctions comme faireProposition, vote, etc.
});