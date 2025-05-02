import {
  type ButtonProps,
  Flex,
  type FlexProps,
  Heading,
  type HeadingProps,
  Input,
  type InputProps,
  Span,
  type SpanProps,
  chakra,
} from '@chakra-ui/react'
import type { FC } from 'react'

const BaseChevronDown = ({ ...restProps }) => (
  <svg
    fill="none"
    height="8"
    viewBox="0 0 12 8"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Chevron down</title>
    <path
      d="M1.5 1.75L6 6.25L10.5 1.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const CloseIcon = ({ ...restProps }) => (
  <svg
    fill="none"
    height="21"
    viewBox="0 0 21 21"
    width="21"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Close</title>
    <path
      d="M20.3111 18.4444C20.404 18.5373 20.4777 18.6476 20.528 18.769C20.5783 18.8904 20.6041 19.0205 20.6041 19.1519C20.6041 19.2833 20.5783 19.4134 20.528 19.5348C20.4777 19.6562 20.404 19.7665 20.3111 19.8594C20.2182 19.9523 20.1079 20.026 19.9865 20.0763C19.8651 20.1266 19.735 20.1525 19.6036 20.1525C19.4722 20.1525 19.3421 20.1266 19.2207 20.0763C19.0993 20.026 18.989 19.9523 18.8961 19.8594L10.6036 11.5657L2.31108 19.8594C2.12344 20.0471 1.86895 20.1525 1.60358 20.1525C1.33822 20.1525 1.08372 20.0471 0.896083 19.8594C0.708443 19.6718 0.603027 19.4173 0.603027 19.1519C0.603027 18.8866 0.708443 18.6321 0.896083 18.4444L9.18983 10.1519L0.896083 1.85942C0.708443 1.67178 0.603027 1.41729 0.603027 1.15192C0.603027 0.886559 0.708443 0.632064 0.896083 0.444423C1.08372 0.256783 1.33822 0.151367 1.60358 0.151367C1.86895 0.151367 2.12344 0.256783 2.31108 0.444423L10.6036 8.73817L18.8961 0.444423C19.0837 0.256783 19.3382 0.151367 19.6036 0.151367C19.8689 0.151367 20.1234 0.256783 20.3111 0.444423C20.4987 0.632064 20.6041 0.886559 20.6041 1.15192C20.6041 1.41729 20.4987 1.67178 20.3111 1.85942L12.0173 10.1519L20.3111 18.4444Z"
      fill="currentColor"
    />
  </svg>
)

export const Wrapper: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    backgroundColor="var(--background)"
    borderRadius="8px"
    flexDirection="column"
    maxWidth="100%"
    padding={4}
    rowGap={2}
    {...restProps}
  >
    {children}
  </Flex>
)

export const Title: FC<HeadingProps> = ({ children, ...restProps }) => (
  <Heading
    as="h3"
    color="var(--title-color)"
    fontSize="14px"
    fontWeight="700"
    lineHeight="1.2"
    {...restProps}
  >
    {children}
  </Heading>
)

export const TopRow: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    columnGap={2}
    height={{ base: '42px', lg: '58px' }}
    {...restProps}
  >
    {children}
  </Flex>
)

export const Textfield: FC<InputProps> = ({ children, ...restProps }) => (
  <Input
    backgroundColor="var(--textfield-background-color)"
    borderColor="var(--textfield-border-color)"
    color="var(--textfield-color)"
    fontSize={{ base: '24px', lg: '32px' }}
    height="auto"
    minWidth="0"
    padding={{ base: 2, lg: 4 }}
    transition="border-color var({durations.slow}), color var({durations.slow}), background-color var({durations.slow})"
    type="text"
    _focus={{
      backgroundColor: 'var(--textfield-background-color-active)',
      borderColor: 'var(--textfield-border-color-active)',
      color: 'var(--textfield-color-active)',
    }}
    _placeholder={{
      color: 'var(--textfield-placeholder-color)',
    }}
    {...restProps}
  >
    {children}
  </Input>
)

export const ChevronDown = chakra(BaseChevronDown, {
  base: {
    marginLeft: 2,
  },
})

