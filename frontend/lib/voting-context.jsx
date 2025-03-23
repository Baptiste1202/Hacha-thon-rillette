"use client"

import { createContext, useContext, useState } from "react"
import { ethers } from "ethers";

// Create context
const VotingSystemContext = createContext(undefined)

// Provider component
export function VotingSystemProvider({ children }) {
  // Mock wallet connection
  const [currentAccount, setCurrentAccount] = useState(null)

  // Voting state
  const [votingState, setVotingState] = useState(0)

  // Admin status (first account is admin)
  const [isAdmin, setIsAdmin] = useState(true)

  // Voters list
  const [votersList, setVotersList] = useState([])

  // Proposals
  const [proposals, setProposals] = useState([])

  // Voting
  const [hasVoted, setHasVoted] = useState(false)
  const [votedProposalId, setVotedProposalId] = useState(null)

  // Results
  const [winningProposalId, setWinningProposalId] = useState(null)

  // Check if current account is a voter
  const isVoter = currentAccount ? votersList.includes(currentAccount) : false

  // Connect wallet (mock function)
  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("MetaMask non détecté !");
      return;
    }

    const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });

    setCurrentAccount(account);

    try {
        const contract = await ethers.getContract("Voting"); // Récupère le contrat
        const contractOwner = await contract.owner(); // Récupère l'owner du contrat
        console.log("Compte connecté :", account);
        console.log("Propriétaire du contrat :", contractOwner);
        setIsAdmin(account.toLowerCase() === contractOwner.toLowerCase()); // Vérifie si c'est l'admin
    } catch (error) {
        console.error("Erreur lors de la récupération de l'admin :", error);
    }
  };

  // Admin Functions
  const addVoter = (address) => {
    if (!isAdmin || votingState !== 0) return
    setVotersList([...votersList, address])
  }

  const startProposalsRegistration = () => {
    if (!isAdmin || votingState !== 0) return
    setVotingState(1)
  }

  const endProposalsRegistration = () => {
    if (!isAdmin || votingState !== 1) return
    setVotingState(1) // Stay in the same state until voting starts
  }

  const startVotingSession = () => {
    if (!isAdmin || votingState !== 1) return
    setVotingState(2)
  }

  const endVotingSession = () => {
    if (!isAdmin || votingState !== 2) return
    setVotingState(2) // Stay in the same state until votes are tallied
  }

  const tallyVotes = () => {
    if (!isAdmin || votingState !== 2) return

    // Find the winning proposal
    let winningVoteCount = 0
    let winningId = null

    proposals.forEach((proposal, index) => {
      if (proposal.voteCount > winningVoteCount) {
        winningVoteCount = proposal.voteCount
        winningId = index
      }
    })

    setWinningProposalId(winningId)
    setVotingState(3)
  }

  // Voter Functions
  const addProposal = (description) => {
    if (!isVoter || votingState !== 1) return
    setProposals([...proposals, { description, voteCount: 0 }])
  }

  const vote = (proposalId) => {
    if (!isVoter || votingState !== 2 || hasVoted) return

    // Update proposal vote count
    const updatedProposals = [...proposals]
    updatedProposals[proposalId].voteCount += 1

    setProposals(updatedProposals)
    setHasVoted(true)
    setVotedProposalId(proposalId)
  }

  // Context value
  const value = {
    currentAccount,
    isAdmin,
    isVoter,
    connectWallet,
    votingState,
    votersList,
    addVoter,
    proposals,
    addProposal,
    hasVoted,
    votedProposalId,
    vote,
    startProposalsRegistration,
    endProposalsRegistration,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    winningProposalId,
    setIsAdmin
  }

  return <VotingSystemContext.Provider value={value}>{children}</VotingSystemContext.Provider>
}

// Hook to use the context
export function useVotingSystem() {
  const context = useContext(VotingSystemContext)
  if (context === undefined) {
    throw new Error("useVotingSystem must be used within a VotingSystemProvider")
  }
  return context
}

