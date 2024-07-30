import { ExternalLink } from 'db-ui-toolkit'
import { type Address, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'

import { useSuspenseReadErc20BalanceOf } from '@/src/hooks/generated'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import { withWalletStatusVerifier } from '@/src/sharedComponents/WalletStatusVerifier'
import ERC20ApproveAndTransferButton from '@/src/sharedComponents/Web3Buttons/ERC20ApproveAndTransferButton'
import { type Token } from '@/src/types/token'
import { formatNumberOrString, NumberType } from '@/src/utils/numberFormat'
import { withSuspense } from '@/src/utils/suspenseWrapper'

// USDC token on sepolia chain
const tokenUSDC_sepolia: Token = {
  name: 'USD Coin',
  symbol: 'USDC',
  address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
  decimals: 6,
  chainId: sepolia.id,
}

// Using the AAVE staging contract pool apply function
const ABIExample = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'onBehalfOf',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'referralCode',
        type: 'uint16',
      },
    ],
    name: 'supply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

const ERC20ApproveAndTransferButtonDemo = withWalletStatusVerifier(
  withSuspense(() => {
    const { address } = useWeb3StatusConnected()
    const { writeContractAsync } = useWriteContract()

    const { data: balance } = useSuspenseReadErc20BalanceOf({
      address: tokenUSDC_sepolia.address as Address,
      args: [address],
    })

    // AAVE staging contract pool address
    const spender = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951'

    const amount = 1000000000n // 1000 USDC

    const handleTransaction = () =>
      writeContractAsync({
        abi: ABIExample,
        address: spender,
        functionName: 'supply',
        args: [tokenUSDC_sepolia.address as Address, amount, address, 0],
      })

    return (
      <div>
        {balance < amount ? (
          <div>
            <p>
              You don't have sufficient USDC balance
              <ExternalLink href="https://staging.aave.com/faucet/">
                mint{' '}
                {formatNumberOrString(
                  formatUnits(amount, tokenUSDC_sepolia.decimals),
                  NumberType.TokenTx,
                )}{' '}
                USDC
              </ExternalLink>
              tokens to your account to test this Component.
            </p>
          </div>
        ) : (
          <ERC20ApproveAndTransferButton
            amount={amount}
            label="Supply 1000 USDC"
            labelSending="Supplying 1000 USDC..."
            onSuccess={() => alert('Approve and supply completed!  🎉')}
            spender={spender}
            token={tokenUSDC_sepolia}
            transaction={handleTransaction}
          />
        )}
      </div>
    )
  }),
  { chainId: sepolia.id }, // this DEMO component only works on sepolia chain
)

export default ERC20ApproveAndTransferButtonDemo
