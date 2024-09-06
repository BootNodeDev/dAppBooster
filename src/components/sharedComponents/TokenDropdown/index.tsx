import { type FC, type KeyboardEvent, type ComponentPropsWithoutRef } from 'react'
import styled, { css } from 'styled-components'

import { useDropdown, breakpointMediaQuery } from '@bootnodedev/db-ui-toolkit'

import DropdownButton from '@/src/components/sharedComponents/DropdownButton'
import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import TokenSelect, { type TokenSelectProps } from '@/src/components/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'

const Wrapper = styled.span`
  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      .dbuitkDropdownItems {
        /**
        * Hack-ish way to make the dropdown items appear on the right side of the button
        * and avoid the dropdown to be cut off by the screen edge
        *
        * Should be fixed when / if the dropdown component supports auto positioning in the future
        */
        left: auto;
        right: 0;
        transform: none;
      }
    `,
  )}
`

const Icon = styled.div<{ iconSize?: number }>`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${({ iconSize }) => iconSize}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ iconSize }) => iconSize}px;
`

export interface TokenDropdownProps extends TokenSelectProps {
  currentToken?: Token | undefined
  iconSize?: number
}

/** @ignore */
type Props = ComponentPropsWithoutRef<'div'> & TokenDropdownProps

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
  ...restProps
}: Props) => {
  const { Dropdown, close } = useDropdown()

  /**
   * Handle token selection and close the dropdown
   * @param {Token} [token=undefined] - The selected token. Default is undefined.
   */
  const handleTokenSelect = (token: Token | undefined) => {
    onTokenSelect(token)
    close('token-dropdown')
  }

  return (
    <Wrapper>
      <Dropdown
        button={
          <DropdownButton>
            {currentToken ? (
              <>
                <Icon>
                  <TokenLogo size={iconSize} token={currentToken} />
                </Icon>
                {currentToken.symbol}
              </>
            ) : (
              'Select token'
            )}
          </DropdownButton>
        }
        className={`${className ? className : ''} tokenDropdown`}
        closeOnClick={false}
        id="token-dropdown"
        items={
          <TokenSelect
            onTokenSelect={handleTokenSelect}
            showAddTokenButton={showAddTokenButton}
            {...restProps}
          />
        }
        onKeyUp={(e: KeyboardEvent<HTMLElement>) => {
          if (e.key === 'Escape') {
            close('token-dropdown')
          }
        }}
        position="center"
      />
    </Wrapper>
  )
}

export default TokenDropdown
