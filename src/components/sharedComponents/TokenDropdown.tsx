import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import TokenSelect, { type TokenSelectProps } from '@/src/components/sharedComponents/TokenSelect'
import DropdownButton from '@/src/components/sharedComponents/ui/DropdownButton'
import { MenuContent } from '@/src/components/sharedComponents/ui/Menu'
import type { Token } from '@/src/types/token'
import { Flex, Menu } from '@chakra-ui/react'
import type { ComponentPropsWithoutRef, FC } from 'react'
import { useState } from 'react'

export interface TokenDropdownProps extends TokenSelectProps {
  currentToken?: Token | undefined
  iconSize?: number
}

/** @ignore */
type Props = ComponentPropsWithoutRef<'span'> & TokenDropdownProps

/**
 * A dropdown component that allows users to select a token.
 *
 * @param {TokenDropdownProps & ComponentPropsWithoutRef<'span'>} props - TokenDropdown component props.
 * @param {Token} [props.currentToken] - The currently selected token.
 * @param {number} [props.iconSize=24] - The size of the token icon in the dropdown button.
 * @param {(token: Token | undefined) => void} props.onTokenSelect - Callback function called when a token is selected.
 * @param {boolean} [props.showAddTokenButton] - Whether to show a button to add a custom token.
 * @param {number} [props.currentNetworkId] - The current network id to filter tokens.
 * @param {Networks} [props.networks] - List of networks to display in the dropdown.
 * @param {string} [props.placeholder] - Placeholder text for the search input.
 * @param {number} [props.containerHeight] - Height of the virtualized tokens list.
 * @param {number} [props.itemHeight] - Height of each item in the tokens list.
 * @param {boolean} [props.showBalance] - Whether to show the token balance in the list.
 * @param {boolean} [props.showTopTokens] - Whether to show the top tokens section in the list.
 * @param {ComponentPropsWithoutRef<'span'>} props.restProps - Additional props for the span element.
 *
 * @example
 * ```tsx
 * <TokenDropdown
 *   currentToken={daiToken}
 *   onTokenSelect={(token) => setSelectedToken(token)}
 *   showAddTokenButton={true}
 *   showBalance={true}
 * />
 * ```
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
      positioning={{ placement: 'bottom' }}
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
      <Menu.Positioner
        display="flex"
        flexDirection="column"
        alignItems="stretch"
      >
        <MenuContent
          scrollbar={'hidden'}
          minWidth="auto"
        >
          <TokenSelect
            onTokenSelect={handleTokenSelect}
            showAddTokenButton={showAddTokenButton}
            spinnerSize="sm"
            {...restProps}
          />
        </MenuContent>
      </Menu.Positioner>
    </Menu.Root>
  )
}

export default TokenDropdown
