[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [hooks/useTokenLists](../README.md) / useTokenLists

# Function: useTokenLists()

> **useTokenLists**(): [`TokensMap`](../../../utils/tokenListsCache/type-aliases/TokensMap.md)

Loads the list of tokens provided by config
 - Filters out the repeated ones (checks by chain-address pair)
 - Discards those that do not complain with tokenSchema

## Returns

[`TokensMap`](../../../utils/tokenListsCache/type-aliases/TokensMap.md)

list of tokens, tokens grouped by chainId, and symbol->chainId

## Dev

intended to be used with `Suspense` wrapper around this hook as it's using `useSuspenseQueries`

## Defined in

[src/hooks/useTokenLists.ts:26](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/hooks/useTokenLists.ts#L26)
