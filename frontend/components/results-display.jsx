"use client"

import { useVotingSystem } from "@/lib/voting-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy } from "@/components/icons"
import { VotingInterface } from "./voting-interface"

export function ResultsDisplay() {
  const { votingState, proposals, winningProposalId } = useVotingSystem()

  // Calculate total votes
  const totalVotes = proposals.reduce((sum, proposal) => sum + proposal.voteCount, 0)

  // Sort proposals by vote count (descending)
  const sortedProposals = [...proposals].sort((a, b) => b.voteCount - a.voteCount)

  return (
    <div className="space-y-6">
      {votingState === 2 && <VotingInterface />}

      <Card>
        <CardHeader>
          <CardTitle>Résultats du vote</CardTitle>
          <CardDescription>
            {votingState < 3
              ? "Les résultats seront disponibles une fois le vote terminé"
              : `${totalVotes} votes comptabilisés`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {votingState < 3 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">Les résultats ne sont pas encore disponibles</p>
              {votingState === 2 && <p className="text-sm mt-2">La session de vote est en cours</p>}
              {votingState < 2 && <p className="text-sm mt-2">La session de vote n'a pas encore commencé</p>}
            </div>
          ) : proposals.length === 0 ? (
            <p className="text-muted-foreground">Aucune proposition n'a été soumise</p>
          ) : totalVotes === 0 ? (
            <p className="text-muted-foreground">Aucun vote n'a été enregistré</p>
          ) : (
            <div className="space-y-4">
              {sortedProposals.map((proposal, index) => {
                const proposalIndex = proposals.indexOf(proposal)
                const percentage = totalVotes > 0 ? (proposal.voteCount / totalVotes) * 100 : 0
                const isWinner = proposalIndex === winningProposalId && votingState === 3

                return (
                  <div key={index} className={`p-4 rounded-lg border ${isWinner ? "border-primary bg-primary/5" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Proposition #{proposalIndex + 1}</Badge>
                        {isWinner && (
                          <div className="flex items-center text-primary">
                            <Trophy className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Gagnant</span>
                          </div>
                        )}
                      </div>
                      <div className="font-medium">
                        {proposal.voteCount} vote{proposal.voteCount !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <p className="mb-2">{proposal.description}</p>

                    <div className="space-y-1">
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-right text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

