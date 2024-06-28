import { Button } from 'db-ui-toolkit'
import { Hash, TransactionReceipt, erc20Abi, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { useSendTransaction, useWriteContract } from 'wagmi'

import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import { TransactionButton } from '@/src/sharedComponents/TransactionButton'

export const TransactionButtonDemo = () => {
  const { address, appChainId, switchChain } = useWeb3StatusConnected()
  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()

  const handleOnMined = (receipt: TransactionReceipt) => {
    alert(`Transaction completed!  🎉 \n hash: ${receipt.transactionHash}`)
  }

  const handleSendTransaction = (): Promise<Hash> => {
    // Send native token
    return sendTransactionAsync({
      chainId: sepolia.id,
      to: address,
      value: parseEther('0.1'),
    })
  }
  const handleWriteContract = (): Promise<Hash> => {
    // Send ERC20 token [USDC]
    return writeContractAsync({
      chainId: sepolia.id,
      abi: erc20Abi,
      address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8', // USDC
      functionName: 'transfer',
      args: [address, 100000000n], // 100 USDC
    })
  }

  if (appChainId !== sepolia.id) {
    return <Button onClick={() => switchChain(sepolia.id)}> Switch to Sepolia </Button>
  }

  return (
    <>
      <TransactionButton
        label="Send 100 USDC"
        onMined={handleOnMined}
        transaction={handleWriteContract}
      />
      <br />
      <TransactionButton
        label="Send 0.1 ETH"
        onMined={handleOnMined}
        transaction={handleSendTransaction}
      />
    </>
  )
}
