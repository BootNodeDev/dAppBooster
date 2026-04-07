import { Dialog } from '@chakra-ui/react'
import { type ReactElement, useState } from 'react'
import type { Address, TransactionReceipt } from 'viem'
import { parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Wrapper'
import { GeneralMessage, PrimaryButton } from '@/src/core/components'
import type { TransactionParams, TransactionResult } from '@/src/sdk/core'
import type { EvmRawTransaction } from '@/src/sdk/core/evm/types'
import { useWallet } from '@/src/sdk/react/hooks'
import { TransactionButton } from '@/src/transactions/components'

/**
 * This demo shows how to send a native token transaction.
 *
 * Works only on Sepolia chain.
 */
const NativeToken = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const wallet = useWallet({ chainId: sepolia.id })
  const address = wallet.status.activeAccount as Address
  const [minedMessage, setMinedMessage] = useState<string | ReactElement>()

  const handleConfirm = (result: TransactionResult) => {
    const receipt = result.receipt as TransactionReceipt
    setMinedMessage(
      <>
        <b>Hash:</b> <span>{receipt.transactionHash}</span>
      </>,
    )
    setIsModalOpen(true)
  }

  const sendParams: TransactionParams = {
    chainId: sepolia.id,
    payload: {
      to: address,
      value: parseEther('0.1'),
    } satisfies EvmRawTransaction,
  }

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
          lifecycle={{ onConfirm: handleConfirm }}
          params={sendParams}
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
