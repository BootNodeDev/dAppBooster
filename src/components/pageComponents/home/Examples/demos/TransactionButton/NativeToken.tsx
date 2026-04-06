import { Dialog } from '@chakra-ui/react'
import { type ReactElement, useState } from 'react'
import { type Hash, parseEther, type TransactionReceipt } from 'viem'
import { useSendTransaction } from 'wagmi'
import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Wrapper'
import TransactionButton from '@/src/components/sharedComponents/TransactionButton'
import { GeneralMessage } from '@/src/components/sharedComponents/ui/GeneralMessage'
import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import { useWeb3StatusConnected } from '@/src/components/sharedComponents/WalletStatusVerifier'

/**
 * This demo shows how to send a native token transaction.
 *
 * Works only on Sepolia chain.
 */
const NativeToken = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address } = useWeb3StatusConnected()
  const { mutateAsync: sendTransactionAsync } = useSendTransaction()
  const [minedMessage, setMinedMessage] = useState<string | ReactElement>()

  const handleOnMined = (receipt: TransactionReceipt) => {
    setMinedMessage(
      <>
        <b>Hash:</b> <span>{receipt.transactionHash}</span>
      </>,
    )
    setIsModalOpen(true)
  }

  const handleSendTransaction = (): Promise<Hash> => {
    // Send native token
    return sendTransactionAsync({
      to: address,
      value: parseEther('0.1'),
    })
  }
  handleSendTransaction.methodId = 'sendTransaction'

  return (
    <Dialog.Root
      open={isModalOpen}
      size="xs"
    >
      <Wrapper
        text="Demo transaction that sends 0.1 Sepolia ETH from / to your wallet."
        title="Native token demo"
      >
        <TransactionButton
          labelSending="Sending 0.1 ETH..."
          onMined={handleOnMined}
          transaction={handleSendTransaction}
        >
          Send 0.1 Sepolia ETH
        </TransactionButton>
      </Wrapper>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <GeneralMessage
            actionButton={
              <PrimaryButton
                onClick={() => {
                  setIsModalOpen(false)
                  setMinedMessage('')
                }}
              >
                Close
              </PrimaryButton>
            }
            message={minedMessage}
            title={'Transaction completed!'}
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default NativeToken
