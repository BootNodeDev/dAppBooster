[**dappbooster**](../../../../README.md) • **Docs**

***

[dappbooster](../../../../modules.md) / [subgraphs/utils/schemas](../README.md) / generateSchemas

# Function: generateSchemas()

> **generateSchemas**(`parsedResourceIds`, `apiKey`, `sgEnvironment`, `sgUrls`): `object`

Generates schemas for subgraphs based on parsed resource IDs.

## Parameters

• **parsedResourceIds**: `ParsedResourceIds`

The parsed resource IDs.

• **apiKey**: `string`

The API key.

• **sgEnvironment**: `string`

The subgraph environment ('development' or 'production').

• **sgUrls**

The URLs for the subgraph environment.

• **sgUrls.development**: `string`

• **sgUrls.production**: `string`

## Returns

`object`

The generated schemas.

## Example

```ts
generateSchemas(parseResourceIds('1:uniswap:3,4:aave:6'), 'apiKey', 'development', {
 development: 'https://api.studio.thegraph.com/query/[api-key]/[subgraph-id]/[resource-id]',
 production: 'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/[resource-id]'
})
'}
// Returns
{
 'uniswap': {
  '1': 'https://api.studio.thegraph.com/query/apiKey/subgraphId/resourceId',
  '10': 'https://api.studio.thegraph.com/query/apiKey/subgraphId/resourceId,
 },
 'aave': {
  '4': 'https://api.studio.thegraph.com/query/apiKey/subgraphId/resourceId'
 }
}
```

## Defined in

[src/subgraphs/utils/schemas.ts:67](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/subgraphs/utils/schemas.ts#L67)
