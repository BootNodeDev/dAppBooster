import { Box, type BoxProps, Menu, chakra } from '@chakra-ui/react'
import { type FC, useState } from 'react'
import { buttonStyles, dropdownStyles } from './styles'

const ChevronDown = ({ ...restProps }) => (
  <svg
    fill="none"
    height="7"
    viewBox="0 0 12 7"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Icon</title>
    <path
      d="M11.3538 1.53372L6.35378 6.53372C6.30735 6.5802 6.2522 6.61708 6.1915 6.64225C6.13081 6.66741 6.06574 6.68036 6.00003 6.68036C5.93433 6.68036 5.86926 6.66741 5.80856 6.64225C5.74786 6.61708 5.69272 6.5802 5.64628 6.53372L0.646284 1.53372C0.552464 1.4399 0.499756 1.31265 0.499756 1.17997C0.499756 1.04728 0.552464 0.920036 0.646284 0.826215C0.740104 0.732395 0.867352 0.679688 1.00003 0.679688C1.13272 0.679688 1.25996 0.732395 1.35378 0.826215L6.00003 5.47309L10.6463 0.826215C10.6927 0.77976 10.7479 0.74291 10.8086 0.717769C10.8693 0.692627 10.9343 0.679688 11 0.679688C11.0657 0.679688 11.1308 0.692627 11.1915 0.717769C11.2522 0.74291 11.3073 0.77976 11.3538 0.826215C11.4002 0.87267 11.4371 0.927821 11.4622 0.988517C11.4874 1.04921 11.5003 1.11427 11.5003 1.17997C11.5003 1.24566 11.4874 1.31072 11.4622 1.37141C11.4371 1.43211 11.4002 1.48726 11.3538 1.53372Z"
      fill="currentColor"
    />
  </svg>
)

interface Item {
  label: string
  onClick?: () => void
}

export const OptionsDropdown: FC<
  {
    placeholder?: string
    items: Array<Item>
    currentItem?: string
  } & BoxProps
> = ({ items, placeholder }) => {
  const [currentItem, setCurrentItem] = useState('')

  return (
    <Box
      css={{
        ...buttonStyles,
      }}
      position="absolute"
      right={2}
      top="10px"
    >
      <Menu.Root positioning={{ placement: 'bottom-end' }}>
        <Menu.Trigger asChild>
          <chakra.button
            alignItems="center"
            backgroundColor="var(--theme-button-options-background-color)"
            borderColor="var(--theme-button-options-border-color)"
            borderRadius={5}
            borderStyle="solid"
            borderWidth="1px"
            color="var(--theme-button-options-color)"
            columnGap={1}
            cursor="pointer"
            display="flex"
            fontSize="12px"
            fontWeight="500"
            height="27px"
            paddingX={2}
            paddingY={0}
            transition="border-color {durations.moderate}, background-color {durations.moderate}, color {durations.moderate"
            _hover={{
              backgroundColor: 'var(--theme-button-options-background-color-hover)',
              borderColor: 'var(--theme-button-options-border-color-hover)',
              color: 'var(--theme-button-options-color-hover)',
            }}
            _disabled={{
              backgroundColor: 'var(--theme-button-options-background-color-disabled)',
              borderColor: 'var(--theme-button-options-border-color-disabled)',
              color: 'var(--theme-button-options-color-disabled)',
            }}
          >
            {placeholder
              ? placeholder
              : currentItem
                ? items.find(({ label }) => label === currentItem)?.label
                : items[0].label}
            <ChevronDown />
          </chakra.button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content
            css={{ ...dropdownStyles }}
            padding={0}
          >
            {items.map(({ label, onClick }) => (
              <Menu.Item
                backgroundColor="var(--theme-dropdown-item-background-color)"
                borderBottom="1px solid var( --theme-dropdown-item-border-color)"
                color="var(--theme-dropdown-item-color)"
                cursor="pointer"
                key={label}
                onClick={() => {
                  if (onClick) {
                    onClick()
                  }
                  setCurrentItem(label)
                }}
                value={label}
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
                _last={{
                  border: 'none',
                  _active: {
                    border: 'none',
                  },
                  _hover: {
                    border: 'none',
                  },
                }}
              >
                {label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </Box>
  )
}

export default OptionsDropdown
