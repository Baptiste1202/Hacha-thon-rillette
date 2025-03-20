pragma solidity ^0.8.28;
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Voting
 * @dev Contrat de vote simple avec gestion des propositions, des votes et un statut de flux de travail.
 */
contract Voting is Ownable {

    /**
     * @dev Structure représentant un votant.
     * @param isRegistered Indique si le votant est enregistré.
     * @param hasVoted Indique si le votant a déjà voté.
     * @param votedProposalId L'ID de la proposition pour laquelle le votant a voté.
     */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /**
     * @dev Structure représentant une proposition.
     * @param description La description de la proposition.
     * @param voteCount Le nombre de votes pour cette proposition.
     */
    struct Proposal {
        string description;
        uint voteCount;
    }

    /**
     * @dev Énumération représentant les différentes étapes du flux de travail du vote.
     */
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    uint public winningProposalId;
    bool public isActiveProposition = false;
    bool public isActiveVote = false;
    bool public isVotingPaused = false; // Nouvelle variable pour le bouton d'arrêt du vote

    mapping(address => bool) public whitelist;
    mapping(address => Voter) public voters; // Utilisation du mapping Voter pour suivre l'état de chaque votant
    Proposalpublic proposlist;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    event Authorized(address _address);
    event VotingPaused(address initiator); // Événement émis lorsque le vote est mis en pause
    event VotingResumed(address initiator); // Événement émis lorsque le vote reprend

    /**
     * @dev Constructeur du contrat.
     * @param _owner L'adresse du propriétaire du contrat.
     */
    constructor() Ownable(msg.sender){
        whitelist[msg.sender]= true;
        voters[msg.sender].isRegistered = true; // Le propriétaire est aussi un votant enregistré
    }

    /**
     * @dev Modificateur pour vérifier si l'appelant est autorisé et si le vote n'est pas en pause.
     */
    modifier check(){
        require (whitelist[msg.sender]==true && !isVotingPaused, "Vous n'êtes pas autorisé ou le vote est actuellement suspendu.");
        _;
    }

    /**
     * @dev Modificateur pour vérifier si l'appelant est le propriétaire et si le vote n'est pas en pause.
     */
    modifier onlyOwnerAndNotPaused() {
        require(owner() == msg.sender && !isVotingPaused, "L'appelant n'est pas le propriétaire ou le vote est actuellement suspendu.");
        _;
    }

    /**
     * @dev Autorise une adresse à voter. Seul le propriétaire peut appeler cette fonction.
     * @param _address L'adresse à autoriser.
     */
    function authorize(address _address) public onlyOwnerAndNotPaused {
        whitelist[_address] = true;
        voters[_address].isRegistered = true; // Enregistrer le votant lors de l'autorisation
        emit Authorized(_address);
    }

    /**
     * @dev Retourne l'ID de la proposition gagnante. Accessible uniquement aux votants autorisés.
     * @return L'ID de la proposition gagnante.
     */
    function getWinner() public check returns (uint){
        return winningProposalId;
    }

    /**
     * @dev Démarre la session d'enregistrement des propositions. Seul le propriétaire peut appeler cette fonction.
     */
    function demarrerSessionProposition() internal onlyOwnerAndNotPaused{
        isActiveProposition = true;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev Ferme la session d'enregistrement des propositions. Seul le propriétaire peut appeler cette fonction.
     */
    function fermerSessionProposition() internal onlyOwnerAndNotPaused{
        isActiveProposition = false;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev Démarre la session de vote. Seul le propriétaire peut appeler cette fonction et la session de proposition doit être terminée.
     */
    function demarrerSessionVote() internal onlyOwnerAndNotPaused{
        if (!isActiveProposition){
            isActiveVote = true;
            emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
        }
    }

    /**
     * @dev Ferme la session de vote. Seul le propriétaire peut appeler cette fonction.
     */
    function fermerSessionVote() internal onlyOwnerAndNotPaused{
        isActiveVote = false;
        WorkflowStatus previousStatus = WorkflowStatus.VotingSessionStarted;
        WorkflowStatus newStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(previousStatus, newStatus);
    }


    /**
     * @dev Permet à un votant autorisé de soumettre une proposition pendant la session de proposition.
     * @param _voter Les informations du votant (devrait être l'appelant).
     * @param _proposition La description de la proposition.
     */
    function faireProposition(Voter memory _voter, string memory _proposition ) public check{
        if (isActiveProposition){
            Proposal memory proposition = Proposal(_proposition,0);
            proposlist.push(proposition);
            emit ProposalRegistered(proposlist.length - 1); // Utilisation de l'index comme ID
        }
    }

    /**
     * @dev Permet à un votant autorisé de voter pour une proposition pendant la session de vote.
     * @param _voter Les informations du votant (devrait être l'appelant).
     * @param _propositionId L'ID de la proposition pour laquelle voter.
     */
    function vote(Voter memory _voter, uint _propositionId) public check{
        require(isActiveVote, "La session de vote n'est pas active.");
        require(!voters[msg.sender].hasVoted, "Vous avez déjà voté.");
        require(_propositionId < proposlist.length, "ID de proposition invalide.");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _propositionId;
        proposlist[_propositionId].voteCount ++;
        emit Voted(msg.sender, _propositionId);
    }

    /**
     * @dev Fonction interne pour déterminer la proposition avec le plus de votes. Seul le propriétaire peut appeler cette fonction.
     * @param _proposlist La liste des propositions.
     * @return La proposition avec le plus de votes.
     */
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

    /**
     * @dev Permet de visualiser les propositions et les votes (informations potentiellement limitées pour des raisons de confidentialité). Accessible uniquement aux votants autorisés.
     * @return Un tuple contenant la liste des propositions, la liste des adresses des votants et la liste des IDs des propositions votées.
     */
    function watchVote() public view returns (Proposalmemory, addressmemory, uintmemory) {
        Proposalmemory proposals = proposlist;
        if (whitelist[msg.sender]) {
            uint whitelistSize = getWhitelistSize();
            addressmemory votersList = new address(whitelistSize);
            uintmemory votedProposalIds = new uint(whitelistSize);
            uint index = 0;

            for (uint i = 0; i < whitelistSize; i++) {
                address voterAddress = address(uint160(i)); // Approche simplifiée pour itérer sur les adresses
                if (whitelist[voterAddress] && voters[voterAddress].hasVoted) {
                    votersList[index] = voterAddress;
                    votedProposalIds[index] = voters[voterAddress].votedProposalId;
                    index++;
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

    /**
     * @dev Active ou désactive le bouton d'arrêt d'urgence pour le vote. Seul le propriétaire peut appeler cette fonction.
     */
    function toggleVotingPause() public onlyOwner {
        isVotingPaused = !isVotingPaused;
        if (isVotingPaused) {
            emit VotingPaused(msg.sender);
        } else {
            emit VotingResumed(msg.sender);
        }
    }

    /**
     * @dev Fonction interne pour compter le nombre de votants autorisés.
     * @return Le nombre de votants autorisés.
     */
    function getWhitelistSize() internal view returns (uint) {
        uint count = 0;
        // Approche simplifiée pour itérer sur les adresses. Une meilleure solution serait de maintenir une liste.
        for (uint i = 0; i < 1000; i++) {
            if (whitelist[address(uint160(i))]) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Compte les votes et détermine le gagnant, avec une condition de participation minimale. Seul le propriétaire peut appeler cette fonction après la fin de la session de vote.
     */
    function compterVoteFinal() public onlyOwnerAndNotPaused {
        require(isActiveVote == false, "La session de vote doit être terminée pour compter les votes.");
        require(proposlist.length > 0, "Aucune proposition n'a été soumise.");

        uint totalWhitelistedVoters = getWhitelistSize();
        uint votersWhoParticipated = 0;
        for (uint i = 0; i < 1000; i++) {
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
            winningProposalId = 0; // Indique qu'aucun gagnant n'a été déterminé en raison d'une participation insuffisante
            emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
            emit VoterAnnouncement("Le vote n'a pas été comptabilisé car le seuil de participation n'a pas été atteint.");
        }
    }

    /**
     * @dev Retourne l'état actuel du bouton d'arrêt du vote.
     * @return True si le vote est en pause, false sinon.
     */
    function getVotingPausedStatus() public view returns (bool) {
        return isVotingPaused;
    }
}