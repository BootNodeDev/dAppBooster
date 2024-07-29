[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [hooks/useTokenSearch](../README.md) / useTokenSearch

# Function: useTokenSearch()

> **useTokenSearch**(`tokens`, `deps`): `TokenSearch`

A hook that provides a performant search to filter a list of tokens by a searchTerm
Internally it uses React's `useDeferredValue`

## Parameters

• **tokens**: `object`[]

a list of tokens to be filtered by `searchTerm`

• **deps**: `DependencyList` = `[]`

array of dependencies that trigger recalculation of the search

## Returns

`TokenSearch`

Object containing searchResult, searchTerm, and setSearchTerm

## Defined in

[src/hooks/useTokenSearch.ts:26](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/hooks/useTokenSearch.ts#L26)
