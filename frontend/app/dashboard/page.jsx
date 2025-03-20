"use client"

import { useState, useEffect } from "react"
import { useVotingSystem } from "@/lib/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPanel } from "@/components/admin-panel"
import { VoterRegistration } from "@/components/voter-registration"
import { ProposalSubmission } from "@/components/proposal-submission"
import { ResultsDisplay } from "@/components/results-display"
import VotingContractABI from "@/lib/VotingContractABI.json";

export default function Dashboard() {
  const { currentAccount, isAdmin, connectWallet, votingState } = useVotingSystem()
  const [activeTab, setActiveTab] = useState("overview")

  // Puis utilisez-le pour créer une instance du contrat
  const contract = new ethers.Contract(
    VotingContractABI,
  );

  // Set the appropriate tab based on voting state
  useEffect(() => {
    if (isAdmin) {
      setActiveTab("admin")
    } else if (!currentAccount) {
      setActiveTab("overview")
    }
  }, [isAdmin, currentAccount])

  if (!currentAccount) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>Veuillez vous connecter pour accéder au système de vote</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={connectWallet} className="w-full">
              Connecter votre portefeuille
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Système de Vote Décentralisé</h1>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Compte connecté: {currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}
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

