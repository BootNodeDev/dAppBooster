import { useState } from 'react'
import styled, { css } from 'styled-components'

import { ExternalLink, Text, useDialog, GeneralMessage as GeneralMessageBase } from 'db-ui-toolkit'
import { type Address, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'

import { useSuspenseReadErc20BalanceOf } from '@/src/hooks/generated'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import ERC20ApproveAndTransferButton from '@/src/pageComponents/home/Examples/demos/ERC20ApproveAndTransferButtonDemo/ERC20ApproveAndTransferButton'
import { PrimaryButton } from '@/src/sharedComponents/Buttons'
import { withWalletStatusVerifier } from '@/src/sharedComponents/WalletStatusVerifier'
import { type Token } from '@/src/types/token'
import { formatNumberOrString, NumberType } from '@/src/utils/numberFormat'
import { withSuspense } from '@/src/utils/suspenseWrapper'

const GeneralMessage = styled(GeneralMessageBase)<{ status?: 'ok' | 'error' }>`
  ${({ status }) =>
    status === 'ok' &&
    css`
      --theme-general-message-icon-color: var(--theme-color-ok);
    `}
`

// USDC token on sepolia chain
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

const ApproveAndSendDemo = withWalletStatusVerifier(
  withSuspense(() => {
    const { Dialog, close, open } = useDialog()
    const { address } = useWeb3StatusConnected()
    const { writeContractAsync } = useWriteContract()

    const { data: balance } = useSuspenseReadErc20BalanceOf({
      address: tokenUSDC_sepolia.address as Address,
      args: [address],
    })

    // AAVE staging contract pool address
    const spender = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951'

    const amount = 10000000000n // 10,000.00 USDC

    const handleTransaction = () =>
      writeContractAsync({
        abi: ABIExample,
        address: spender,
        functionName: 'supply',
        args: [tokenUSDC_sepolia.address as Address, amount, address, 0],
      })

    const formattedAmount = formatNumberOrString(
      formatUnits(amount, tokenUSDC_sepolia.decimals),
      NumberType.TokenTx,
    )

    return (
      <>
        {balance < amount ? (
          <>
            <Text>Not enough USDC!</Text>
            <PrimaryButton as={ExternalLink} href="https://staging.aave.com/faucet/">
              Mint {formattedAmount} USDC
            </PrimaryButton>
          </>
        ) : (
          <ERC20ApproveAndTransferButton
            amount={amount}
            label={`Supply ${formattedAmount} USDC`}
            labelSending="Sending..."
            onSuccess={() => open('approve-and-transfer')}
            spender={spender}
            token={tokenUSDC_sepolia}
            transaction={handleTransaction}
          />
        )}
        <Dialog id="approve-and-transfer">
          <GeneralMessage
            actionButton={
              <PrimaryButton onClick={() => close('approve-and-transfer')}>Close</PrimaryButton>
            }
            message={'Approve and supply completed! 🎉'}
            status={'ok'}
            title={'Success'}
          />
        </Dialog>
      </>
    )
  }),
  { chainId: sepolia.id }, // this DEMO component only works on sepolia chain
)

export default ApproveAndSendDemo
