import type { Abi, Address } from 'viem'
import { sepolia } from 'viem/chains'
import { AaveFaucetABI } from '@/src/contracts/abis/AaveFaucet'
import { getContract } from '@/src/contracts/definitions'
import type { TransactionParams } from '@/src/sdk/core'
import type { EvmContractCall } from '@/src/sdk/core/evm/types'
import { useWallet } from '@/src/sdk/react/hooks'
import { TransactionButton } from '@/src/transactions/components'

export default function MintUSDC({ onSuccess }: { onSuccess: () => void }) {
  const wallet = useWallet({ chainId: sepolia.id })
  const address = wallet.status.activeAccount as Address
  const aaveContract = getContract('AaveFaucet', sepolia.id)
  const aaveUSDC = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8'

  const mintParams: TransactionParams = {
    chainId: sepolia.id,
    payload: {
      contract: {
        address: aaveContract.address,
        abi: AaveFaucetABI as Abi,
        functionName: 'mint',
        args: [aaveUSDC, address, BigInt(10000000000)],
      },
    } satisfies EvmContractCall,
  }

  return (
    <TransactionButton
      key="mint"
      labelSending={'Minting USDC'}
      lifecycle={{ onConfirm: () => onSuccess() }}
      params={mintParams}
    >
      Mint USDC
    </TransactionButton>
  )
}
