import { ethers } from "ethers"

// ABI du contrat Voting - à remplacer par votre ABI réel
const contractABI = [
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_address",
					"type": "address"
				}
			],
			"name": "authorize",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_proposition",
					"type": "string"
				}
			],
			"name": "faireProposition",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "owner",
					"type": "address"
				}
			],
			"name": "OwnableInvalidOwner",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "OwnableUnauthorizedAccount",
			"type": "error"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "_address",
					"type": "address"
				}
			],
			"name": "Authorized",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "previousOwner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "OwnershipTransferred",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				}
			],
			"name": "ProposalRegistered",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "renounceOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "transferOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"components": [
						{
							"internalType": "bool",
							"name": "isRegistered",
							"type": "bool"
						},
						{
							"internalType": "bool",
							"name": "hasVoted",
							"type": "bool"
						},
						{
							"internalType": "uint256",
							"name": "votedProposalId",
							"type": "uint256"
						}
					],
					"internalType": "struct Voting.Voter",
					"name": "_voter",
					"type": "tuple"
				},
				{
					"internalType": "uint256",
					"name": "_propositionId",
					"type": "uint256"
				}
			],
			"name": "vote",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "voter",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				}
			],
			"name": "Voted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "voterAddress",
					"type": "address"
				}
			],
			"name": "VoterRegistered",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "enum Voting.WorkflowStatus",
					"name": "previousStatus",
					"type": "uint8"
				},
				{
					"indexed": false,
					"internalType": "enum Voting.WorkflowStatus",
					"name": "newStatus",
					"type": "uint8"
				}
			],
			"name": "WorkflowStatusChange",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "proposlist",
			"outputs": [
				{
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "voteCount",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "showProposal",
			"outputs": [
				{
					"components": [
						{
							"internalType": "string",
							"name": "description",
							"type": "string"
						},
						{
							"internalType": "uint256",
							"name": "voteCount",
							"type": "uint256"
						}
					],
					"internalType": "struct Voting.Proposal[]",
					"name": "",
					"type": "tuple[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "watchVote",
			"outputs": [
				{
					"components": [
						{
							"internalType": "string",
							"name": "description",
							"type": "string"
						},
						{
							"internalType": "uint256",
							"name": "voteCount",
							"type": "uint256"
						}
					],
					"internalType": "struct Voting.Proposal[]",
					"name": "",
					"type": "tuple[]"
				},
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				},
				{
					"internalType": "uint256[]",
					"name": "",
					"type": "uint256[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]

// Adresse du contrat déployé - à remplacer par votre adresse réelle
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// Fonction pour obtenir une instance du contrat
export async function getContract() {
  // Vérifier si window.ethereum existe (MetaMask est installé)
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      // Demander à l'utilisateur de se connecter à MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Créer un provider ethers avec MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      // Créer un signer pour les transactions
      const signer = provider.getSigner()

      // Créer une instance du contrat
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      return contract
    } catch (error) {
      console.error("Erreur lors de la connexion au contrat:", error)
      throw new Error("Impossible de se connecter au contrat. Vérifiez que MetaMask est installé et connecté.")
    }
  } else {
    throw new Error("MetaMask n'est pas installé. Veuillez installer MetaMask pour utiliser cette application.")
  }
}

// Fonction pour vérifier si l'utilisateur est l'administrateur
export async function isAdmin() {
	try {
	  const contract = await getContract()
	  const owner = await contract.owner()
	  const accounts = await window.ethereum.request({ method: "eth_accounts" })
	  return accounts[0].toLowerCase() === owner.toLowerCase()
	} catch (error) {
	  console.error("Erreur lors de la vérification du statut d'administrateur:", error)
	  return false
	}
  }
  
  // Fonction pour vérifier si une adresse est autorisée (dans la whitelist)
  export async function isAuthorized(address) {
	try {
	  // Nous n'avons pas de fonction directe pour vérifier si une adresse est dans la whitelist
	  // Nous pouvons essayer d'écouter les événements Authorized passés
	  const contract = await getContract()
	  const provider = new ethers.providers.Web3Provider(window.ethereum)
  
	  const filter = contract.filters.Authorized(address)
	  const events = await provider.getLogs({
		fromBlock: 0,
		toBlock: "latest",
		address: contractAddress,
		topics: filter.topics,
	  })
  
	  return events.length > 0
	} catch (error) {
	  console.error("Erreur lors de la vérification de l'autorisation:", error)
	  return false
	}
  }
  
  // Fonction pour autoriser un votant
  export async function authorizeVoter(address) {
	try {
	  const contract = await getContract()
	  const tx = await contract.authorize(address)
	  await tx.wait()
	  return true
	} catch (error) {
	  console.error("Erreur lors de l'autorisation du votant:", error)
	  throw error
	}
  }
  
  // Fonction pour récupérer toutes les propositions
  export async function getProposals() {
	try {
	  const contract = await getContract()
	  const proposals = await contract.showProposal()
  
	  // Transformer les propositions en format plus facile à utiliser
	  return proposals.map((proposal, index) => ({
		id: index,
		description: proposal.description,
		voteCount: Number(proposal.voteCount),
	  }))
	} catch (error) {
	  console.error("Erreur lors de la récupération des propositions:", error)
	  return []
	}
  }
  
  // Fonction pour soumettre une proposition
  export async function submitProposal(description) {
	try {
	  const contract = await getContract()
	  const tx = await contract.faireProposition(description)
	  await tx.wait()
	  return true
	} catch (error) {
	  console.error("Erreur lors de la soumission de la proposition:", error)
	  throw error
	}
  }
  
  // Fonction pour voter pour une proposition
  // Note: Cette fonction est problématique car le contrat attend un struct Voter
  // qui n'est pas facilement accessible depuis l'extérieur
  export async function voteForProposal(proposalId) {
	try {
	  const contract = await getContract()
  
	  // Créer un objet Voter vide - cela ne fonctionnera probablement pas comme prévu
	  // car le contrat devrait avoir un mapping pour stocker les votants
	  const voter = {
		isRegistered: true,
		hasVoted: false,
		votedProposalId: 0,
	  }
  
	  const tx = await contract.vote(voter, proposalId)
	  await tx.wait()
	  return true
	} catch (error) {
	  console.error("Erreur lors du vote:", error)
	  throw error
	}
  }
  
  // Fonction pour récupérer les résultats du vote
  export async function getVoteResults() {
	try {
	  const contract = await getContract()
	  const [proposals, voters, votedProposalIds] = await contract.watchVote()
  
	  return {
		proposals: proposals.map((proposal, index) => ({
		  id: index,
		  description: proposal.description,
		  voteCount: Number(proposal.voteCount),
		})),
		voters,
		votedProposalIds: votedProposalIds.map((id) => Number(id)),
	  }
	} catch (error) {
	  console.error("Erreur lors de la récupération des résultats du vote:", error)
	  return { proposals: [], voters: [], votedProposalIds: [] }
	}
  }
  
  // Fonction pour obtenir la proposition gagnante
  export async function getWinningProposal() {
	try {
	  const proposals = await getProposals()
	  if (proposals.length === 0) return null
  
	  // Trouver la proposition avec le plus de votes
	  return proposals.reduce(
		(winner, current) => (current.voteCount > winner.voteCount ? current : winner),
		proposals[0],
	  )
	} catch (error) {
	  console.error("Erreur lors de la récupération de la proposition gagnante:", error)
	  return null
	}
  }
  
  // Fonction pour écouter les événements
  export function listenToEvents(callbacks = {}) {
	const setupListeners = async () => {
	  try {
		const contract = await getContract()
  
		if (callbacks.onAuthorized) {
		  contract.on("Authorized", (address) => {
			callbacks.onAuthorized(address)
		  })
		}
  
		if (callbacks.onProposalRegistered) {
		  contract.on("ProposalRegistered", (proposalId) => {
			callbacks.onProposalRegistered(Number(proposalId))
		  })
		}
  
		if (callbacks.onVoted) {
		  contract.on("Voted", (voter, proposalId) => {
			callbacks.onVoted(voter, Number(proposalId))
		  })
		}
  
		if (callbacks.onWorkflowStatusChange) {
		  contract.on("WorkflowStatusChange", (previousStatus, newStatus) => {
			callbacks.onWorkflowStatusChange(Number(previousStatus), Number(newStatus))
		  })
		}
  
		return () => {
		  contract.removeAllListeners()
		}
	  } catch (error) {
		console.error("Erreur lors de la configuration des écouteurs d'événements:", error)
	  }
	}
  
	return setupListeners()
  }
  
  // Fonction pour obtenir l'adresse du compte connecté
  export async function getConnectedAccount() {
	if (typeof window !== "undefined" && window.ethereum) {
	  try {
		const accounts = await window.ethereum.request({ method: "eth_accounts" })
		return accounts[0] || null
	  } catch (error) {
		console.error("Erreur lors de la récupération du compte:", error)
		return null
	  }
	}
	return null
  }
  

