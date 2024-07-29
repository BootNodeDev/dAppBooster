[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [hooks/useSubgraphIndexingStatus](../README.md) / useSubgraphIndexingStatus

# Function: useSubgraphIndexingStatus()

> **useSubgraphIndexingStatus**(`params`): `object`

Custom hook to get the indexing status of a subgraph.
Uses the network block number to determine if the subgraph is synced.

## Parameters

• **params**

The params object.

• **params.chain**: `Chain`

The chain object.

• **params.resource**: `string`

The resource string. To understand the format, see `parseResourceIds` in `src/subgraphs/utils/schemas.ts`.

## Returns

`object`

- The indexing status object.

### chain

> **chain**: `Chain`

### hasIndexingErrors

> **hasIndexingErrors**: `boolean` = `meta.hasIndexingErrors`

### isSynced

> **isSynced**: `boolean`

### networkBlockNumber

> **networkBlockNumber**: `undefined` \| `bigint`

### resource

> **resource**: `string`

### subgraphBlockNumber

> **subgraphBlockNumber**: `bigint`

## Defined in

[src/hooks/useSubgraphIndexingStatus.ts:15](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/hooks/useSubgraphIndexingStatus.ts#L15)
