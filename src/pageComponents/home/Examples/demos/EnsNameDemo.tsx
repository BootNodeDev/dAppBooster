import { useState, type ChangeEvent } from 'react'
import styled from 'styled-components'

import { Spinner, Textfield } from 'db-ui-toolkit'
import { useDebouncedCallback } from 'use-debounce'
import { Address } from 'viem'
import { useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-token-ens-name-background: #fff;
    --theme-token-ens-name-title-color: #2e3048;
    --theme-token-ens-name-text-color: #2e3048;

    --theme-textfield-color: #2e3048;
    --theme-textfield-background-color: #fff;
    --theme-textfield-background-color-active: rgb(0 0 0 / 5%);
    --theme-textfield-border-color: #c5c2cb;
    --theme-textfield-placeholder-color: rgb(22 29 26 / 60%);
  }

  [data-theme='dark'] & {
    --theme-token-ens-name-background: #373954;
    --theme-token-ens-name-title-color: #fff;
    --theme-token-ens-name-text-color: #e2e0e7;

    --theme-textfield-color: #fff;
    --theme-textfield-background-color: #373954;
    --theme-textfield-background-color-active: rgb(255 255 255 / 5%);
    --theme-textfield-border-color: #5f6178;
    --theme-textfield-placeholder-color: rgb(247 247 247 / 60%);
  }

  background-color: var(--theme-token-ens-name-background);
  border-radius: var(--base-border-radius);
  display: flex;
  flex-direction: column;
  padding: var(--base-common-padding-xl);
  row-gap: var(--base-gap);
  width: 100%;
`

const Title = styled.h3`
  color: var(--theme-token-ens-name-title-color);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const ENSName = styled.div`
  align-items: center;
  color: var(--theme-token-ens-name-text-color);
  column-gap: var(--base-gap);
  display: flex;
  font-size: 1.5rem;
  height: 20px;
  line-height: 1.2;
  padding-top: var(--base-common-padding);
`

const EnsNameSearch = ({ address }: { address?: Address }) => {
  const { data, error, status } = useEnsName({
    address: address,
    chainId: mainnet.id,
  })

  return (
    <>
      {status === 'pending' ? (
        <Spinner height={20} width={20} />
      ) : status === 'error' ? (
        `Error fetching ENS name (${error.message})`
      ) : data === undefined || data === null ? (
        `Not available`
      ) : (
        data
      )}
    </>
  )
}

const EnsNameDemo = () => {
  const [ensAddress, setEnsAddress] = useState<Address>()
  const [value, setValue] = useState<string | undefined>()
  const debounceTime = 500

  const debouncedSearch = useDebouncedCallback(async (address?: Address) => {
    setEnsAddress(address)
  }, debounceTime)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as Address

    setValue(value)
    debouncedSearch(value)
  }

  return (
    <Wrapper>
      <Title>Find ENS name</Title>
      <Textfield
        onChange={onChange}
        placeholder="Enter an address"
        type="search"
        value={value || ''}
      />
      <ENSName>
        <b>ENS name:</b> <span>{ensAddress ? <EnsNameSearch address={ensAddress} /> : '-'}</span>
      </ENSName>
    </Wrapper>
  )
}

export default EnsNameDemo
