[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [sharedComponents/HashInput](../README.md) / default

# Function: default()

> **default**(`props`, `deprecatedLegacyContext`?): `ReactNode`

HashInput Component

This component provides an input field where users can enter an address,
transaction hash, or ENS name. It detects the type of input and displays the relevant
information based on the detection results.

## Parameters

• **props**: `HashInputProps`

Component props

• **deprecatedLegacyContext?**: `any`

**Deprecated**

**See**

[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods)

## Returns

`ReactNode`

## Example

```ts
const chain = mainnet;
return <HashInput chain={chain} onSearch={(result) => console.log(result)} />;
```

## Defined in

[src/sharedComponents/HashInput.tsx:44](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/HashInput.tsx#L44)
