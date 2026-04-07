import type { FC } from 'react'
import { type Abi, type Address, erc20Abi } from 'viem'
import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Wrapper'
import { useSuspenseReadErc20Allowance } from '@/src/contracts/generated'
import type { TransactionParams } from '@/src/sdk/core'
import { getExplorerUrl } from '@/src/sdk/core/chain/explorer'
import type { EvmContractCall } from '@/src/sdk/core/evm/types'
import { useChainRegistry, useWallet } from '@/src/sdk/react/hooks'
import type { Token } from '@/src/tokens/types'
import { TransactionButton } from '@/src/transactions/components'

interface Props {
  amount: bigint
  disabled?: boolean
  label?: string
  labelSending?: string
  onSuccess?: () => void
  spender: Address
  token: Token
  transferParams: TransactionParams
}

/**
 * Dynamically renders either an approval button or a transaction button based on the user's current token allowance.
 * After the approval, the transaction button will be rendered.
 *
 * @dev Use with <Suspense> to add a skeleton loader while fetching the allowance.
 */
const ERC20ApproveAndTransferButton: FC<Props> = ({
  amount,
  disabled,
  label,
  labelSending,
  onSuccess,
  spender,
  token,
  transferParams,
}) => {
  const wallet = useWallet({ chainId: token.chainId })
  const address = wallet.status.activeAccount as Address
  const registry = useChainRegistry()

  const { data: allowance, refetch: refetchAllowance } = useSuspenseReadErc20Allowance({
    address: token.address as Address, // TODO: token.address should be Address type
    args: [address, spender],
  })

  const isApprovalRequired = allowance < amount

  const approveParams: TransactionParams = {
    chainId: token.chainId,
    payload: {
      contract: {
        address: token.address as Address,
        abi: erc20Abi as Abi,
        functionName: 'approve',
        args: [spender, amount],
      },
    } satisfies EvmContractCall,
  }

  const explorerUrl = getExplorerUrl(registry, { chainId: token.chainId, address: spender })

  return isApprovalRequired ? (
    <Wrapper
      text={`Approve the use of ${token.symbol} with your wallet`}
      title="Approval required"
    >
      <TransactionButton
        disabled={disabled}
        key="approve"
        labelSending={`Approving ${token.symbol}`}
        lifecycle={{ onConfirm: () => refetchAllowance() }}
        params={approveParams}
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
            href={explorerUrl ?? '#'}
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
        disabled={disabled}
        key="send"
        labelSending={labelSending}
        lifecycle={{ onConfirm: () => onSuccess?.() }}
        params={transferParams}
      >
        {label}
      </TransactionButton>
    </Wrapper>
  )
}

export default ERC20ApproveAndTransferButton
