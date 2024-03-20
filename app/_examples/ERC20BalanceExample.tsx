import { useReadErc20BalanceOf, useReadErc20Decimals, useReadErc20Name, useReadErc20Symbol } from "@/app/_generated/hooks"
import { Suspense, useState } from "react"
import { Address } from "viem"
import { mainnet } from "viem/chains"
import { formatUnits, isAddress } from "viem/utils"

const TokenAddressInput: React.FC<{
  value: string
  onChange: (value: string) => void
}> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="tokenAddress">Enter a token address to see your balance</label>
      <br />
      <br />
      <input
        id="tokenAddress"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

const ERC20Balance: React.FC<{
  tokenAddress: Address
}> = ({ tokenAddress }) => {

  // Using auto-generated hooks
  const { data: balance } = useReadErc20BalanceOf({
    chainId: mainnet.id,
    address: tokenAddress,
    args: ['0x3EF28a9661574958a99Cdd0b54A63321A68C375D'], // wallet address
  })

  const { data: decimals } = useReadErc20Decimals({
    chainId: mainnet.id,
    address: tokenAddress
  })

  const { data: tokenName } = useReadErc20Name({
    chainId: mainnet.id,
    address: tokenAddress
  })

  const { data: tokenSymbol } = useReadErc20Symbol({
    chainId: mainnet.id,
    address: tokenAddress
  })

  // Using one call to get all the data
  // const { data } = useReadContracts({
  //   contracts: [
  //     {
  //       chainId: mainnet.id,
  //       address: tokenAddress,
  //       functionName: "balanceOf",
  //       args: ['0x3EF28a9661574958a99Cdd0b54A63321A68C375D'], //wallet address
  //       abi: erc20Abi
  //     },
  //     {
  //       chainId: mainnet.id,
  //       address: tokenAddress,
  //       functionName: "decimals",
  //       abi: erc20Abi
  //     },
  //     {
  //       chainId: mainnet.id,
  //       address: tokenAddress,
  //       functionName: "name",
  //       abi: erc20Abi
  //     },
  //     {
  //       chainId: mainnet.id,
  //       address: tokenAddress,
  //       functionName: "symbol",
  //       abi: erc20Abi
  //     },
  //   ],
  // })

  // const [balance, decimals, tokenName, tokenSymbol] = [
  //   data?.[0]?.result,
  //   data?.[1]?.result,
  //   data?.[2]?.result,
  //   data?.[3]?.result,
  // ]

  return (
    <div>
      <h1>Balance of {tokenName} ({tokenSymbol})</h1>
      <p>{formatUnits(balance || BigInt(0), decimals || 0)}</p>
    </div>
  )
}

const ERC20BalanceWrapper: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState('')
  const showBalance = tokenAddress && isAddress(tokenAddress)
  
  return (
    <div>
      <TokenAddressInput value={tokenAddress} onChange={setTokenAddress} />
      {showBalance &&  <Suspense fallback="Loading..."><ERC20Balance tokenAddress={tokenAddress} /></Suspense>}
    </div>
  )
}

export default ERC20BalanceWrapper

