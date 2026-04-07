import { sepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'
import { AaveFaucetABI } from '@/src/contracts/abis/AaveFaucet'
import { getContract } from '@/src/contracts/definitions'
import { LegacyTransactionButton as TransactionButton } from '@/src/transactions/components'
import { useWeb3StatusConnected } from '@/src/wallet/components'

export default function MintUSDC({ onSuccess }: { onSuccess: () => void }) {
  const { address } = useWeb3StatusConnected()
  const { writeContractAsync } = useWriteContract()
  const aaveContract = getContract('AaveFaucet', sepolia.id)
  const aaveUSDC = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8'

  const handleMint = () => {
    return writeContractAsync({
      abi: AaveFaucetABI,
      address: aaveContract.address,
      functionName: 'mint',
      args: [aaveUSDC, address, 10000000000n],
    })
  }
  handleMint.methodId = 'Mint USDC'

  return (
    <TransactionButton
      as={TransactionButton}
      key="mint"
      labelSending={'Minting USDC'}
      onMined={onSuccess}
      transaction={handleMint}
    >
      Mint USDC
    </TransactionButton>
  )
}
