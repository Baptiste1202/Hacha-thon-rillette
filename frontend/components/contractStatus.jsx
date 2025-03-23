"use client"

import { useState, useEffect } from "react"
import { getContract } from "@/lib/votingService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "@/components/icons"

export function ContractStatus() {
  const [status, setStatus] = useState({
    loading: true,
    metamask: false,
    connected: false,
    account: null,
    contractAddress: null,
    error: null,
  })

  const checkConnection = async () => {
    setStatus((prev) => ({ ...prev, loading: true }))

    try {
      // Vérifier si MetaMask est installé
      if (typeof window === "undefined" || !window.ethereum) {
        setStatus({
          loading: false,
          metamask: false,
          connected: false,
          account: null,
          contractAddress: null,
          error: "MetaMask n'est pas installé",
        })
        return
      }

      // Vérifier si un compte est connecté
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      const connected = accounts && accounts.length > 0

      if (!connected) {
        setStatus({
          loading: false,
          metamask: true,
          connected: false,
          account: null,
          contractAddress: null,
          error: "Aucun compte connecté dans MetaMask",
        })
        return
      }

      // Vérifier la connexion au contrat
      try {
        const contract = await getContract()
        const owner = await contract.owner()

        setStatus({
          loading: false,
          metamask: true,
          connected: true,
          account: accounts[0],
          contractAddress: contract.address,
          owner: owner,
          error: null,
        })
      } catch (err) {
        setStatus({
          loading: false,
          metamask: true,
          connected: true,
          account: accounts[0],
          contractAddress: null,
          error: `Erreur de contrat: ${err.message}`,
        })
      }
    } catch (err) {
      setStatus({
        loading: false,
        metamask: true,
        connected: false,
        account: null,
        contractAddress: null,
        error: err.message,
      })
    }
  }

  const connectMetaMask = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      checkConnection()
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        error: `Erreur de connexion: ${err.message}`,
      }))
    }
  }

  useEffect(() => {
    checkConnection()

    // Écouter les changements de compte
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", checkConnection)
      window.ethereum.on("chainChanged", checkConnection)

      return () => {
        window.ethereum.removeListener("accountsChanged", checkConnection)
        window.ethereum.removeListener("chainChanged", checkConnection)
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>État de la connexion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.loading ? (
          <div>Vérification de la connexion...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${status.metamask ? "bg-green-500" : "bg-red-500"}`}></div>
                <span>MetaMask: {status.metamask ? "Installé" : "Non installé"}</span>
              </div>

              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${status.connected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span>Compte: {status.connected ? "Connecté" : "Non connecté"}</span>
              </div>

              {status.account && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                  <span>Adresse: {status.account}</span>
                </div>
              )}

              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${status.contractAddress ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span>Contrat: {status.contractAddress ? "Connecté" : "Non connecté"}</span>
              </div>

              {status.contractAddress && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                  <span>Adresse du contrat: {status.contractAddress}</span>
                </div>
              )}

              {status.owner && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div>
                  <span>Propriétaire du contrat: {status.owner}</span>
                </div>
              )}
            </div>

            {status.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{status.error}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {!status.connected && (
                <Button onClick={connectMetaMask} className="w-full">
                  Connecter MetaMask
                </Button>
              )}

              <Button onClick={checkConnection} variant="outline" className="w-full">
                Vérifier à nouveau
              </Button>
            </div>

            {!status.contractAddress && status.connected && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                <h4 className="font-medium mb-1">Problèmes possibles :</h4>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Le nœud Hardhat n'est pas en cours d'exécution</li>
                  <li>Le contrat n'est pas déployé sur ce réseau</li>
                  <li>L'adresse du contrat dans votre code est incorrecte</li>
                  <li>MetaMask est connecté au mauvais réseau</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

