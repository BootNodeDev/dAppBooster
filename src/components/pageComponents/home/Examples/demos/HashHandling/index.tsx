import { Box, chakra, Flex, Input } from '@chakra-ui/react'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { createPublicClient, type PublicClient } from 'viem'
import { mainnet } from 'viem/chains'

import Hash from '@/src/components/pageComponents/home/Examples/demos/HashHandling/Hash'
import Icon from '@/src/components/pageComponents/home/Examples/demos/HashHandling/Icon'
import {
  type LookupResult,
  multiChainLookup,
} from '@/src/components/pageComponents/home/Examples/demos/HashHandling/lookup'
import Wrapper from '@/src/components/pageComponents/home/Examples/wrapper'
import { Spinner } from '@/src/core/components'
import { chains, transports } from '@/src/core/types'
import { useWallet } from '@/src/sdk/react/hooks'

const AlertIcon = () => (
  <chakra.svg
    fill="none"
    height="21px"
    viewBox="0 0 22 21"
    width="22px"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Alert Icon</title>
    <path
      d="M11 0C8.9233 0 6.89323 0.615814 5.16652 1.76957C3.4398 2.92332 2.09399 4.5632 1.29927 6.48182C0.504549 8.40045 0.296615 10.5116 0.701759 12.5484C1.1069 14.5852 2.10693 16.4562 3.57538 17.9246C5.04383 19.3931 6.91475 20.3931 8.95155 20.7982C10.9884 21.2034 13.0996 20.9954 15.0182 20.2007C16.9368 19.406 18.5767 18.0602 19.7304 16.3335C20.8842 14.6068 21.5 12.5767 21.5 10.5C21.4971 7.71613 20.3899 5.04712 18.4214 3.07862C16.4529 1.11013 13.7839 0.00293982 11 0ZM11 19.3846C9.24279 19.3846 7.52504 18.8635 6.06398 17.8873C4.60291 16.911 3.46414 15.5234 2.79169 13.9C2.11923 12.2765 1.94329 10.4901 2.2861 8.7667C2.62892 7.04325 3.4751 5.46016 4.71763 4.21763C5.96017 2.97509 7.54325 2.12891 9.2667 1.7861C10.9901 1.44328 12.7765 1.61923 14.4 2.29169C16.0234 2.96414 17.411 4.1029 18.3873 5.56397C19.3635 7.02504 19.8846 8.74279 19.8846 10.5C19.8819 12.8555 18.945 15.1138 17.2794 16.7794C15.6138 18.445 13.3555 19.3819 11 19.3846ZM10.1923 11.3077V5.65384C10.1923 5.43963 10.2774 5.23419 10.4289 5.08272C10.5803 4.93125 10.7858 4.84615 11 4.84615C11.2142 4.84615 11.4197 4.93125 11.5711 5.08272C11.7226 5.23419 11.8077 5.43963 11.8077 5.65384V11.3077C11.8077 11.5219 11.7226 11.7273 11.5711 11.8788C11.4197 12.0303 11.2142 12.1154 11 12.1154C10.7858 12.1154 10.5803 12.0303 10.4289 11.8788C10.2774 11.7273 10.1923 11.5219 10.1923 11.3077ZM12.2115 14.9423C12.2115 15.1819 12.1405 15.4162 12.0074 15.6154C11.8742 15.8146 11.685 15.9699 11.4636 16.0616C11.2423 16.1533 10.9987 16.1773 10.7636 16.1306C10.5286 16.0838 10.3128 15.9684 10.1433 15.799C9.97388 15.6296 9.85849 15.4137 9.81174 15.1787C9.765 14.9436 9.78899 14.7 9.88069 14.4787C9.97239 14.2573 10.1277 14.0681 10.3269 13.9349C10.5261 13.8018 10.7604 13.7308 11 13.7308C11.3213 13.7308 11.6295 13.8584 11.8567 14.0856C12.0839 14.3128 12.2115 14.621 12.2115 14.9423Z"
      fill="currentColor"
    />
  </chakra.svg>
)

const IconOK = ({ ...restProps }) => (
  <chakra.svg
    fill="none"
    height="13px"
    position="absolute"
    zIndex={15}
    right={4}
    top="50%"
    transform="translateY(-50%)"
    viewBox="0 0 19 13"
    width="19px"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Checkmark Icon</title>
    <path
      d="M17.5 1L6.5 12L1.5 7"
      stroke="#29BD7F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </chakra.svg>
)

const StatusAlert = ({ children }: { children: ReactNode }) => (
  <Flex
    alignItems="center"
    backgroundColor="var(--theme-hash-input-search-status-background-color)"
    borderRadius="var(--base-textfield-border-radius)"
    color="#fab754"
    columnGap={2}
    fontSize="14px"
    minHeight="64px"
    paddingTop={8}
    paddingRight={{ base: 2, lg: 4 }}
    paddingBottom={4}
    paddingLeft={{ base: 2, lg: 4 }}
    marginTop={-4}
    width="100%"
  >
    <AlertIcon />
    <span>{children}</span>
  </Flex>
)

/**
 * This demo shows how to look up an address, ENS name, or transaction hash across
 * all configured chains.
 *
 * For tx-hash inputs we use a hybrid strategy: query the primary chain first
 * (wallet chain, else mainnet, else the first configured chain), and on a miss
 * fan out across the remaining chains in parallel. Address and ENS lookups only
 * hit the primary chain because the answer doesn't change per chain (addresses
 * are always either contracts or EOAs; ENS is mainnet-anchored).
 */
