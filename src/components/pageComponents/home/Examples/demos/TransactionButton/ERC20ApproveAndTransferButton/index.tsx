import { type Abi, type Address, formatUnits } from 'viem'
import { baseSepolia } from 'viem/chains'
import BaseERC20ApproveAndTransferButton from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/ERC20ApproveAndTransferButton/ERC20ApproveAndTransferButton'
import MintUSDC from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/ERC20ApproveAndTransferButton/MintUSDC'
import Wrapper from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Wrapper'
import { useSuspenseReadErc20BalanceOf } from '@/src/contracts/generated'
import { formatNumberOrString, NumberType, withSuspense } from '@/src/core/utils'
import type { TransactionParams } from '@/src/sdk/core'
import type { EvmContractCall } from '@/src/sdk/core/evm/types'
import { useWallet } from '@/src/sdk/react/hooks'
import type { Token } from '@/src/tokens/types'

// USDC token on Base Sepolia (Aave V3 testnet)
const tokenUSDC: Token = {
  address: '0xba50cd2a20f6da35d788639e581bca8d0b5d4d5f',
  chainId: baseSepolia.id,
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
 * Works only on Base Sepolia chain.
 */
const ERC20ApproveAndTransferButton = withSuspense(() => {
  const wallet = useWallet({ chainId: baseSepolia.id })
  const address = wallet.status.activeAccount as Address | null

  const { data: balance = BigInt(0), refetch: refetchBalance } = useSuspenseReadErc20BalanceOf({
    address: tokenUSDC.address as Address,
    args: [address ?? ('0x0000000000000000000000000000000000000000' as Address)],
  })

  if (!address) {
    return null
  }

  // AAVE V3 Pool on Base Sepolia
  const spender = '0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27'

  const amount = BigInt(10000000000) // 10,000.00 USDC

  const transferParams: TransactionParams = {
    chainId: baseSepolia.id,
    payload: {
      contract: {
        address: spender,
        abi: ABIExample as Abi,
        functionName: 'supply',
        args: [tokenUSDC.address as Address, amount, address, 0],
      },
    } satisfies EvmContractCall,
  }

  const formattedAmount = formatNumberOrString(
    formatUnits(amount, tokenUSDC.decimals),
    NumberType.TokenTx,
  )

  return balance < amount ? (
    <Wrapper
      text={'Get Base Sepolia USDC from Aave faucet'}
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
      token={tokenUSDC}
      transferParams={transferParams}
    />
  )
})

export default ERC20ApproveAndTransferButton
