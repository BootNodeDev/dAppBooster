import type { Props as ItemProps } from '@/src/components/pageComponents/home/Examples/Item'
import List from '@/src/components/pageComponents/home/Examples/List'
import connectWallet from '@/src/components/pageComponents/home/Examples/demos/ConnectWallet'
import ensName from '@/src/components/pageComponents/home/Examples/demos/EnsName'
import hashHandling from '@/src/components/pageComponents/home/Examples/demos/HashHandling'
import optimismCrossDomainMessenger from '@/src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger'
import signMessage from '@/src/components/pageComponents/home/Examples/demos/SignMessage'
import switchNetwork from '@/src/components/pageComponents/home/Examples/demos/SwitchNetwork'
import tokenDropdown from '@/src/components/pageComponents/home/Examples/demos/TokenDropdown'
import tokenInput from '@/src/components/pageComponents/home/Examples/demos/TokenInput'
import transactionButton from '@/src/components/pageComponents/home/Examples/demos/TransactionButton'
import { Inner } from '@/src/components/sharedComponents/ui/Inner'
import { Box, type BoxProps, Flex, Heading, Text, chakra } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

const Examples: FC<BoxProps> = ({ css, ...restProps }) => {
  const items: ItemProps[] = [
    connectWallet,
    hashHandling,
    tokenDropdown,
    tokenInput,
    switchNetwork,
    ensName,
    transactionButton,
    signMessage,
    optimismCrossDomainMessenger,
  ]

  return (
    <Box
      flexDirection="column"
      backgroundColor="var(--background-color)"
      css={{
        ...styles,
        ...css,
      }}
      id="examples"
      paddingBottom={{ base: '50px', lg: '130px' }}
      paddingTop={{ base: '50px', lg: '130px' }}
      {...restProps}
    >
      <Inner
        flexDirection="column"
        rowGap={14}
      >
        <Flex
          gap={6}
          flexDirection={{ base: 'column', lg: 'row' }}
          justifyContent="space-between"
        >
          <Heading
            color="var(--text-color)"
            fontSize={{ base: '28px', lg: '36px' }}
            fontWeight={700}
            lineHeight={1.2}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            Explore dAppBooster:
            <br />
            Interactive Demos in Action
          </Heading>
          <Text
            color="var(--text-color)"
            fontSize="16px"
            fontWeight={400}
            lineHeight={1.5}
            margin={{ base: '0 auto', lg: '0' }}
            maxWidth={{ base: 'none', md: '80%', lg: 'none' }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            Dive into interactive demos showcasing dAppBooster's powerful features. From{' '}
            <chakra.br display={{ base: 'none', lg: 'block' }} />
            wallet connectivity to token management, experience the tools that simplify{' '}
            <chakra.br display={{ base: 'none', lg: 'block' }} />
            and accelerate your Web3 development.
          </Text>
        </Flex>
        <List items={items} />
      </Inner>
    </Box>
  )
}

export default Examples
