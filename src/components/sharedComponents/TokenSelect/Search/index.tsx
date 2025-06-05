import SearchInput from '@/src/components/sharedComponents/TokenSelect/Search/Input'
import NetworkButton from '@/src/components/sharedComponents/TokenSelect/Search/NetworkButton'
import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import { MenuContent, MenuItem } from '@/src/components/sharedComponents/ui/Menu'
import { Box, Flex, type FlexProps, Menu } from '@chakra-ui/react'
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
}: SearchProps) => {
  return (
    <Flex
      columnGap={2}
      height="54px"
      paddingX={4}
      paddingY={0}
      flexShrink={0}
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
              <Box
                rounded="full"
                overflow="hidden"
              >
                {networks.find((item) => item.id === currentNetworkId)?.icon}
              </Box>
            </NetworkButton>
          </Menu.Trigger>
          <Menu.Positioner>
            <MenuContent width="250px">
              {networks.map(({ icon, id, label, onClick }) => (
                <MenuItem
                  key={id}
                  onClick={onClick}
                  value={label}
                >
                  <Box
                    rounded="full"
                    overflow="hidden"
                  >
                    {icon}
                  </Box>
                  {label}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu.Positioner>
        </Menu.Root>
      )}
    </Flex>
  )
}

export default Search
