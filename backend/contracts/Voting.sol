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
    bool public isVotingPaused = false; // Nouvelle variable pour le bouton d'arrêt du vote

    mapping(address => bool) whitelist;
    mapping(address => Voter) voters; // Utilisation du mapping Voter pour suivre l'état de chaque votant
    Proposalpublic proposlist;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    event Authorized(address _address);
    event VotingPaused(address initiator); // Événement émis lorsque le vote est mis en pause
    event VotingResumed(address initiator); // Événement émis lorsque le vote reprend

    constructor() Ownable(msg.sender){
        whitelist[msg.sender]= true;
        voters[msg.sender].isRegistered = true; // Le propriétaire est aussi un votant enregistré
    }

    modifier check(){
        require (whitelist[msg.sender]==true && !isVotingPaused, "Vous n'êtes pas autorisé ou le vote est actuellement suspendu.");
        _;
    }

    modifier onlyOwnerAndNotPaused() {
        require(owner() == msg.sender && !isVotingPaused, "L'appelant n'est pas le propriétaire ou le vote est actuellement suspendu.");
        _;
    }

    function authorize(address _address) public onlyOwnerAndNotPaused {
        whitelist[_address] = true;
        voters[_address].isRegistered = true; // Enregistrer le votant lors de l'autorisation
        emit Authorized(_address);
    }

    function getWinner() public check returns (uint){
        return winningProposalId;
    }

    function demarrerSessionProposition() internal onlyOwnerAndNotPaused{
        isActiveProposition = true;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    function fermerSessionProposition() internal onlyOwnerAndNotPaused{
        isActiveProposition = false;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    function demarrerSessionVote() internal onlyOwnerAndNotPaused{
        if (!isActiveProposition){
            isActiveVote = true;
            emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
        }
    }

    function fermerSessionVote() internal onlyOwnerAndNotPaused{
        isActiveVote = false;
        WorkflowStatus previousStatus = WorkflowStatus.VotingSessionStarted;
        WorkflowStatus newStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }


    function faireProposition(Voter memory _voter, string memory _proposition ) public check{
        if (isActiveProposition){
            Proposal memory proposition = Proposal(_proposition,0);
            proposlist.push(proposition);
            emit ProposalRegistered(proposlist.length - 1); // Utilisation de l'index comme ID
        }
    }

    function vote(Voter memory _voter, uint _propositionId) public check{
        require(isActiveVote, "La session de vote n'est pas active.");
        require(!voters[msg.sender].hasVoted, "Vous avez déjà voté.");
        require(_propositionId < proposlist.length, "ID de proposition invalide.");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _propositionId;
        proposlist[_propositionId].voteCount ++;
        emit Voted(msg.sender, _propositionId);
    }

    function getMeilleurVote(Proposalmemory _proposlist) internal onlyOwnerAndNotPaused returns (Proposal memory){
        require(_proposlist.length > 0, "La liste des propositions est vide");
        uint maxVotes = 0;
        uint topIndex = 0;
        for (uint i = 0; i<_proposlist.length ; i++){
            if (_proposlist[i].voteCount > maxVotes) {
                maxVotes = _proposlist[i].voteCount;
                topIndex = i;
            }
        }
        return _proposlist[topIndex];
    }

    function watchVote() public view returns (Proposalmemory, addressmemory, uintmemory) {
        Proposalmemory proposals = proposlist;
        if (whitelist[msg.sender]) {
            addressmemory votersList = new address(getWhitelistSize()); // Taille basée sur le nombre de votants autorisés
            uintmemory votedProposalIds = new uint(getWhitelistSize());
            uint index = 0;

            for (uint i = 0; i < getWhitelistSize(); i++) {
                // Ceci est une approche simplifiée et pourrait ne pas être optimale en termes de gas
                // Il faudrait idéalement stocker la liste des adresses whitelistées dans un tableau pour itérer efficacement
                // Pour l'instant, on suppose qu'on peut itérer sur un grand nombre d'adresses potentielles
                // Une meilleure solution serait de maintenir une liste des votants autorisés.
                // Pour cet exemple, on va simplifier en itérant sur un grand nombre (potentiellement suffisant)
                // et en vérifiant si l'adresse est dans la whitelist.
                for (uint j = 0; j < 1000; j++) { // Limite arbitraire, à adapter
                    address voterAddress = address(uint160(j)); // Conversion pour obtenir une adresse
                    if (whitelist[voterAddress] && voters[voterAddress].hasVoted) {
                        votersList[index] = voterAddress;
                        votedProposalIds[index] = voters[voterAddress].votedProposalId;
                        index++;
                    }
                }
            }
            // Redimensionner les tableaux pour ne contenir que les votants réels
            assembly {
                mstore(votersList, index)
                mstore(votedProposalIds, index)
            }
            return (proposals, votersList, votedProposalIds);
        } else {
            Proposalmemory winner = new Proposal(1);
            return (winner, new address(0), new uint(0));
        }
    }

    // Fonction pour activer/désactiver le bouton d'arrêt du vote (seul le propriétaire peut appeler)
    function toggleVotingPause() public onlyOwner {
        isVotingPaused = !isVotingPaused;
        if (isVotingPaused) {
            emit VotingPaused(msg.sender);
        } else {
            emit VotingResumed(msg.sender);
        }
    }

    // Fonction interne pour compter le nombre de votants autorisés
    function getWhitelistSize() internal view returns (uint) {
        uint count = 0;
        // Similaire à watchVote, une meilleure approche serait de maintenir une liste des votants autorisés.
        for (uint i = 0; i < 1000; i++) { // Limite arbitraire, à adapter
            if (whitelist[address(uint160(i))]) {
                count++;
            }
        }
        return count;
    }

    // Fonction pour compter les votes et déterminer le gagnant avec la condition d'abstention
    function compterVoteFinal() public onlyOwnerAndNotPaused {
        require(isActiveVote == false, "La session de vote doit être terminée pour compter les votes.");
        require(proposlist.length > 0, "Aucune proposition n'a été soumise.");

        uint totalWhitelistedVoters = getWhitelistSize();
        uint votersWhoParticipated = 0;
        for (uint i = 0; i < 1000; i++) { // Limite arbitraire, à adapter
            if (whitelist[address(uint160(i))] && voters[address(uint160(i))].hasVoted) {
                votersWhoParticipated++;
            }
        }

        // Vérifie si plus de 50% des votants autorisés ont participé
        if (votersWhoParticipated * 2 > totalWhitelistedVoters) {
            Proposal memory meilleurVote = getMeilleurVote(proposlist);
            for (uint i = 0; i < proposlist.length; i++) {
                if (keccak256(abi.encodePacked(proposlist[i].description)) == keccak256(abi.encodePacked(meilleurVote.description))) {
                    winningProposalId = uint(i);
                    break;
                }
            }
            emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
        } else {
            winningProposalId = 0; // Ou une autre valeur pour indiquer que le vote n'a pas été validé
            emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
            emit VoterAnnouncement("Le vote n'a pas été comptabilisé car le seuil de participation n'a pas été atteint.");
        }
    }

    // Fonction pour obtenir l'état du bouton d'arrêt
    function getVotingPausedStatus() public view returns (bool) {
        return isVotingPaused;
    }
}