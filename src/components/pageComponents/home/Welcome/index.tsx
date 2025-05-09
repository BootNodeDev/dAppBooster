import { Inner } from '@/src/components/sharedComponents/ui/Inner'
import { type FlexProps, Heading, Link, Span, Text, chakra } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

const Arrow = () => (
  <svg
    width="16"
    height="30"
    viewBox="0 0 16 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Arrow icon</title>
    <rect
      x="0.5"
      y="0.5"
      width="15"
      height="29"
      rx="7.5"
      stroke="currentColor"
    />
    <path
      d="M8.5 12C8.5 11.7239 8.27614 11.5 8 11.5C7.72386 11.5 7.5 11.7239 7.5 12L8.5 12ZM7.64645 22.3536C7.84171 22.5488 8.15829 22.5488 8.35355 22.3536L11.5355 19.1716C11.7308 18.9763 11.7308 18.6597 11.5355 18.4645C11.3403 18.2692 11.0237 18.2692 10.8284 18.4645L8 21.2929L5.17157 18.4645C4.97631 18.2692 4.65973 18.2692 4.46447 18.4645C4.2692 18.6597 4.2692 18.9763 4.46447 19.1716L7.64645 22.3536ZM8 12L7.5 12L7.5 22L8 22L8.5 22L8.5 12L8 12Z"
      fill="currentColor"
    />
  </svg>
)

const Decoration = () => (
  <chakra.svg
    display="block"
    fill="none"
    height={{ base: '360px', md: '550px', xl: '787px' }}
    position="absolute"
    right={{ base: '-60px', md: '-100px', xl: '0' }}
    top="0"
    viewBox="0 0 438 787"
    width="auto"
    xmlns="http://www.w3.org/2000/svg"
    zIndex={0}
  >
    <title>Decoration image</title>
    <rect
      x="-131"
      y="68.5986"
      width="633"
      height="1201"
      rx="316.5"
      transform="rotate(-45 -131 68.5986)"
      fill="url(#paint0_linear_1859_3107)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_1859_3107"
        x1="-130.992"
        y1="669.113"
        x2="501.93"
        y2="669.113"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#662681" />
        <stop
          offset="0.15"
          stopColor="#692581"
        />
        <stop
          offset="0.26"
          stopColor="#722381"
        />
        <stop
          offset="0.36"
          stopColor="#822080"
        />
        <stop
          offset="0.43"
          stopColor="#931C80"
        />
        <stop
          offset="0.62"
          stopColor="#B51C7B"
        />
        <stop
          offset="0.87"
          stopColor="#D91D75"
        />
        <stop
          offset="1"
          stopColor="#E71D73"
        />
      </linearGradient>
    </defs>
  </chakra.svg>
)

const Welcome: FC<FlexProps> = ({ css, ...restProps }: FlexProps) => {
  return (
    <>
      <Inner
        css={{
          ...styles,
          ...css,
        }}
        flexDirection="column"
        flexGrow="1"
        minHeight={{ base: 'calc(100vh - 90px)' }}
        position="relative"
        zIndex={1}
        {...restProps}
      >
        <Heading
          color="var(--title-color)"
          fontSize={{ base: '32px', md: '42px', xl: '62px' }}
          fontWeight="700"
          lineHeight="1.2"
          marginBottom={4}
          marginTop="auto"
          pt={{ base: 8, md: 0 }}
          textAlign="center"
        >
          Hi, I'm a dApp created
          <br />
          using dAppBooster's
          <br />
          Web3 template!
        </Heading>
        <Text
          color="var(--text-color)"
          fontSize={{ base: '16px', md: '18px' }}
          lineHeight="1.5"
          margin="0 auto"
          maxWidth="100%"
          textAlign="center"
          width="500px"
        >
          A cutting-edge foundation built with React to seamlessly launch your next Web3 project.
        </Text>
        <Link
          alignContent="center"
          color="var(--button-text-color)"
          display="flex"
          flexDirection="column"
          gap={1}
          href="#examples"
          marginBottom={10}
          marginLeft="auto"
          marginRight="auto"
          marginTop="auto"
          textDecoration="none"
          _active={{
            opacity: 0.5,
          }}
        >
          <Span
            fontSize="12px"
            fontWeight="400"
            lineHeight="1.2"
          >
            Scroll to demos
          </Span>
          <Arrow />
        </Link>
      </Inner>
      <Decoration />
    </>
  )
}

export default Welcome
