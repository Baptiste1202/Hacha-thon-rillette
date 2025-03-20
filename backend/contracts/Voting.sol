pragma solidity ^0.8.28;
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

    uint winningProposalId;
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

    function getWinner() public check returns (uint){
        return winningProposalId; 
    }

    function demarrerSessionProposition() internal onlyOwner{
        isActiveProposition = true; 
        WorkflowStatus previousStatus = RegisteringVoters;
        WorkflowStatus newStatus = ProposalsRegistrationStarted;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }

    function fermerSessionProposition() internal onlyOwner{
        isActiveProposition = false; 
        WorkflowStatus previousStatus = ProposalsRegistrationStarted;
        WorkflowStatus newStatus = ProposalsRegistrationEnded;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }

    function demarrerSessionVote() internal onlyOwner{
        if (!isActiveProposition){
            isActiveVote = true;
            WorkflowStatus previousStatus = ProposalsRegistrationEnded;
            WorkflowStatus newStatus = VotingSessionStarted;
            emit WorkflowStatusChange(previousStatus, newStatus);
        } 
    }

    function fermerSessionVote() internal onlyOwner{
        isActiveVote = false;
        previousStatus = WorkflowStatus.ProposalsRegistrationStarted;
        WorkflowStatus newStatus = VotingSessionEnded;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }


    function faireProposition(Voter memory _voter, string memory _proposition ) public check{
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

    function getMeilleurVote(proposlist) internal onlyOwner returns (Voter memory){
        require(proposlist.length > 0, "Array is empty");
        uint max = 0;
        uint topIndex = 0;
        for (uint i = 0; i<proposlist.lenght ; i++){
            if (proposlist[i].voteCount > max) {
                max = proposlist[i].voteCount;
                topIndex = i;
            }
        }
        return (proposlist[topIndex]);
    }

    function watchVote() public view returns (Proposal[] memory, address[] memory, uint[] memory) {
        Proposal[] memory proposals = proposlist;
        if (whitelist[msg.sender]) {
            address[] memory votersList = new address[](proposlist.length);
            uint[] memory votedProposalIds = new uint[](proposlist.length);
            uint index = 0;

            for (uint i = 0; i < proposlist.length; i++) {
                for (uint j = 0; j < proposlist.length; j++) {
                    if (voters[j].hasVoted) {
                        votersList[index] = address(j);
                        votedProposalIds[index] = voters[j].votedProposalId;
                        index++;
                    }
                }
            }
            return (proposals, votersList, votedProposalIds);
        } else {
            Proposal[] memory winner = new Proposal[](1);
            winner , new uint );
        }
    }
}