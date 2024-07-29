[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [sharedComponents/WalletStatusVerifier](../README.md) / withWalletStatusVerifier

# Function: withWalletStatusVerifier()

> **withWalletStatusVerifier**\<`P`\>(`WrappedComponent`, `WrappedComponent`): `FC`\<`P`\>

WalletStatusVerifier HOC

## Type Parameters

• **P** *extends* `object`

## Parameters

• **WrappedComponent**: `ComponentType`\<`P`\>

The component to render if the wallet is connected and synced

• **WrappedComponent**: `WalletStatusVerifierProps` = `{}`

The component to render if the wallet is connected and synced

## Returns

`FC`\<`P`\>

The WalletStatusVerifier HOC

## Example

```ts
const ComponentWithConection = withWalletStatusVerifier(MyComponent);
```

## Defined in

[src/sharedComponents/WalletStatusVerifier.tsx:72](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/WalletStatusVerifier.tsx#L72)
