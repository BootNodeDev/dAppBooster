[**dappbooster**](../../../../README.md) • **Docs**

***

[dappbooster](../../../../modules.md) / [sharedComponents/Web3Buttons/SignButton](../README.md) / default

# Function: default()

> **default**(`props`, `deprecatedLegacyContext`?): `ReactNode`

SignButton component that allows users to sign a message.

## Parameters

• **props**: `SignButtonProps`

• **deprecatedLegacyContext?**: `any`

**Deprecated**

**See**

[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods)

## Returns

`ReactNode`

## Example

```tsx
<SignButton
  message="Hello, world!"
  onError={(error) => console.error(error)}
  onSign={(signature) => console.log(data)}
/>
```

## Defined in

[src/sharedComponents/Web3Buttons/SignButton.tsx:38](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/Web3Buttons/SignButton.tsx#L38)