const buttonCSS = {
  alignItems: 'center',
  backgroundColor: 'var(--dropdown-button-background-color)',
  borderColor: 'var(--dropdown-button-border-color)',
  borderRadius: 4,
  color: 'var(--dropdown-button-color)',
  columnGap: 2,
  cursor: 'pointer',
  display: 'flex',
  flexShrink: 0,
  fontFamily: '{fonts.body}',
  fontSize: { base: '12px', lg: '16px' },
  fontWeight: 500,
  height: 'auto',
  minWidth: '100px',
  padding: { base: 2, lg: 4 },
  _hover: {
    backgroundColor: 'var(--dropdown-button-background-color-hover)',
    borderColor: 'var(--dropdown-button-border-color-hover)',
    color: 'var(--dropdown-button-color-hover)',
  },
  _active: {
    backgroundColor: 'var(--dropdown-button-background-color-active)',
    borderColor: 'var(--dropdown-button-border-color-active)',
    color: 'var(--dropdown-button-color-active)',
  },
}

export const DropdownButton: FC<ButtonProps> = ({ children, ...restProps }) => (
  <chakra.button
    borderStyle="solid"
    borderWidth="1px"
    {...buttonCSS}
    {...restProps}
  >
    {children}
    <ChevronDown />
  </chakra.button>
)

export const SingleToken: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    {...buttonCSS}
    cursor="default"
    _hover={{}}
    {...restProps}
  >
    {children}
  </Flex>
)

export const ErrorComponent: FC<SpanProps> = ({ children, ...restProps }) => (
  <Span
    color="{colors.danger.default}"
    fontSize="12px"
    fontWeight="700"
    padding="0"
    {...restProps}
  >
    {children}
  </Span>
)

export const BottomRow: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    columnGap={2}
    justifyContent="space-between"
    lineHeight={1.2}
    {...restProps}
  >
    {children}
  </Flex>
)

export const EstimatedUSDValue: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    alignItems="center"
    color="var(--estimated-usd-color)"
    fontSize="12px"
    fontWeight="400"
    lineHeight="1.2"
    {...restProps}
  >
    {children}
  </Flex>
)

export const Balance: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    alignItems="center"
    color="var(--balance-color)"
    columnGap={2}
    {...restProps}
  >
    {children}
  </Flex>
)

export const BalanceValue: FC<SpanProps> = ({ children, ...restProps }) => (
  <Span
    fontSize="12px"
    fontWeight="400"
    lineHeight="1.2"
    {...restProps}
  >
    {children}
  </Span>
)

export const MaxButton: FC<ButtonProps> = ({ children, ...restProps }) => (
  <chakra.button
    backgroundColor="var(--max-button-background-color)"
    borderColor="var(--max-button-border-color)"
    color="var(--max-button-color)"
    cursor="pointer"
    fontSize="12px"
    fontWeight="400"
    height="22px"
    paddingX={2}
    _hover={{
      backgroundColor: 'var(--max-button-background-color-hover)',
      borderColor: 'var(--max-button-border-color-hover)',
      color: 'var(--max-button-color-hover)',
    }}
    _active={{
      backgroundColor: 'var(--max-button-background-color-active)',
      borderColor: 'var(--max-button-border-color-active)',
      color: 'var(--max-button-color-active)',
    }}
    {...restProps}
  >
    {children}
  </chakra.button>
)

export const Icon: FC<{ $iconSize?: number } & FlexProps> = ({
  $iconSize,
  children,
  ...restProps
}) => (
  <Flex
    alignItems="center"
    borderRadius="50%"
    flexShrink="0"
    height={`${$iconSize}px`}
    justifyContent="center"
    overflow="hidden"
    width={`${$iconSize}px`}
    {...restProps}
  >
    {children}
  </Flex>
)

export const CloseButton: FC<ButtonProps> = ({ children, ...restProps }) => (
  <chakra.button
    background="none"
    border="none"
    color="var(--title-color-default)"
    cursor="pointer"
    position="absolute"
    right={0}
    top={10}
    _active={{
      opacity: 0.7,
    }}
    {...restProps}
  >
    <CloseIcon />
  </chakra.button>
)
