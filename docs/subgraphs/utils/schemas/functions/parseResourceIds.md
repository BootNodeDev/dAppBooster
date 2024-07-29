[**dappbooster**](../../../../README.md) • **Docs**

***

[dappbooster](../../../../modules.md) / [subgraphs/utils/schemas](../README.md) / parseResourceIds

# Function: parseResourceIds()

> **parseResourceIds**(`resourceIds`): `ParsedResourceIds`

Parses a string of resource IDs and returns an object with the parsed values.

## Parameters

• **resourceIds**: `string`

The string of resource IDs to parse.

## Returns

`ParsedResourceIds`

An object containing the parsed resource IDs.

## Example

```ts
parseResourceIds('1:uniswap:3,4:aave:6')
// Returns
{
 'uniswap': { '1': '3' },
'aave': { '4': '6' }
}
```

## Defined in

[src/subgraphs/utils/schemas.ts:23](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/subgraphs/utils/schemas.ts#L23)
