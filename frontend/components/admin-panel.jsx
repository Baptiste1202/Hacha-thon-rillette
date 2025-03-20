"use client"

import { useState } from "react"
import { useVotingSystem } from "@/lib/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AdminPanel() {
  const {
    votingState,
    votersList,
    startProposalsRegistration,
    endProposalsRegistration,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    addVoter,
  } = useVotingSystem()

  const [newVoterAddress, setNewVoterAddress] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleAddVoter = () => {
    if (!newVoterAddress || !newVoterAddress.startsWith("0x") || newVoterAddress.length !== 42) {
      setError("Adresse Ethereum invalide")
      return
    }

    if (votersList.includes(newVoterAddress)) {
      setError("Cet électeur est déjà enregistré")
      return
    }

    try {
      addVoter(newVoterAddress)
      setSuccess(`Électeur ${newVoterAddress} ajouté avec succès`)
      setNewVoterAddress("")
      setError("")
    } catch (err) {
      setError("Erreur lors de l'ajout de l'électeur")
    }
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panneau d'administration</CardTitle>
          <CardDescription>Gérez le processus de vote en tant qu'administrateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Succès</AlertTitle>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="voterAddress">Ajouter un électeur à la liste blanche</Label>
            <div className="flex gap-2">
              <Input
                id="voterAddress"
                placeholder="Adresse Ethereum (0x...)"
                value={newVoterAddress}
                onChange={(e) => {
                  setNewVoterAddress(e.target.value)
                  clearMessages()
                }}
                disabled={votingState !== 0}
              />
              <Button onClick={handleAddVoter} disabled={votingState !== 0}>
                Ajouter
              </Button>
            </div>
            {votingState !== 0 && (
              <p className="text-sm text-muted-foreground">L'enregistrement des électeurs est terminé</p>
            )}
          </div>

          <div className="pt-4 space-y-4">
            <h3 className="font-medium">Contrôle du processus de vote</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={votingState === 0 ? "default" : "outline"}
                onClick={startProposalsRegistration}
                disabled={votingState !== 0}
                className="w-full"
              >
                Démarrer l'enregistrement des propositions
              </Button>

              <Button
                variant={votingState === 1 ? "default" : "outline"}
                onClick={endProposalsRegistration}
                disabled={votingState !== 1}
                className="w-full"
              >
                Terminer l'enregistrement des propositions
              </Button>

              <Button
                variant={votingState === 1 ? "default" : "outline"}
                onClick={startVotingSession}
                disabled={votingState !== 1}
                className="w-full"
              >
                Démarrer la session de vote
              </Button>

              <Button
                variant={votingState === 2 ? "default" : "outline"}
                onClick={endVotingSession}
                disabled={votingState !== 2}
                className="w-full"
              >
                Terminer la session de vote
              </Button>

              <Button
                variant={votingState === 2 ? "default" : "outline"}
                onClick={tallyVotes}
                disabled={votingState !== 2}
                className="w-full md:col-span-2"
              >
                Comptabiliser les votes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des électeurs enregistrés</CardTitle>
          <CardDescription>{votersList.length} électeurs dans la liste blanche</CardDescription>
        </CardHeader>
        <CardContent>
          {votersList.length === 0 ? (
            <p className="text-muted-foreground">Aucun électeur enregistré</p>
          ) : (
            <div className="space-y-2">
              {votersList.map((voter, index) => (
                <div key={index} className="p-2 bg-muted rounded-md text-sm font-mono">
                  {voter}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

