[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [hooks/useErc20Balance](../README.md) / useErc20Balance

# Function: useErc20Balance()

> **useErc20Balance**(`params`): `Erc20Balance`

Custom hook to fetch the ERC20 token balance for a given Token address.

## Parameters

• **params**

The params object.

• **params.address?**: \`0x$\{string\}\`

The address for which to fetch the balance.

• **params.token?**

The ERC20 token object.

• **params.token.address**: `string`

• **params.token.chainId**: `number` = `...`

• **params.token.decimals**: `number` = `...`

• **params.token.extensions?**: `Record`\<`string`, `undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| `Record`\<`string`, `undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| `Record`\<`string`, `undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean`\>\>\> = `...`

• **params.token.logoURI?**: `string` = `...`

• **params.token.name**: `string` = `...`

• **params.token.symbol**: `string` = `...`

## Returns

`Erc20Balance`

The ERC20 token balance, error, and loading state.

## Defined in

[src/hooks/useErc20Balance.ts:21](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/hooks/useErc20Balance.ts#L21)
