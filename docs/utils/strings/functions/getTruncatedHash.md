[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [utils/strings](../README.md) / getTruncatedHash

# Function: getTruncatedHash()

> **getTruncatedHash**(`hash`, `length`?): `string`

This function gets a string in the form 0x12345AaEEdED51C7e3858a782644F5d897595678 and returns
something like 0x12345A...595678

## Parameters

• **hash**: `string`

The hash to truncate

• **length?**: `number` = `6`

The number of characters to show at the start and end of the hash. Min is 1, max is 16. Default is 6.

## Returns

`string`

## Defined in

[src/utils/strings.ts:33](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/utils/strings.ts#L33)
