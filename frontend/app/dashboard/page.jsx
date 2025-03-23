"use client"

import { ethers } from "ethers";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"; // Ajouté pour récupérer l'adresse
import { useVotingSystem } from "@/lib/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPanel } from "@/components/admin-panel"
import { VoterRegistration } from "@/components/voter-registration"
import { ProposalSubmission } from "@/components/proposal-submission"
import { ResultsDisplay } from "@/components/results-display"
import VotingContractABI from "@/lib/VotingContractABI.json";
import { getContract } from "@/lib/votingService";
import { ContractStatus } from "@/components/contractStatus"

export default function Dashboard() {
  const { address, isConnected } = useAccount(); // Utilisation de wagmi
  const [activeTab, setActiveTab] = useState("overview")

  const { isAdmin, votingState, connectWallet } = useVotingSystem();

  // Puis utilisez-le pour créer une instance du contrat
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (isConnected) {
      connectWallet();
    }
  }, [isConnected]);

  useEffect(() => {
    const initContract = async () => {
      
      if (address && window.ethereum) {
        try {
          // 1. Adresse du contrat déployé
          const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Remplacez par l'adresse réelle de votre contrat
  
          // 2. Provider et signer
          const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat ou Ganache
          const signer = await provider.getSigner();
          
          // 3. Création de l'instance du contrat avec les 3 paramètres requis
          const votingContract = new ethers.Contract(
            contractAddress,  // Adresse du contrat (string)
            VotingContractABI, // ABI du contrat (array)
            signer            // Provider ou Signer
          );
          
          setContract(votingContract);
        } catch (error) {
          console.error("Erreur lors de l'initialisation du contrat :", error);
        }
      }
    };
      
    initContract();
  }, [address]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (contract && address) {
        try {
          const contractOwner = await contract.owner(); // Récupérer le propriétaire du contrat
          console.log("Compte connecté :", address.toLowerCase());
          console.log("Propriétaire du contrat :", contractOwner.toLowerCase());
  
          if (address.toLowerCase() === contractOwner.toLowerCase()) {
            console.log("ils sont bien égaux");
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l'admin :", error);
        }
      }
    };
  
    checkAdmin();
  }, [contract, address]);

  if (!isConnected) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-6 bg-white rounded shadow">
          <h2 className="text-lg font-bold mb-2">Connexion requise</h2>
          <p>Veuillez vous connecter pour accéder au système de vote.</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Système de Vote Décentralisé</h1>
      
      {/* Ajouter le composant de statut du contrat */}
      <div className="mb-6">
        <ContractStatus />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Compte connecté: {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Non connecté"}
          </p>
          <p className="text-sm text-muted-foreground">Statut: {isAdmin ? "Administrateur" : "Électeur"}</p>
        </div>
        <div className="text-sm bg-muted px-3 py-1 rounded-md">État actuel: {getStateLabel(votingState)}</div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Administration</TabsTrigger>}
          <TabsTrigger value="voters">Électeurs</TabsTrigger>
          <TabsTrigger value="proposals">Propositions</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue sur le système de vote</CardTitle>
              <CardDescription>Suivez le processus de vote en cours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatusCard
                  title="Enregistrement des électeurs"
                  active={votingState === 0}
                  completed={votingState > 0}
                />
                <StatusCard
                  title="Enregistrement des propositions"
                  active={votingState === 1}
                  completed={votingState > 1}
                />
                <StatusCard title="Session de vote" active={votingState === 2} completed={votingState > 2} />
                <StatusCard title="Votes comptabilisés" active={false} completed={votingState === 3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        )}

        <TabsContent value="voters">
          <VoterRegistration />
        </TabsContent>

        <TabsContent value="proposals">
          <ProposalSubmission />
        </TabsContent>

        <TabsContent value="results">
          <ResultsDisplay />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatusCard({ title, active, completed }) {
  return (
    <div
      className={`p-4 border rounded-lg flex items-center ${active ? "border-primary bg-primary/10" : completed ? "border-green-500 bg-green-50" : "border-muted bg-muted/20"}`}
    >
      <div
        className={`w-3 h-3 rounded-full mr-3 ${active ? "bg-primary animate-pulse" : completed ? "bg-green-500" : "bg-muted"}`}
      />
      <span
        className={
          active ? "font-medium text-primary" : completed ? "font-medium text-green-700" : "text-muted-foreground"
        }
      >
        {title}
        {active && <span className="ml-2 text-xs">(En cours)</span>}
        {completed && <span className="ml-2 text-xs">(Terminé)</span>}
      </span>
    </div>
  )
}

function getStateLabel(state) {
  switch (state) {
    case 0:
      return "Enregistrement des électeurs"
    case 1:
      return "Enregistrement des propositions"
    case 2:
      return "Session de vote"
    case 3:
      return "Vote terminé"
    default:
      return "Inconnu"
  }
}