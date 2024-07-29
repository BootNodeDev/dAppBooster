[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [utils/hash](../README.md) / default

# Function: default()

> **default**(`__namedParameters`): `Promise`\<`DetectedHash`\>

Detects the type of a given hash or string.
The function checks if the input is a valid address, transaction hash, or ENS name.
If the input is a valid address, it checks if it's a contract or an EOA.
If the input is an EOA, it fetches the associated ENS name.
If the input is a valid transaction hash, it fetches the transaction details.
If the input is a valid ENS name, it fetches the address associated with the name.

## Parameters

• **\_\_namedParameters**: `DetectHash`

## Returns

`Promise`\<`DetectedHash`\>

The detected hash type and data

## Example

```ts
const chain = mainnet;
const hashOrString = '0x87885aaeeded51c7e3858a782644f5d89759f245';
const detected = await detectHash({ chain, hashOrString });
{ type: 'EOA', data: 'my-ens-name.eth' }
```

## Defined in

[src/utils/hash.ts:129](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/utils/hash.ts#L129)
