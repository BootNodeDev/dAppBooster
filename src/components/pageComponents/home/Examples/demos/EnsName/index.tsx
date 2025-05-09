import Icon from '@/src/components/pageComponents/home/Examples/demos/EnsName/Icon'
import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import Spinner from '@/src/components/sharedComponents/ui/Spinner'
import { Flex, Heading, Input } from '@chakra-ui/react'
import { type ChangeEvent, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { Address } from 'viem'
import { useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const EnsNameSearch = ({ address }: { address?: Address }) => {
  const { data, error, status } = useEnsName({
    address: address,
    chainId: mainnet.id,
  })

  return (
    <>
      {status === 'pending' ? (
        <Spinner size="md" />
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

const EnsName = () => {
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

  const addresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Address,
    '0xaed56A64169A1eD7fFD83619A211b55a13f9F974' as Address,
    '0x14536667Cd30e52C0b458BaACcB9faDA7046E056' as Address,
    '0x8BCBd56588d77cd06C7930c09aB55ca7EF09b395' as Address,
  ]

  const makeItem = (address: Address) => {
    return {
      label: address,
      onClick: () => setValue(address),
    }
  }

  const items = addresses.map((item) => makeItem(item))

  useEffect(() => {
    debouncedSearch(value as Address)
  }, [debouncedSearch, value])

  return (
    <Flex
      css={{
        '.light &': {
          '--theme-token-ens-name-background': '#fff',
          '--theme-token-ens-name-title-color': '#2e3048',
          '--theme-token-ens-name-text-color': '#2e3048',
          '--theme-textfield-color': '#2e3048',
          '--theme-textfield-background-color': '#fff',
          '--theme-textfield-background-color-active': 'rgb(0 0 0 / 5%)',
          '--theme-textfield-border-color': '#c5c2cb',
          '--theme-textfield-placeholder-color': 'rgb(22 29 26 / 60%)',
        },
        '.dark &': {
          '--theme-token-ens-name-background': '#373954',
          '--theme-token-ens-name-title-color': '#fff',
          '--theme-token-ens-name-text-color': '#e2e0e7',
          '--theme-textfield-color': '#fff',
          '--theme-textfield-background-color': '#373954',
          '--theme-textfield-background-color-active': 'rgb(255 255 255 / 5%)',
          '--theme-textfield-border-color': '#5f6178',
          '--theme-textfield-placeholder-color': 'rgb(247 247 247 / 60%)',
        },
      }}
      bgColor="var(--theme-token-ens-name-background)"
      borderRadius="4px"
      flexDirection="column"
      padding={4}
      rowGap={2}
      width="100%"
      marginTop={{ lg: 6 }}
    >
      <OptionsDropdown
        placeholder="Select an address"
        items={items}
      />
      <Heading
        as="h3"
        color="var(--theme-token-ens-name-title-color)"
        fontSize="14px"
        fontWeight={700}
        lineHeight={1.2}
        margin={0}
      >
        Find ENS name
      </Heading>
      <Input
        onChange={onChange}
        placeholder="Enter an address or select one from the dropdown"
        type="search"
        value={value || ''}
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
        position="relative"
        transition="border-color var({durations.slow}), color var({durations.slow}), background-color var({durations.slow})"
        width="100%"
        zIndex={10}
        _active={{
          backgroundColor: 'var(--theme-textfield-background-color)',
          color: 'var(--theme-textfield-color)',
        }}
        _focus={{
          backgroundColor: 'var(--theme-textfield-background-color)',
          color: 'var(--theme-textfield-color)',
        }}
        _placeholder={{
          color: 'var(--theme-textfield-placeholder-color)',
        }}
      />
      <Flex
        alignItems="center"
        color="var(--theme-token-ens-name-text-color)"
        columnGap={2}
        fontSize="15px"
        height="20px"
        lineHeight={1.2}
        paddingTop={2}
      >
        <b>ENS name:</b> <span>{ensAddress ? <EnsNameSearch address={ensAddress} /> : '-'}</span>
      </Flex>
    </Flex>
  )
}

const ensName = {
  demo: <EnsName />,
  icon: <Icon />,
  href: 'https://bootnodedev.github.io/dAppBooster/functions/utils_hash.detectEnsName.html',
  text: (
    <>
      Resolve{' '}
      <a
        href="https://ens.domains/"
        rel="noreferrer"
        target="_blank"
      >
        ENS
      </a>{' '}
      names to their corresponding addresses.
    </>
  ),
  title: 'ENS name',
}

export default ensName
