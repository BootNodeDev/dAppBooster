import type { Abi, Address } from 'viem'
import { baseSepolia } from 'viem/chains'
import { AaveFaucetABI } from '@/src/contracts/abis/AaveFaucet'
import { getContract } from '@/src/contracts/definitions'
import type { TransactionParams } from '@/src/sdk/core'
import type { EvmContractCall } from '@/src/sdk/evm-adapter'
import { useWallet } from '@/src/sdk/react/hooks'
import { TransactionButton } from '@/src/transactions/components'

export default function MintUSDC({ onSuccess }: { onSuccess: () => void }) {
  const wallet = useWallet({ chainId: baseSepolia.id })
  const address = wallet.status.activeAccount as Address
  const aaveContract = getContract('AaveFaucet', baseSepolia.id)
  const aaveUSDC = '0xba50cd2a20f6da35d788639e581bca8d0b5d4d5f'

  const mintParams: TransactionParams = {
    chainId: baseSepolia.id,
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
