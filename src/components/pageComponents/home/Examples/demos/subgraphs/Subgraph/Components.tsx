import {
  Box,
  type BoxProps,
  Flex,
  type FlexProps,
  Heading,
  type HeadingProps,
} from '@chakra-ui/react'
import type { FC } from 'react'

export const Wrapper: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    backgroundColor="var(--theme-subgraph-background)"
    borderRadius="8px"
    padding={4}
    counterReset="item-number"
    flexDirection="column"
    rowGap={1}
    {...restProps}
  >
    {children}
  </Flex>
)

export const Title: FC<HeadingProps> = ({ children, ...restProps }) => (
  <Heading
    alignItems="center"
    as="h3"
    color="var(--theme-subgraph-title-color)"
    columnGap={2}
    display="flex"
    fontFamily="{fonts.body}"
    fontSize="16px"
    fontWeight="700"
    lineHeight="1.2"
    margin="0"
    paddingTop={2}
    paddingBottom={4}
    {...restProps}
  >
    {children}
  </Heading>
)

export const Row: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    alignItems="center"
    color="var(--theme-subgraph-name-color)"
    columnGap={2}
    borderRadius={4}
    padding={2}
    marginInline={-2}
    display="flex"
    justifyContent="space-between"
    _hover={{ bg: 'var(--theme-subgraph-row-hover-background)' }}
    {...restProps}
  >
    {children}
  </Flex>
)

export const RowTitle: FC<BoxProps> = ({ children, ...restProps }) => (
  <Box
    fontSize="16px"
    fontWeight="400"
    lineHeight="1.2"
    overflow="hidden"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    alignItems="center"
    columnGap={2}
    display="flex"
    {...restProps}
    _before={{
      '--base-size': '32px',
      alignItems: 'center',
      backgroundColor: 'var(--theme-subgraph-bullet-background-color)',
      borderRadius: '50%',
      color: 'var(--theme-subgraph-bullet-color)',
      content: 'counter(item-number, decimal-leading-zero)',
      counterIncrement: 'item-number',
      display: 'flex',
      flexShrink: '0',
      fontSize: '10px',
      fontWeight: '400',
      height: 'var(--base-size)',
      justifyContent: 'center',
      letterSpacing: '-1px',
      lineHeight: '1',
      paddingRight: '1px',
      width: 'var(--base-size)',
      opacity: 0.6,
    }}
  >
    {children}
  </Box>
)

export const RowName: FC<BoxProps> = ({ children, ...restProps }) => (
  <Box
    overflow="hidden"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    {...restProps}
  >
    {children}
  </Box>
)

export const RowActions: FC<BoxProps> = ({ children, ...restProps }) => (
  <Box
    display="flex"
    alignItems="center"
    columnGap={2}
    {...restProps}
  >
    {children}
  </Box>
)
