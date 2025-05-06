import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Wrapper'
import TransactionButton from '@/src/components/sharedComponents/TransactionButton'
import { useSuspenseReadErc20Allowance } from '@/src/hooks/generated'
import { useWeb3Status, useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import type { Token } from '@/src/types/token'
import { getExplorerLink } from '@/src/utils/getExplorerLink'
import type { FC } from 'react'
import { type Address, type Hash, type TransactionReceipt, erc20Abi } from 'viem'
import * as chains from 'viem/chains'
import { useWriteContract } from 'wagmi'

interface Props {
  amount: bigint
  disabled?: boolean
  label?: string
  labelSending?: string
  onSuccess?: (receipt: TransactionReceipt) => void
  spender: Address
  token: Token
  transaction: () => Promise<Hash>
}

/**
 * Dynamically renders either an approval button or a transaction button based on the user's current token allowance.
 * After the approval, the transaction button will be rendered.
 *
 * @dev Use with <Suspense> to add an skeleton loader while fetching the allowance.
 *
 * @param {Props}
 * @param {Token} props.token - The token to be approved.
 * @param {Address} props.spender - The address of the spender to be approved.
 * @param {bigint} props.amount - The amount of tokens to approve (or send).
 * @param {Function} props.onMined - The callback function to be called when transaction is mined.
 * @param {boolean} props.disabled - The flag to disable the button.
 * @param {Function} props.transaction - The transaction function that send after approval.
 * @param {string} props.label - The label for the button.
 * @param {string} props.labelSending - The label for the button when the transaction is pending.
 *
 */
const ERC20ApproveAndTransferButton: FC<Props> = ({
  amount,
  disabled,
  label,
  labelSending,
  onSuccess,
  spender,
  token,
  transaction,
}) => {
  const { address } = useWeb3StatusConnected()
  const { writeContractAsync } = useWriteContract()
  const { isWalletConnected, walletChainId } = useWeb3Status()

  const { data: allowance, refetch: getAllowance } = useSuspenseReadErc20Allowance({
    address: token.address as Address, // TODO: token.address should be Address type
    args: [address, spender],
  })

  const isApprovalRequired = allowance < amount

  const handleApprove = () => {
    return writeContractAsync({
      abi: erc20Abi,
      address: token.address as Address,
      functionName: 'approve',
      args: [spender, amount],
    })
  }
  handleApprove.methodId = 'Approve USDC'

  const findChain = (chainId: number) => Object.values(chains).find((chain) => chain.id === chainId)

  // mainnet is the default chain if not connected or the chain is not found
  const currentChain =
    isWalletConnected && walletChainId ? findChain(walletChainId) || chains.mainnet : chains.mainnet

  return isApprovalRequired ? (
    <Wrapper
      text={`Approve the use of ${token.symbol} with your wallet`}
      title="Approval required"
    >
      <TransactionButton
        disabled={disabled}
        key="approve"
        labelSending={`Approving ${token.symbol}`}
        onMined={() => getAllowance()}
        transaction={handleApprove}
      >
        Approve
      </TransactionButton>
    </Wrapper>
  ) : (
    <Wrapper
      text={
        <>
          Supply {token.symbol} to the{' '}
          <a
            href={getExplorerLink({ chain: currentChain, hashOrAddress: spender })}
            rel="noreferrer"
            target="_blank"
          >
            AAVE staging contract
          </a>
          .
        </>
      }
      title="Execute the transaction"
    >
      <TransactionButton
        as={TransactionButton}
        disabled={disabled}
        key="send"
        labelSending={labelSending}
        onMined={onSuccess}
        transaction={transaction}
      >
        {label}
      </TransactionButton>
    </Wrapper>
  )
}

export default ERC20ApproveAndTransferButton
