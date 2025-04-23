import SearchInput from '@/src/components/sharedComponents/TokenSelect/Search/Input'
import NetworkButton from '@/src/components/sharedComponents/TokenSelect/Search/NetworkButton'
import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import { Flex, type FlexProps, Menu } from '@chakra-ui/react'
import type { Dispatch, FC, SetStateAction } from 'react'

interface SearchProps extends FlexProps {
  currentNetworkId: number
  disabled?: boolean
  networks?: Networks
  placeholder?: string
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
}

/**
 * Search component for TokenSelect. Includes a search input and a networks dropdown.
 *
 * @param {SearchProps} props - Search component props.
 * @param {number} props.currentNetworkId - The current network id.
 * @param {boolean} [props.disabled] - Optional flag to disable the search input.
 * @param {Networks} [props.networks] - Optional list of networks to display in the dropdown.
 * @param {string} [props.placeholder] - Optional placeholder text for the search input.
 * @param {string} props.searchTerm - The current search term.
 * @param {Function} props.setSearchTerm - Callback function to set the search term.
 */
const Search: FC<SearchProps> = ({
  currentNetworkId,
  disabled,
  networks,
  placeholder,
  searchTerm,
  setSearchTerm,
  ...restProps
}) => {
  return (
    <Flex
      columnGap={2}
      height="72px"
      paddingX={4}
      paddingY={0}
      css={{
        '.dbuitkDropdownButton': {
          height: '100%',
        },
      }}
      {...restProps}
    >
      <SearchInput
        disabled={disabled}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        value={searchTerm}
      />
      {networks && networks.length > 1 && (
        <Menu.Root positioning={{ placement: 'bottom-end' }}>
          <Menu.Trigger asChild>
            <NetworkButton>
              {networks.find((item) => item.id === currentNetworkId)?.icon}
            </NetworkButton>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content
              padding="0"
              backgroundColor="var(--theme-dropdown-background-color)"
              borderColor="var(--theme-dropdown-border-color)"
              boxShadow="var(--theme-dropdown-box-shadow)"
              width="250px"
            >
              {networks.map(({ icon, id, label, onClick }) => (
                <Menu.Item
                  backgroundColor="var(--theme-dropdown-item-background-color)"
                  borderBottom="1px solid var( --theme-dropdown-item-border-color)"
                  color="var(--theme-dropdown-item-color)"
                  cursor="pointer"
                  fontSize="16px"
                  key={id}
                  minHeight="48px"
                  onClick={onClick}
                  transition="background-color var(--base-transition-duration-xs) ease-in-out"
                  value={label}
                  width="250px"
                  _hover={{
                    backgroundColor: 'var(--theme-dropdown-item-background-color-hover)',
                    color: 'var(--theme-dropdown-item-color-hover)',
                    borderBottom: '1px solid var( --theme-dropdown-item-border-color-hover)',
                  }}
                  _active={{
                    backgroundColor: 'var(--theme-dropdown-item-background-color-active)',
                    color: 'var(--theme-dropdown-item-color-active)',
                    borderBottom: '1px solid var( --theme-dropdown-item-border-color-active)',
                  }}
                >
                  {icon}
                  {label}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      )}
    </Flex>
  )
}

export default Search
