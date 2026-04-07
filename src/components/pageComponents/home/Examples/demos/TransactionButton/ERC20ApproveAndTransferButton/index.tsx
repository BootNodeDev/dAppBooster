import { type Abi, type Address, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import BaseERC20ApproveAndTransferButton from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/ERC20ApproveAndTransferButton/ERC20ApproveAndTransferButton'
import MintUSDC from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/ERC20ApproveAndTransferButton/MintUSDC'
import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Wrapper'
import { useSuspenseReadErc20BalanceOf } from '@/src/contracts/generated'
import { formatNumberOrString, NumberType, withSuspense } from '@/src/core/utils'
import type { TransactionParams } from '@/src/sdk/core'
import type { EvmContractCall } from '@/src/sdk/core/evm/types'
import { useWallet } from '@/src/sdk/react/hooks'
import type { Token } from '@/src/tokens/types'

// USDC token on Sepolia chain
const tokenUSDC_sepolia: Token = {
  address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
  chainId: sepolia.id,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
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

/**
 * This demo shows how to approve and send an ERC20 token transaction using the `TransactionButton` component.
 *
 * Works only on Sepolia chain.
 */
const ERC20ApproveAndTransferButton = withSuspense(() => {
  const wallet = useWallet({ chainId: sepolia.id })
  const address = wallet.status.activeAccount as Address

  const { data: balance, refetch: refetchBalance } = useSuspenseReadErc20BalanceOf({
    address: tokenUSDC_sepolia.address as Address,
    args: [address],
  })

  // AAVE staging contract pool address
  const spender = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951'

  const amount = BigInt(10000000000) // 10,000.00 USDC

  const transferParams: TransactionParams = {
    chainId: sepolia.id,
    payload: {
      contract: {
        address: spender,
        abi: ABIExample as Abi,
        functionName: 'supply',
        args: [tokenUSDC_sepolia.address as Address, amount, address, 0],
      },
    } satisfies EvmContractCall,
  }

  const formattedAmount = formatNumberOrString(
    formatUnits(amount, tokenUSDC_sepolia.decimals),
    NumberType.TokenTx,
  )

  return balance < amount ? (
    <Wrapper
      text={'Get Sepolia USDC from Aave faucet'}
      title={'Mint USDC'}
    >
      <MintUSDC onSuccess={refetchBalance} />
    </Wrapper>
  ) : (
    <BaseERC20ApproveAndTransferButton
      amount={amount}
      label={`Supply ${formattedAmount} USDC`}
      labelSending="Sending..."
      onSuccess={() => refetchBalance()}
      spender={spender}
      token={tokenUSDC_sepolia}
      transferParams={transferParams}
    />
  )
})

export default ERC20ApproveAndTransferButton
