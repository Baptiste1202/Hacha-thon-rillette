"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard on initial load
    router.push("/dashboard")
  }, [router])

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Système de Vote Décentralisé</CardTitle>
          <CardDescription>Plateforme de vote sécurisée et transparente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Cette application permet de gérer un processus de vote complet, de l'enregistrement des électeurs jusqu'à la
            comptabilisation des résultats.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Accéder à l'application
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

