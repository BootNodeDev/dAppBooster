import { type ChangeEvent, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { Item, Spinner, Textfield, breakpointMediaQuery } from '@bootnodedev/db-ui-toolkit'
import { useDebouncedCallback } from 'use-debounce'
import type { Address } from 'viem'
import { useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { OptionsButton } from '@/src/components/pageComponents/home/Examples/demos/OptionsButton'
import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'

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

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      margin-top: calc(var(--base-common-padding) * 3);
    `,
  )}
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

const ButtonText = styled.span`
  display: block;
  max-width: 115px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EnsNameSearch = ({ address }: { address?: Address }) => {
  const { data, error, status } = useEnsName({
    address: address,
    chainId: mainnet.id,
  })

  return (
    <>
      {status === 'pending' ? (
        <Spinner
          height={20}
          width={20}
        />
      ) : status === 'error' ? (
        `Error fetching ENS name (${error.message})`
      ) : data === undefined || data === null ? (
        'Not available'
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

  const dropdownItems = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0xaed56A64169A1eD7fFD83619A211b55a13f9F974',
    '0x14536667Cd30e52C0b458BaACcB9faDA7046E056',
    '0x8BCBd56588d77cd06C7930c09aB55ca7EF09b395',
  ]
  const [currentItem, setCurrentItem] = useState<string | undefined>()

  useEffect(() => {
    debouncedSearch(value as Address)
  }, [debouncedSearch, value])

  return (
    <Wrapper>
      <OptionsDropdown
        button={
          <OptionsButton>
            <ButtonText>
              {dropdownItems.find((item) => item === currentItem) || 'Select an address'}
            </ButtonText>
          </OptionsButton>
        }
        items={dropdownItems.map((item) => (
          <Item
            key={`${item}`}
            onClick={() => {
              setCurrentItem(item)
              setValue(item as Address)
            }}
          >
            {item}
          </Item>
        ))}
      />
      <Title>Find ENS name</Title>
      <Textfield
        onChange={onChange}
        placeholder="Enter an address or select one from the dropdown"
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
