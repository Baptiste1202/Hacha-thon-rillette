// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
contract Voting is Ownable {

   struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    uint winningProposalId = 0;
    bool isActiveProposition = false;
    bool isActiveVote = false;

    mapping(address => bool) whitelist; 
    Proposal[] public proposlist;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    event Authorized(address _address);

    constructor() Ownable(msg.sender){
        whitelist[msg.sender]= true;
    }

    modifier check(){
	   require (whitelist[msg.sender]==true, "you are not authorized");
   _;}

   
    function authorize(address _address) public onlyOwner {
       whitelist[_address] = true;
       emit Authorized(_address); 
    }

    function showProposal() public view returns (Proposal[] memory) {
        return proposlist;
    }

    function demarrerSessionProposition() internal onlyOwner{
        isActiveProposition = true; 
        WorkflowStatus previousStatus = WorkflowStatus.RegisteringVoters;
        WorkflowStatus newStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }

    function fermerSessionProposition() internal onlyOwner{
        isActiveProposition = false; 
        WorkflowStatus previousStatus = WorkflowStatus.ProposalsRegistrationStarted;
        WorkflowStatus newStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }

    function demarrerSessionVote() internal onlyOwner{
        if (!isActiveProposition){
            isActiveVote = true;
            WorkflowStatus previousStatus = WorkflowStatus.ProposalsRegistrationEnded;
            WorkflowStatus newStatus = WorkflowStatus.VotingSessionStarted;
            emit WorkflowStatusChange(previousStatus, newStatus);
        } 
    }

    function fermerSessionVote() internal onlyOwner{
        isActiveVote = false;
        WorkflowStatus previousStatus = WorkflowStatus.ProposalsRegistrationStarted;
        WorkflowStatus newStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }


    function faireProposition(string memory _proposition ) public check{
        if (isActiveProposition){
            Proposal memory proposition = Proposal(_proposition,0);
            proposlist.push(proposition);
        }
    }

    function vote(Voter memory _voter, uint _propositionId) public check{
        if (_voter.isRegistered){
            if (!_voter.hasVoted){
                _voter.hasVoted = true;
                _voter.votedProposalId = _propositionId;
                proposlist[_propositionId].voteCount ++;
            }
        }
    }

    function calculMeilleurProposal() internal onlyOwner {
        require(proposlist.length > 0, "Aucune proposition disponible.");
        uint maxVotes = 0;
        uint topIndex = 0;
        for (uint i = 0; i < proposlist.length; i++) {
            if (proposlist[i].voteCount > maxVotes) {
                maxVotes = proposlist[i].voteCount;
                topIndex = i;
            }
        }
        winningProposalId = topIndex; 
    }

    function getMeilleurProposal() internal view onlyOwner returns (uint) {
        require(proposlist.length > 0, "Aucune proposition disponible.");
        return winningProposalId;
    }

    function watchVote() public view returns (Proposal[] memory, address[] memory, uint[] memory) {
        require(whitelist[msg.sender], "Vous n etes pas autorise a voir les votes.");

        // Copier les propositions
        Proposal[] memory proposalsCopy = new Proposal[](proposlist.length);
        for (uint i = 0; i < proposlist.length; i++) {
            proposalsCopy[i] = proposlist[i];
        }
        // Comptage des votants
        uint voterCount = 0;
        for (uint i = 0; i < proposlist.length; i++) {
            voterCount += proposlist[i].voteCount;
        }
        // Initialisation des tableaux de retour
        address[] memory votersList = new address[](voterCount);
        uint[] memory votedProposalIds = new uint[](voterCount);
        // Récupération des votants et de leurs votes
        for (uint i = 0; i < proposlist.length; i++) {
            for (uint j = 0; j < proposlist[i].voteCount; j++) {
                // Ici, il faudrait stocker les adresses des votants, mais il manque leur mapping
                // Hypothèse : un mapping `mapping(address => Voter) public voters;` devrait exister dans ton contrat
            }
        }
        return (proposalsCopy, votersList, votedProposalIds);
    }
}
