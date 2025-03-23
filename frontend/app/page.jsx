"use client"
// Dans app/page.tsx ou tout autre composant qui interagit avec le contrat
import VotingContractABI from "@/lib/VotingContractABI.json";
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { abi, contractAddress } from '@/constants';
import { useVotingSystem } from "@/lib/voting-context"
import { getContract } from "@/lib/votingService";

import { useAccount } from 'wagmi'
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'

import { useState } from 'react';

export default function Home() {
    // The State that will get the number on the blockchain (get method)
    const [getNumber, setGetNumber] = useState()
    // The State that will keep track of the user input (set method)
    const [setNumber, setSetNumber] = useState()
    // We get the address from rainbowkit and if the user is connected or not
    const { address, isConnected } = useAccount()

    const { connectWallet } = useVotingSystem();

    const router = useRouter()
  
    const getTheNumber = async() => {
      const data = await readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'retrieve',
      })
      setGetNumber(Number(data))
    }
  
    const changeNumber = async() => {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: abi,
        functionName: 'store',
        args: [setNumber]
      })
      const { hash } = await writeContract(request)
      await getTheNumber()
      setSetNumber()
    }

    useEffect(() => {
      if (isConnected) {
        connectWallet(); 
        router.push("/dashboard");
      }
    }, [isConnected, router]);
  
    return (
      <>
        <ConnectButton />
        {!isConnected && <p>Please connect your Wallet to our DApp.</p>}
      </>
    )
  }



