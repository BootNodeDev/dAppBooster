[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [hooks/useSubgraphMetadata](../README.md) / useSubgraphMetadata

# Function: useSubgraphMetadata()

> **useSubgraphMetadata**(`params`): `object`

Custom hook to fetch subgraph metadata for a specific chain and resource.

## Parameters

• **params**

The parameters for the hook.

• **params.chainId**: `number`

The ID of the chain.

• **params.options?**: `Omit`\<`UseSuspenseQueryOptions`\<`unknown`, `Error`, `unknown`, `QueryKey`\>, `"queryKey"` \| `"queryFn"`\> = `{}`

Additional options for the useSuspenseQuery hook.

• **params.resource**: `string`

The resource to fetch metadata for. Must be a valid key in `appSchemas`.

## Returns

`object`

- The subgraph metadata.

### block

> **block**: `object`

### block.hash?

> `optional` **hash**: `null` \| `string`

### block.number

> **number**: `number`

### block.timestamp?

> `optional` **timestamp**: `null` \| `number`

### deployment

> **deployment**: `string`

### hasIndexingErrors

> **hasIndexingErrors**: `boolean`

If `true`, the subgraph encountered indexing errors at some past block

## Dev

It has a default refetch interval of 10 seconds that can be overridden by passing the options object.

## Defined in

[src/hooks/useSubgraphMetadata.ts:32](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/hooks/useSubgraphMetadata.ts#L32)
