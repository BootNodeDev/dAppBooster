[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [sharedComponents/TokenInput](../README.md) / default

# Function: default()

> **default**(`props`, `deprecatedLegacyContext`?): `ReactNode`

TokenInput component allows users to input token amounts and select tokens from a list.
It displays the token input field, token balance, and a dropdown list of available tokens.

## Parameters

• **props**: `Props`

The props for the TokenSelect component.

Individual CSS classes are available for deep styling of individual components within TokenSelect:

Also theme CSS vars are available for cosmetic changes:

Main wrapper:
* --theme-token-input-background
* --base-token-input-border-radius
* --base-token-input-padding
* --base-token-input-gap

Title
* --theme-token-input-title-color

Textfield:
* --theme-token-input-textfield-background-color
* --theme-token-input-textfield-background-color-active
* --theme-token-input-textfield-border-color
* --theme-token-input-textfield-border-color-active
* --theme-token-input-textfield-color
* --theme-token-input-textfield-color-active
* --theme-token-input-textfield-placeholder-color
* --base-token-input-texfield-height
* --base-token-input-texfield-font-size

Dropdown button:
* --theme-token-input-dropdown-button-background-color
* --theme-token-input-dropdown-button-background-color-hover
* --theme-token-input-dropdown-button-border-color
* --theme-token-input-dropdown-button-border-color-hover
* --theme-token-input-dropdown-button-border-color-active
* --theme-token-input-dropdown-button-color
* --theme-token-input-dropdown-button-color-hover

Max Button:
* --theme-token-input-max-button-background-color
* --theme-token-input-max-button-background-color-hover
* --theme-token-input-max-button-border-color
* --theme-token-input-max-button-border-color-hover
* --theme-token-input-max-button-border-color-active
* --theme-token-input-max-button-color
* --theme-token-input-max-button-color-hover

Estimated USD Value
* --theme-token-input-estimated-usd-color

Balance
*--theme-token-input-balance-color

• **deprecatedLegacyContext?**: `any`

**Deprecated**

**See**

[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods)

## Returns

`ReactNode`

## Defined in

[src/sharedComponents/TokenInput/index.tsx:106](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/TokenInput/index.tsx#L106)
