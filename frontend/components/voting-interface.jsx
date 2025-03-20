"use client"

import { useState } from "react"
import { useVotingSystem } from "@/lib/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function VotingInterface() {
  const { votingState, isVoter, proposals, hasVoted, votedProposalId, vote } = useVotingSystem()

  const [selectedProposal, setSelectedProposal] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleVote = () => {
    if (selectedProposal === null) {
      setError("Veuillez sélectionner une proposition")
      return
    }

    try {
      vote(selectedProposal)
      setSuccess(`Vote enregistré pour la proposition #${selectedProposal + 1}`)
      setError("")
    } catch (err) {
      setError("Erreur lors de l'enregistrement du vote")
    }
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const canVote = isVoter && votingState === 2 && !hasVoted

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote</CardTitle>
        <CardDescription>
          {votingState < 2
            ? "La session de vote n'a pas encore commencé"
            : votingState === 2
              ? "Les électeurs enregistrés peuvent voter pour une proposition"
              : "La session de vote est terminée"}
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

        {!isVoter && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Non autorisé</AlertTitle>
            <AlertDescription>Vous devez être un électeur enregistré pour voter</AlertDescription>
          </Alert>
        )}

        {hasVoted && (
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Vote déjà effectué</AlertTitle>
            <AlertDescription className="text-blue-700">
              Vous avez voté pour la proposition #{votedProposalId + 1}
            </AlertDescription>
          </Alert>
        )}

        {votingState !== 2 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session de vote {votingState < 2 ? "non démarrée" : "terminée"}</AlertTitle>
            <AlertDescription>
              {votingState < 2 ? "La session de vote n'a pas encore commencé" : "La session de vote est terminée"}
            </AlertDescription>
          </Alert>
        )}

        {proposals.length === 0 ? (
          <p className="text-muted-foreground">Aucune proposition disponible</p>
        ) : (
          <div className="space-y-4">
            <RadioGroup
              value={selectedProposal?.toString()}
              onValueChange={(value) => {
                setSelectedProposal(Number.parseInt(value))
                clearMessages()
              }}
              disabled={!canVote}
            >
              {proposals.map((proposal, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-md border">
                  <RadioGroupItem value={index.toString()} id={`proposal-${index}`} />
                  <Label htmlFor={`proposal-${index}`} className="flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="mb-1">
                        Proposition #{index + 1}
                      </Badge>
                      {votedProposalId === index && hasVoted && <Badge variant="default">Votre vote</Badge>}
                    </div>
                    <p>{proposal.description}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button onClick={handleVote} disabled={!canVote || selectedProposal === null} className="w-full">
              Voter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

