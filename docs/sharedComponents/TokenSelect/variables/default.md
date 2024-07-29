[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [sharedComponents/TokenSelect](../README.md) / default

# Variable: default

> `const` **default**: `ComponentType`\<`Props` & `WithSuspenseAndRetryProps`\>

TokenSelect component, used to search and select a token from a list.

## Param

The current network id. Default is mainnet's id.

## Param

Callback function to be called when a token is selected.

## Param

Optional list of networks to display in the dropdown. The dropdown won't show up if undefined. Default is undefined.

## Param

Optional placeholder text for the search input. Default is 'Search by name or address'.

## Param

Optional height of the virtualized tokens list. Default is 320.

## Param

Optional size of the token icon in the list. Default is 32.

## Param

Optional height of each item in the list. Default is 64.

## Param

Optional flag to allow adding a token. Default is false.

## Param

Optional flag to show the token balance in the list. Default is false.

## Param

Optional flag to allow adding or switching networks. Default is false.

## Param

Optional flag to show the top tokens in the list. Default is false.

Individual CSS classes are available for deep styling of individual components within TokenSelect:

Also theme CSS vars are available for cosmetic changes:

Title:
* --theme-token-select-title-color

Main container:
* --theme-token-select-background-color (defaults to --theme-card-background-color)
* --theme-token-select-border-color (defaults to --theme-card-border-color)
* --theme-token-select-box-shadow (defaults to --theme-card-box-shadow)

Search field:
* --theme-token-select-search-field-color
* --theme-token-select-search-field-color-active
* --theme-token-select-search-field-background-color
* --theme-token-select-search-field-background-color-active
* --theme-token-select-search-field-placeholder-color
* --theme-token-select-search-field-box-shadow
* --theme-token-select-search-field-box-shadow-active
* --theme-token-select-search-field-border-color
* --theme-token-select-search-field-border-color-active

Network select button:
* --theme-token-select-network-button-color
* --theme-token-select-network-button-color-hover
* --theme-token-select-network-button-background-color
* --theme-token-select-network-button-background-color-hover

Top tokens:
* --theme-token-select-top-token-item-color
* --theme-token-select-top-token-item-color-hover
* --theme-token-select-top-token-item-background-color
* --theme-token-select-top-token-item-background-color-hover
* --theme-token-select-top-token-item-border-color
* --theme-token-select-top-token-item-border-color-hover

List:
* --theme-token-select-list-border-top-color

List item:
* --theme-token-select-row-background-color
* --theme-token-select-row-background-color-hover
* --theme-token-select-row-token-name-color
* --theme-token-select-row-token-name-color-hover
* --theme-token-select-row-token-balance-color
* --theme-token-select-row-token-balance-color-hover
* --theme-token-select-row-token-value-color
* --theme-token-select-row-token-value-color-hover

## Defined in

[src/sharedComponents/TokenSelect/index.tsx:147](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/TokenSelect/index.tsx#L147)
