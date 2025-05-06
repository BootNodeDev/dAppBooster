import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Wrapper'
import TransactionButton from '@/src/components/sharedComponents/TransactionButton'
import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { GeneralMessage } from '@/src/components/sharedComponents/ui/GeneralMessage'
import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import { Dialog } from '@chakra-ui/react'
import { type ReactElement, useState } from 'react'
import { type Hash, type TransactionReceipt, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { useSendTransaction } from 'wagmi'

/**
 * This demo shows how to send a native token transaction.
 *
 * Works only on Sepolia chain.
 */
const NativeToken = withWalletStatusVerifier(
  () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { address } = useWeb3StatusConnected()
    const { sendTransactionAsync } = useSendTransaction()
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
  },
  {
    chainId: sepolia.id, // this DEMO component only works on sepolia chain
  },
)

export default NativeToken
