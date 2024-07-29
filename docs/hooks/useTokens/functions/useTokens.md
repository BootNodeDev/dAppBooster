[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [hooks/useTokens](../README.md) / useTokens

# Function: useTokens()

> **useTokens**(`params`): `object`

Custom hook for fetching and managing tokens data. It fetches tokens data and optionally token balances.

## Parameters

• **params** = `...`

Params for fetching tokens data.

• **params.account?**: \`0x$\{string\}\`

The account address for which to fetch token balances. If not specified,
 the connected account will be used.

• **params.withBalance?**: `boolean`

Whether to fetch token balances or not. Defaults to true.

## Returns

`object`

An object containing tokens data and loading state.

### isLoadingBalances

> **isLoadingBalances**: `boolean`

### tokens

> **tokens**: `object`[]

### tokensByChainId

> **tokensByChainId**: `object`

#### Index Signature

 \[`chainId`: `Token`\[`"chainId"`\]\]: `any`[]

## Defined in

[src/hooks/useTokens.ts:39](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/hooks/useTokens.ts#L39)
