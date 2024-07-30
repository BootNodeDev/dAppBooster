import { type HTMLAttributes, type Dispatch, type SetStateAction, type FC } from 'react'
import styled from 'styled-components'

import { Dropdown, Item as BaseItem } from 'db-ui-toolkit'

import { type Networks } from '@/src/sharedComponents/TokenSelect'
import SearchInput from '@/src/sharedComponents/TokenSelect/Search/Input'
import NetworkButton from '@/src/sharedComponents/TokenSelect/Search/NetworkButton'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectSearchWrapper' }) => ({ className }))`
  display: flex;
  column-gap: var(--base-gap);
  height: 72px;
  padding: 0 var(--base-token-select-horizontal-padding);

  .dbuitkDropdownButton {
    height: 100%;
  }
`

const Item = styled(BaseItem)`
  font-size: 1.6rem;
  min-height: 48px;
  width: 250px;
`

interface SearchProps extends HTMLAttributes<HTMLDivElement> {
  currentNetworkId: number
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
 * @param {Networks} [props.networks] - Optional list of networks to display in the dropdown.
 * @param {string} [props.placeholder] - Optional placeholder text for the search input.
 * @param {string} props.searchTerm - The current search term.
 * @param {Function} props.setSearchTerm - Callback function to set the search term.
 */
const Search: FC<SearchProps> = ({
  currentNetworkId,
  networks,
  placeholder,
  searchTerm,
  setSearchTerm,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <SearchInput
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        value={searchTerm}
      />
      {networks && networks.length > 1 && (
        <Dropdown
          button={
            <NetworkButton>
              {networks.find((item) => item.id === currentNetworkId)?.icon}
            </NetworkButton>
          }
          items={networks.map(({ icon, id, label, onClick }) => (
            <Item key={id} onClick={onClick}>
              {icon}
              {label}
            </Item>
          ))}
          position="right"
        />
      )}
    </Wrapper>
  )
}

export default Search
