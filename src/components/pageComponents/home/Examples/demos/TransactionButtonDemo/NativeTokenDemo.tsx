import { type ReactElement, useState } from 'react'
import styled, { css } from 'styled-components'

import { GeneralMessage as GeneralMessageBase } from '@bootnodedev/db-ui-toolkit'
import { Modal, useModal } from '@faceless-ui/modal'
import { type Hash, type TransactionReceipt, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { useSendTransaction } from 'wagmi'

import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButtonDemo/Wrapper'
import TransactionButton from '@/src/components/sharedComponents/TransactionButton'
import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { PrimaryButton } from '@/src/components/sharedComponents/ui/Buttons'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'

const GeneralMessage = styled(GeneralMessageBase)<{ status?: 'ok' | 'error' }>`
  ${({ status }) =>
    status === 'ok' &&
    css`
      --theme-general-message-icon-color: var(--theme-color-ok);
    `}
`

/**
 * This demo shows how to send a native token transaction.
 *
 * Works only on Sepolia chain.
 */
const NativeTokenDemo = withWalletStatusVerifier(
  () => {
    const { closeModal, openModal } = useModal()
    const { address } = useWeb3StatusConnected()
    const { sendTransactionAsync } = useSendTransaction()
    const [minedMessage, setMinedMessage] = useState<string | ReactElement>()

    const handleOnMined = (receipt: TransactionReceipt) => {
      setMinedMessage(
        <>
          <b>Hash:</b> <span>{receipt.transactionHash}</span>
        </>,
      )
      openModal('tx-dialog')
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
      <>
        <Wrapper
          text="Demo transaction that sends 0.1 Sepolia ETH from / to your wallet."
          title="Native token demo"
        >
          <PrimaryButton
            as={TransactionButton}
            labelSending="Sending 0.1 ETH..."
            onMined={handleOnMined}
            transaction={handleSendTransaction}
          >
            Send 0.1 Sepolia ETH
          </PrimaryButton>
        </Wrapper>
        <Modal slug="tx-dialog">
          <GeneralMessage
            actionButton={
              <PrimaryButton
                onClick={() => {
                  closeModal('tx-dialog')
                  setMinedMessage('')
                }}
              >
                Close
              </PrimaryButton>
            }
            message={minedMessage}
            status={'ok'}
            title={'Transaction completed!'}
          />
        </Modal>
      </>
    )
  },
  {
    chainId: sepolia.id, // this DEMO component only works on sepolia chain
  },
)

export default NativeTokenDemo
