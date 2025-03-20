"use client"

import { useState } from "react"
import { useVotingSystem } from "@/lib/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function ProposalSubmission() {
  const { votingState, isVoter, proposals, addProposal } = useVotingSystem()

  const [newProposal, setNewProposal] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleAddProposal = () => {
    if (!newProposal.trim()) {
      setError("La proposition ne peut pas être vide")
      return
    }

    try {
      addProposal(newProposal)
      setSuccess(`Proposition ajoutée avec succès`)
      setNewProposal("")
      setError("")
    } catch (err) {
      setError("Erreur lors de l'ajout de la proposition")
    }
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const canSubmitProposal = isVoter && votingState === 1

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Soumission des propositions</CardTitle>
          <CardDescription>
            {votingState < 1
              ? "L'enregistrement des propositions n'a pas encore commencé"
              : votingState === 1
                ? "Les électeurs enregistrés peuvent soumettre leurs propositions"
                : "L'enregistrement des propositions est terminé"}
          </CardDescription>
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
            <Label htmlFor="proposal">Ajouter une proposition</Label>
            <div className="flex gap-2">
              <Input
                id="proposal"
                placeholder="Votre proposition..."
                value={newProposal}
                onChange={(e) => {
                  setNewProposal(e.target.value)
                  clearMessages()
                }}
                disabled={!canSubmitProposal}
              />
              <Button onClick={handleAddProposal} disabled={!canSubmitProposal}>
                Soumettre
              </Button>
            </div>
            {!isVoter && (
              <p className="text-sm text-muted-foreground">
                Vous devez être un électeur enregistré pour soumettre une proposition
              </p>
            )}
            {votingState !== 1 && (
              <p className="text-sm text-muted-foreground">
                {votingState < 1
                  ? "L'enregistrement des propositions n'a pas encore commencé"
                  : "L'enregistrement des propositions est terminé"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des propositions</CardTitle>
          <CardDescription>{proposals.length} propositions enregistrées</CardDescription>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <p className="text-muted-foreground">Aucune proposition enregistrée</p>
          ) : (
            <div className="space-y-2">
              {proposals.map((proposal, index) => (
                <div key={index} className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="mb-1">
                      Proposition #{index + 1}
                    </Badge>
                  </div>
                  <p>{proposal.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

