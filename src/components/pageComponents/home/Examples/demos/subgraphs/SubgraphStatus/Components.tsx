import {
  Box,
  type BoxProps,
  Flex,
  type FlexProps,
  Heading,
  type HeadingProps,
  Span,
  type SpanProps,
} from '@chakra-ui/react'
import type { FC } from 'react'

export const Wrapper: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    backgroundColor="var(--theme-subgraph-status-background)"
    borderRadius="lg"
    padding={4}
    flexDirection="column"
    rowGap={2}
    width="100%"
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
    fontSize="16px"
    fontWeight="700"
    lineHeight="1.2"
    margin="0"
    paddingBottom={4}
    paddingTop={2}
    {...restProps}
  >
    {children}
  </Heading>
)

export const SubTitle: FC<HeadingProps> = ({ children, ...restProps }) => (
  <Heading
    as="h4"
    fontSize="13px"
    fontWeight="500"
    lineHeight="1.2"
    {...restProps}
  >
    {children}
  </Heading>
)
export const Blocks: FC<SpanProps> = ({ children, ...restProps }) => (
  <Span
    fontSize="12px"
    fontWeight="300"
    lineHeight="1"
    {...restProps}
  >
    {children}
  </Span>
)

export const BlocksBehind: FC<BoxProps> = ({ children, ...restProps }) => (
  <Box
    fontSize="xs"
    paddingInline={2}
    lineHeight="2"
    borderRadius={8}
    {...restProps}
  >
    {children}
  </Box>
)
