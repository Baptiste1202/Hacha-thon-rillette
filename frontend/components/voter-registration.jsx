"use client"

import { useVotingSystem } from "@/lib/voting-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function VoterRegistration() {
  const { currentAccount, isVoter, votersList, votingState } = useVotingSystem()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enregistrement des électeurs</CardTitle>
          <CardDescription>
            {votingState === 0
              ? "L'administrateur est en train d'enregistrer les électeurs"
              : "L'enregistrement des électeurs est terminé"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Votre statut</h3>
              {isVoter ? (
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2">
                    Électeur enregistré
                  </Badge>
                  <p className="text-sm text-muted-foreground">Vous êtes autorisé à participer au vote</p>
                </div>
              ) : (
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    Non enregistré
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {votingState === 0
                      ? "Contactez l'administrateur pour être ajouté à la liste blanche"
                      : "L'enregistrement des électeurs est terminé, vous ne pouvez plus être ajouté"}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Liste des électeurs enregistrés</h3>
              {votersList.length === 0 ? (
                <p className="text-muted-foreground">Aucun électeur enregistré</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {votersList.map((voter, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md text-sm font-mono ${voter === currentAccount ? "bg-primary/10 border border-primary" : "bg-muted"}`}
                    >
                      {voter}
                      {voter === currentAccount && (
                        <Badge variant="outline" className="ml-2">
                          Vous
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

