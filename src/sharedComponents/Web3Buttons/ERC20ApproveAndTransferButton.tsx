import { Address, TransactionReceipt, Hash, erc20Abi } from 'viem'
import { useWriteContract } from 'wagmi'

import { useSuspenseReadErc20Allowance } from '@/src/hooks/generated'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import TransactionButton from '@/src/sharedComponents/Web3Buttons/TransactionButton'
import { Token } from '@/src/types/token'

interface ERC20ApproveAndTransferButtonProps {
  token: Token
  spender: Address
  amount: bigint
  onSuccess?: (receipt: TransactionReceipt) => void
  disabled?: boolean
  transaction: () => Promise<Hash>
  label?: string
  labelSending?: string
}
/**
 * Dynamically renders either an approval button or a transaction button based on the user's current token allowance.
 * After the approval, the transaction button will be rendered.
 * Use with <Suspense> to add an skeleton loader while fetching the allowance.
 *
 * @component
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
const ERC20ApproveAndTransferButton = ({
  amount,
  disabled,
  label,
  labelSending,
  onSuccess,
  spender,
  token,
  transaction,
}: ERC20ApproveAndTransferButtonProps) => {
  const { address } = useWeb3StatusConnected()
  const { writeContractAsync } = useWriteContract()

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

  return isApprovalRequired ? (
    <TransactionButton
      disabled={disabled}
      key="approve"
      label={`Approve ${token.symbol}`}
      labelSending={`Approving ${token.symbol}`}
      onMined={() => getAllowance()}
      transaction={handleApprove}
    />
  ) : (
    <TransactionButton
      disabled={disabled}
      key="send"
      label={label}
      labelSending={labelSending}
      onMined={onSuccess}
      transaction={transaction}
    />
  )
}

export default ERC20ApproveAndTransferButton