const HashHandling = ({ ...restProps }) => {
  const { status } = useWallet()
  const isWalletConnected = status.connected
  const walletChainId = status.connectedChainIds[0] as number | undefined

  const clientByChain = useMemo<Map<number, PublicClient>>(
    () =>
      new Map(
        chains.map((chain) => [
          chain.id,
          createPublicClient({ chain, transport: transports[chain.id] }) as PublicClient,
        ]),
      ),
    [],
  )

  const primaryChainId =
    isWalletConnected && walletChainId && clientByChain.has(walletChainId)
      ? walletChainId
      : clientByChain.has(mainnet.id)
        ? mainnet.id
        : chains[0].id

  const findChainById = (id: number) => chains.find((chain) => chain.id === id)
  const chainName = (id: number) => findChainById(id)?.name ?? `chain ${id}`

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)

  const lookupTokenRef = useRef(0)

  const runLookup = useDebouncedCallback(async (value: string) => {
    const token = ++lookupTokenRef.current

    if (!value) {
      if (token === lookupTokenRef.current) {
        setResult(null)
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const lookup = await multiChainLookup(value, clientByChain, primaryChainId)
      if (token === lookupTokenRef.current) {
        setResult(lookup)
      }
    } finally {
      if (token === lookupTokenRef.current) {
        setLoading(false)
      }
    }
  }, 500)

  useEffect(() => {
    runLookup(input)
  }, [input, runLookup])

  const found = result?.found
  const totalChains = chains.length
  const allErrored = result && !found && result.errors.length === totalChains
  const notFoundAnywhere = result && !found && !allErrored

  return (
    <Box
      css={{
        '--base-horizontal-padding': '16px',
        '--base-textfield-padding': '0 8px',
        '--base-textfield-border-radius': '8px',
        '.light &': {
          '--theme-textfield-color': '#2e3048',
          '--theme-textfield-background-color': '#fff',
          '--theme-textfield-background-color-active': '#f7f7f7',
          '--theme-textfield-border-color': '#c5c2cb',
          '--theme-textfield-placeholder-color': 'rgb(22 29 26 / 60%)',
          '--theme-hash-input-search-status-background-color': '#2e3048',
        },
        '.dark &': {
          '--theme-textfield-color': '#fff',
          '--theme-textfield-background-color': '#373954',
          '--theme-textfield-background-color-active': '#33354f',
          '--theme-textfield-border-color': '#5f6178',
          '--theme-textfield-placeholder-color': 'rgb(247 247 247 / 60%)',
          '--theme-hash-input-search-status-background-color': '#2e3048',
        },
      }}
      position="relative"
      width="100%"
    >
      <Wrapper
        title="Address & Transaction Hash Validator"
        {...restProps}
      >
        <Box>
          <Box
            position="relative"
            width="100%"
          >
            <Input
              backgroundColor="var(--theme-textfield-background-color)"
              borderColor="var(--theme-textfield-border-color)"
              borderRadius="8px"
              color="var(--theme-textfield-color)"
              display="block"
              fontSize="14px"
              height="50px"
              minWidth="0"
              outline="none"
              padding={{ base: 2, lg: 4 }}
              paddingRight={12}
              placeholder="Address / Tx Hash"
              position="relative"
              transition="border-color {durations.slow}, color {durations.slow}, background-color {durations.slow}"
              type="search"
              value={input}
              width="100%"
              zIndex={10}
              _active={{
                backgroundColor: 'var(--theme-textfield-background-color-active)',
                color: 'var(--theme-textfield-color)',
              }}
              _focus={{
                backgroundColor: 'var(--theme-textfield-background-color-active)',
                color: 'var(--theme-textfield-color)',
              }}
              _placeholder={{
                color: 'var(--theme-textfield-placeholder-color)',
              }}
              onChange={(e) => setInput(e.target.value)}
            />
            {loading && (
              <Flex
                alignItems="center"
                height="100%"
                justifyContent="center"
                position="absolute"
                right="0"
                top="0"
                width="50px"
                zIndex="15"
              >
                <Spinner size="md" />
              </Flex>
            )}
            {found && !loading && <IconOK />}
          </Box>

          {allErrored && (
            <StatusAlert>
              Couldn't check any chain. RPC errors on:{' '}
              {result?.errors.map((entry) => chainName(entry.chainId)).join(', ')}
            </StatusAlert>
          )}

          {notFoundAnywhere && (
            <StatusAlert>
              Not found on any of {totalChains} chains.
              {result?.errors.length
                ? ` Couldn't reach: ${result.errors.map((entry) => chainName(entry.chainId)).join(', ')}.`
                : ''}
            </StatusAlert>
          )}

          {found && (
            <Box
              marginTop={2}
              fontSize="14px"
              color="var(--theme-textfield-placeholder-color)"
            >
              Found on {chainName(found.chainId)}
            </Box>
          )}

          <Hash
            chainId={found?.chainId}
            hash={
              found?.detection.type === 'transaction'
                ? found.detection.data.hash
                : found?.detection.data
            }
            kind={found?.detection.type === 'transaction' ? 'tx' : found ? 'address' : undefined}
            truncatedHashLength="disabled"
          />
        </Box>
      </Wrapper>
    </Box>
  )
}

const hashHandling = {
  demo: <HashHandling />,
  href: 'https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_Hash.Hash.html',
  icon: <Icon />,
  text: (
    <>
      Validate an address or hash. Lookup runs across all configured chains; the result tells you
      which chain the tx was found on, and which chains couldn't be reached.
    </>
  ),
  title: 'Hash handling',
}

export default hashHandling
