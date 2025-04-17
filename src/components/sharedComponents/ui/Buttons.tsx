import { Button as BaseButton, type ButtonProps } from '@chakra-ui/react'
import type { FC } from 'react'

export const Button: FC<ButtonProps> = ({ ...restProps }) => (
  <BaseButton
    borderRadius="sm"
    borderStyle="solid"
    borderWidth="1px"
    cursor="pointer"
    display="flex"
    fontFamily="var(--base-font-family)"
    fontSize="15px"
    fontWeight="400"
    gap={2}
    height={9}
    justifyContent="center"
    lineHeight="1"
    outline="none"
    paddingY={0}
    paddingX={4}
    textDecoration="none"
    transition="background-color var(--base-transition-duration-sm), border-color var(--base-transition-duration-sm), color var(--base-transition-duration-sm)"
    userSelect="none"
    whiteSpace="nowrap"
    _disabled={{
      cursor: 'not-allowed',
      opacity: 0.6,
    }}
    _active={{
      opacity: 0.8,
    }}
    type="button"
    {...restProps}
  />
)

export const PrimaryButton: FC<ButtonProps> = ({ ...restProps }) => (
  <Button
    backgroundColor="var(--theme-button-primary-background-color)"
    borderColor="var(--theme-button-primary-border-color)"
    color="var(--theme-button-primary-color)"
    _hover={{
      backgroundColor: 'var(--theme-button-primary-background-color-hover)',
      borderColor: 'var(--theme-button-primary-border-color-hover)',
      color: 'var(--theme-button-primary-color-hover)',
    }}
    _disabled={{
      backgroundColor: 'var(--theme-button-primary-background-color-disabled)',
      borderColor: 'var(--theme-button-primary-border-color-disabled)',
      color: 'var(--theme-button-primary-color-disabled)',
    }}
    fontWeight={500}
    {...restProps}
  />
)

export const SecondaryButton: FC<ButtonProps> = ({ ...restProps }) => (
  <Button
    backgroundColor="var(--theme-button-secondary-background-color)"
    borderColor="var(--theme-button-secondary-border-color)"
    color="var(--theme-button-secondary-color)"
    _hover={{
      backgroundColor: 'var(--theme-button-secondary-background-color-hover)',
      borderColor: 'var(--theme-button-secondary-border-color-hover)',
      color: 'var(--theme-button-secondary-color-hover)',
    }}
    _disabled={{
      backgroundColor: 'var(--theme-button-secondary-background-color-disabled)',
      borderColor: 'var(--theme-button-secondary-border-color-disabled)',
      color: 'var(--theme-button-secondary-color-disabled)',
    }}
    fontWeight={500}
    {...restProps}
  />
)
