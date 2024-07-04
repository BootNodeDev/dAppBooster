import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import styled from 'styled-components'

import { Button, Text } from 'db-ui-toolkit'
import { Chain, formatUnits, getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import { useTokens } from '@/src/hooks/useTokens'
import { TokenSelector } from '@/src/pageComponents/home/Examples/demos/Tokens'
import { BigNumberInput, type BigNumberInputProps } from '@/src/sharedComponents/BigNumberInput'
import TokenLogo from '@/src/sharedComponents/TokenLogo'
import TokenList from '@/src/sharedComponents/Tokens/TokenList'
import { type Token } from '@/src/types/token'
import { WithSuspenseAndRetryProps, withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const Wrapper = styled.div``

const Row = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
`

const ListToggler = styled.div``

const List = styled.div`
  * {
    font-size: 0.9em;
  }
`

const Error = styled.p`
  background-color: #6c0000;
  color: #ff0;
  font-weight: 800;
  padding: 0.25em;
`

type TokenInputProps = {
  chain: Chain
  onAmountSet: (amount?: string) => void
  onError: (error?: string) => void
  onTokenSelected: (token?: Token) => void
  tokenListPlaceholder?: string
}

/**
 * TokenInput component allows users to input token amounts and select tokens from a list.
 * It displays the token input field, token balance, and a dropdown list of available tokens.
 *
 * @param chain - The chain object representing the blockchain network.
 * @param onAmountSet - A callback function triggered when the amount is set.
 * @param onError - A callback function triggered when there is an error.
 * @param onTokenSelected - A callback function triggered when a token is selected.
 * @param tokenListPlaceholder - The placeholder text for the token list search input.
 */
const TokenInput: FC<TokenInputProps> = ({
  chain,
  onAmountSet,
  onError,
  onTokenSelected,
  tokenListPlaceholder,
}) => {
  /**
   * Destructure the necessary values and functions from the useTokenInput hook.
   */
  const {
    amount,
    amountError,
    balance,
    balanceError,
    displayList,
    isLoadingBalance,
    setAmount,
    setAmountError,
    setDisplayList,
    setTokenSelected,
    tokenSelected,
  } = useTokenInput()

  /**
   * Build the token list based on the specified chain.
   */
  const Tokens = useMemo(() => buildList({ chain }), [chain])

  /**
   * Rendered when there is a fetch error. Allows the user to retry the fetch.
   */
  const retry = useCallback<Required<WithSuspenseAndRetryProps>['fallbackRender']>(
    ({ resetErrorBoundary }) => (
      <div>
        <Button onClick={resetErrorBoundary}>again!</Button>
      </div>
    ),
    [],
  )

  const handleTokenSelected = (token: Token) => {
    onTokenSelected(token)
    setTokenSelected(token)
  }

  const handleSetAmount = (amount: string) => {
    setAmount(amount)
    onAmountSet(amount)
  }

  const handleSetMax = () => {
    handleSetAmount(formatUnits(balance ?? 0n, tokenSelected!.decimals))
  }

  const handleError: BigNumberInputProps['onError'] = (error) => {
    onError(error?.message)
    setAmountError(error?.message)
  }

  const toggleList = () => {
    setDisplayList((prev) => !prev)
  }

  return (
    <Wrapper>
      <Row>
        {tokenSelected ? (
          <BigNumberInput
            decimals={tokenSelected.decimals}
            max={balance ? formatUnits(balance, tokenSelected.decimals) : undefined}
            onChange={handleSetAmount}
            onError={(error) => handleError(error)}
            value={amount}
          />
        ) : (
          <input disabled placeholder="nothing to see..." />
        )}
        <ListToggler onClick={toggleList}>
          {tokenSelected && <TokenLogo token={tokenSelected} />}
        </ListToggler>
      </Row>

      {amountError && (
        <Row>
          <Error>{amountError}</Error>
        </Row>
      )}

      <Row>
        {balanceError ? (
          <Text>something went wrong...</Text>
        ) : (
          <Text>
            {isLoadingBalance
              ? '...'
              : // TODO: crapy defaults
                `Balance: ${formatUnits(balance ?? 0n, tokenSelected?.decimals ?? 0)}`}
          </Text>
        )}
        <Button disabled={isLoadingBalance || !!balanceError} onClick={handleSetMax}>
          Max
        </Button>
      </Row>

      {displayList && (
        <List>
          <Tokens
            fallbackRender={retry}
            onTokenSelected={handleTokenSelected}
            searchPlaceholder={tokenListPlaceholder}
          />
        </List>
      )}
    </Wrapper>
  )
}

function buildList({ chain }: { chain: Chain }) {
  return withSuspenseAndRetry<TokenSelector>(({ onTokenSelected, searchPlaceholder }) => {
    const { tokensByChainId } = useTokens()

    return (
      <>
        <strong>{chain.name}</strong>
        <TokenList
          onTokenSelected={onTokenSelected}
          searchPlaceholder={searchPlaceholder}
          tokenList={tokensByChainId[chain.id]}
        />
      </>
    )
  })
}

function useTokenInput() {
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | null>()
  const [tokenSelected, setTokenSelected] = useState<Token>()
  const [displayList, setDisplayList] = useState(false)

  const { address: userWallet } = useAccount()
  const { balance, balanceError, isLoadingBalance } = useErc20Balance({
    address: userWallet ? getAddress(userWallet) : undefined,
    token: tokenSelected,
  })

  // reset amount when token change
  useEffect(() => {
    setAmount('')
  }, [tokenSelected])

  return {
    amount,
    setAmount,
    amountError,
    setAmountError,
    balance,
    balanceError,
    isLoadingBalance,
    tokenSelected,
    setTokenSelected,
    displayList,
    setDisplayList,
  }
}

export default TokenInput
