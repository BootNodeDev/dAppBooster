import { useState, useRef, KeyboardEvent } from 'react'
import styled from 'styled-components'

import { Dropdown, DropdownExposedMethods } from 'db-ui-toolkit'
import { arbitrum, mainnet, polygon } from 'viem/chains'

import Arbitrum from '@/src/pageComponents/home/Examples/demos/TokenDropdown/assets/Arbitrum'
import Eth from '@/src/pageComponents/home/Examples/demos/TokenDropdown/assets/Eth'
import Polygon from '@/src/pageComponents/home/Examples/demos/TokenDropdown/assets/Polygon'
import DropdownButton from '@/src/sharedComponents/DropdownButton'
import TokenLogo from '@/src/sharedComponents/TokenLogo'
import TokenSelect, { type NetworksList } from '@/src/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'

const ICON_SIZE = 24

const Icon = styled.div`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${ICON_SIZE}px;
  justify-content: center;
  overflow: hidden;
  width: ${ICON_SIZE}px;
`

const TokenDropdown: React.FC = ({ ...restProps }) => {
  const [currentNetworkId, setCurrentNetworkId] = useState<number>(mainnet.id)
  const [currentToken, setCurrentToken] = useState<Token | undefined>()
  const networksList: NetworksList = [
    {
      icon: <Eth />,
      id: mainnet.id,
      label: mainnet.name,
      onClick: () => setCurrentNetworkId(mainnet.id),
    },
    {
      icon: <Arbitrum />,
      id: arbitrum.id,
      label: arbitrum.name,
      onClick: () => setCurrentNetworkId(arbitrum.id),
    },
    {
      icon: <Polygon />,
      id: polygon.id,
      label: polygon.name,
      onClick: () => setCurrentNetworkId(polygon.id),
    },
  ]

  const dropdownRef = useRef<DropdownExposedMethods>(null)

  const handleCloseDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.closeDropdown()
    }
  }

  const onTokenSelect = (token: Token | undefined) => {
    setCurrentToken(token)
    handleCloseDropdown()
  }

  return (
    <Dropdown
      button={
        <DropdownButton>
          {currentToken ? (
            <>
              <Icon>
                <TokenLogo size={ICON_SIZE} token={currentToken} />
              </Icon>
              {currentToken.symbol}
            </>
          ) : (
            'Select token'
          )}
        </DropdownButton>
      }
      closeOnClick={false}
      items={
        <TokenSelect
          currentNetworkId={currentNetworkId}
          networksList={networksList}
          onTokenSelect={onTokenSelect}
          showBalance
          showTopTokens
          showValue
          {...restProps}
        />
      }
      onKeyUp={(e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape') {
          handleCloseDropdown()
        }
      }}
      position="right"
      ref={dropdownRef}
    />
  )
}

export default TokenDropdown
