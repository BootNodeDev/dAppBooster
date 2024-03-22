import { getContractInfo } from "@/app/_constants/contracts"
import { Suspense, useState } from "react"
import { mainnet } from "viem/chains"
import { formatUnits, isAddress } from "viem/utils"
import { useReadContract, useReadContracts } from "wagmi"

const ERC20BalanceExample: React.FC<{}> = () => {

  // Using multicall (batched)
  const { data } = useReadContracts({
    contracts: [
      {
        functionName: "balanceOf",
        args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
        ...getContractInfo('DAI', mainnet.id),
      },
      {
        functionName: "decimals",
        ...getContractInfo('DAI', mainnet.id)
      },
      {
        functionName: "name",
        ...getContractInfo('DAI', mainnet.id)
      },
      {
        functionName: "symbol",
        ...getContractInfo('DAI', mainnet.id)
      },
    ],
  })

  const [balance, decimals, tokenName, tokenSymbol] = [
    data?.[0]?.result,
    data?.[1]?.result,
    data?.[2]?.result,
    data?.[3]?.result,
  ]

  return (
    <div>
      <h1>Balance of {tokenName} ({tokenSymbol})</h1>
      <p>{formatUnits(balance || BigInt(0), decimals || 0)}</p>
    </div>
  )
}

export default ERC20BalanceExample

