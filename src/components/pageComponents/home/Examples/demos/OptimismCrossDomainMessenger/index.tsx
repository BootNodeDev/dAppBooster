import { Flex, Span } from '@chakra-ui/react'
import { useState } from 'react'
import type { Address, TransactionReceipt } from 'viem'
import { parseEther } from 'viem'
import { optimismSepolia, sepolia } from 'viem/chains'
import { extractTransactionDepositedLogs, getL2TransactionHash } from 'viem/op-stack'
import Icon from '@/src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger/Icon'
import Wrapper from '@/src/components/pageComponents/home/Examples/wrapper'
import { getContract } from '@/src/contracts/definitions'
import { buildCrossDomainMessageParams } from '@/src/contracts/hooks/useOPL1CrossDomainMessengerProxy'
import { Hash, PrimaryButton, Spinner } from '@/src/core/components'
import { withSuspenseAndRetry } from '@/src/core/utils'
import { getExplorerUrl } from '@/src/sdk/core/chain/explorer'
import { WalletGuard } from '@/src/sdk/react/components'
import { useChainRegistry, useTransaction, useWallet } from '@/src/sdk/react/hooks'

/**
 * Cross-chain deposit demo using the adapter architecture.
 *
 * Level 5 (buildCrossDomainMessageParams) for OP-specific gas estimation,
 * Level 2 (useTransaction) for lifecycle + execution.
 */
const OptimismCrossDomainMessenger = withSuspenseAndRetry(() => {
  const AAVEProxy = '0xb50201558b00496a145fe76f7424749556e326d8'
  const wallet = useWallet({ chainId: sepolia.id })
  const walletAddress = wallet.status.activeAccount as Address
  const registry = useChainRegistry()

  const contract = getContract('AAVEWeth', optimismSepolia.id)
  const depositValue = parseEther('0.01')

  const [l2Hash, setL2Hash] = useState<Address | null>(null)

  const tx = useTransaction({
    lifecycle: {
      onConfirm: (result) => {
        const receipt = result.receipt as TransactionReceipt
        const [log] = extractTransactionDepositedLogs(receipt)
        if (log) {
          setL2Hash(getL2TransactionHash({ log }))
        }
      },
    },
  })

  const l2ExplorerUrl = l2Hash
    ? getExplorerUrl(registry, { chainId: optimismSepolia.id, tx: l2Hash })
    : null

  const handleDeposit = async () => {
    setL2Hash(null)
    try {
      const params = await buildCrossDomainMessageParams({
        fromChain: sepolia,
        contractName: 'AAVEWeth',
        functionName: 'depositETH',
        l2ContractAddress: contract.address,
        args: [AAVEProxy, walletAddress, 0],
        value: depositValue,
        walletAddress,
      })
      await tx.execute(params)
    } catch {
      // useTransaction sets tx.error internally — no additional handling needed
    }
  }

  const isPending = tx.phase !== 'idle'

  return (
    <Wrapper title="Execute transaction">
      <p>
        Deposit <b>0.01</b> ETH in{' '}
        <a
          href="https://staging.aave.com/?marketName=proto_optimism_sepolia_v3"
          rel="noreferrer"
          target="_blank"
        >
          Optimism Sepolia AAVE market
        </a>{' '}
        from Sepolia.
      </p>
      <PrimaryButton
        disabled={isPending}
        onClick={handleDeposit}
      >
        {isPending ? (
          <Flex
            alignItems="center"
            gap={2}
          >
            <Spinner size="sm" />
            {tx.phase === 'prepare' ? 'Estimating...' : 'Sending...'}
          </Flex>
        ) : (
          'Deposit ETH'
        )}
      </PrimaryButton>
      {tx.error && (
        <Flex color="danger">
          {'shortMessage' in tx.error
            ? (tx.error as { shortMessage: string }).shortMessage
            : tx.error.message}
        </Flex>
      )}
      {l2Hash && (
        <Flex
          alignItems="center"
          display="flex"
          gap={2}
        >
          <Span>OpSepolia tx</Span>
          <Hash
            explorerURL={l2ExplorerUrl ?? ''}
            hash={l2Hash}
          />
        </Flex>
      )}
    </Wrapper>
  )
})

const optimismCrossdomainMessenger = {
  demo: (
    <WalletGuard chainId={sepolia.id}>
      <OptimismCrossDomainMessenger />
    </WalletGuard>
  ),
  href: 'https://bootnodedev.github.io/dAppBooster/functions/hooks_useOPL1CrossDomainMessengerProxy.useL1CrossDomainMessengerProxy.html',
  icon: <Icon />,
  text: (
    <>
      Learn more in{' '}
      <a
        href="https://docs.optimism.io/builders/app-developers/bridging/messaging"
        rel="noreferrer"
        target="_blank"
      >
        Optimism cross domain messenger.
      </a>
    </>
  ),
  title: 'Optimism cross domain messenger',
}

export default optimismCrossdomainMessenger
