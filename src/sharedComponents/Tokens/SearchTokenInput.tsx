import { type ChangeEvent, type FC } from 'react'

type SearchInputProps = {
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  searchTerm: string
}

const SearchTokenInput: FC<SearchInputProps> = ({
  onSearchChange,
  placeholder = 'search...',
  searchTerm,
}) => <input onChange={onSearchChange} placeholder={placeholder} type="text" value={searchTerm} />

export default SearchTokenInput
