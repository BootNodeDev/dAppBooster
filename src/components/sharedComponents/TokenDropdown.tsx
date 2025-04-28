import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import TokenSelect, { type TokenSelectProps } from '@/src/components/sharedComponents/TokenSelect'
import DropdownButton from '@/src/components/sharedComponents/ui/DropdownButton'
import type { Token } from '@/src/types/token'
import { Flex, Menu, Portal } from '@chakra-ui/react'
import type { ComponentPropsWithoutRef, FC } from 'react'
import { useState } from 'react'

export interface TokenDropdownProps extends TokenSelectProps {
  currentToken?: Token | undefined
  iconSize?: number
}

/** @ignore */
type Props = ComponentPropsWithoutRef<'span'> & TokenDropdownProps

/**
 * A dropdown component that allows users to select a token
 *
 * @param {object} props - TokenDropdown component props.
 * @param {Token} [props.currentToken=undefined] - The current token. Default is undefined.
 * @param {number} [props.iconSize=24] - The size of the token icon. Default is 24.
 * @param {number} [props.currentNetworkId=mainnet.id] - The current network id. Default is mainnet's id.
 * @param {function} props.onTokenSelect - Callback function to be called when a token is selected.
 * @param {Networks} [props.networks] - Optional list of networks to display in the dropdown. The dropdown won't show up if undefined. Default is undefined.
 * @param {string} [props.placeholder='Search by name or address'] - Optional placeholder text for the search input. Default is 'Search by name or address'.
 * @param {number} [props.containerHeight=320] - Optional height of the virtualized tokens list. Default is 320.
 * @param {number} [props.iconSize=32] - Optional size of the token icon in the list. Default is 32.
 * @param {number} [props.itemHeight=64] - Optional height of each item in the list. Default is 64.
 * @param {boolean} [props.showAddTokenButton=false] - Optional flag to allow adding a token. Default is false.
 * @param {boolean} [props.showBalance=false] - Optional flag to show the token balance in the list. Default is false.
 * @param {boolean} [props.showTopTokens=false] - Optional flag to show the top tokens in the list. Default is false.
 */
const TokenDropdown: FC<Props> = ({
  className,
  currentToken,
  iconSize = 24,
  onTokenSelect,
  showAddTokenButton,
  style,
  ...restProps
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Handle token selection and close the dropdown
   * @param {Token} [token=undefined] - The selected token. Default is undefined.
   */
  const handleTokenSelect = (token: Token | undefined) => {
    onTokenSelect(token)
    setIsOpen(false)
  }

  return (
    <Menu.Root
      open={isOpen}
      onOpenChange={(state) => setIsOpen(state.open)}
      positioning={{ placement: 'bottom-end' }}
    >
      <Menu.Trigger asChild>
        <DropdownButton>
          {currentToken ? (
            <>
              <Flex
                alignItems="center"
                borderRadius="50%"
                display="flex"
                height={`${iconSize}px`}
                justifyContent="center"
                overflow="hidden"
                width={`${iconSize}px"`}
              >
                <TokenLogo
                  size={iconSize}
                  token={currentToken}
                />
              </Flex>
              {currentToken.symbol}
            </>
          ) : (
            'Select token'
          )}
        </DropdownButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            padding="0"
            backgroundColor="var(--theme-dropdown-background-color)"
            borderColor="var(--theme-dropdown-border-color)"
            boxShadow="var(--theme-dropdown-box-shadow)"
          >
            <TokenSelect
              onTokenSelect={handleTokenSelect}
              showAddTokenButton={showAddTokenButton}
              {...restProps}
            />
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default TokenDropdown
