import { Input as BaseInput, Flex, type InputProps } from '@chakra-ui/react'
import type { FC } from 'react'

const SearchIcon = () => (
  <svg
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Chevron down</title>
    <path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M21 21L16.65 16.65"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

/**
 * A search input with a search icon
 */
const Input: FC<InputProps> = ({ className, ...inputProps }) => {
  return (
    <Flex
      alignItems="center"
      backgroundColor="var(--search-field-background-color)"
      borderColor="var(--search-field-border-color)"
      borderRadius={8}
      borderStyle="solid"
      borderWidth="1px"
      color="var(--search-field-color)"
      columnGap={4}
      display="flex"
      flexGrow={1}
      fontSize={{ base: '24px', lg: '32px' }}
      height="auto"
      minWidth={0}
      paddingX={4}
      paddingY={0}
      transition="border-color var({durations.slow}), color var({durations.slow}), background-color var({durations.slow})"
      _focusWithin={{
        backgroundColor: 'var(--search-field-background-color-active)',
        borderColor: 'var(--search-field-border-color-active, var(--border-color-active))',
        color: 'var(--search-field-color-active)',
        boxShadow: 'var(--search-field-box-shadow-active, var(--box-shadow-active))',
      }}
      className={`${className ? className : ''}`.trim()}
    >
      <SearchIcon />
      <BaseInput
        border="none"
        fontSize="16px"
        padding="0"
        type="text"
        width="100%"
        _active={{
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
        }}
        _hover={{
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
        }}
        _focus={{
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
        }}
        _placeholder={{
          color: 'var(--search-field-placeholder-color)',
        }}
        {...inputProps}
      />
    </Flex>
  )
}

export default Input
