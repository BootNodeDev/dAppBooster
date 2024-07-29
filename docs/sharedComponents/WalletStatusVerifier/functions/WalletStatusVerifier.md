[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [sharedComponents/WalletStatusVerifier](../README.md) / WalletStatusVerifier

# Function: WalletStatusVerifier()

> **WalletStatusVerifier**(`props`, `deprecatedLegacyContext`?): `ReactNode`

WalletStatusVerifier Component

This component checks the wallet connection and chain synchronization status.
If the wallet is not connected, it displays a fallback component (default: ConnectWalletButton)
If the wallet is connected but not synced with the correct chain, it provides an option to switch chain.

## Parameters

• **props**: `WalletStatusVerifierProps`

Component props

• **deprecatedLegacyContext?**: `any`

**Deprecated**

**See**

[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods)

## Returns

`ReactNode`

The WalletStatusVerifier component

## Example

```ts
<WalletStatusVerifier>
 <>Components that requires a connected and synced wallet</>
</WalletStatusVerifier>
```

## Defined in

[src/sharedComponents/WalletStatusVerifier.tsx:34](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/WalletStatusVerifier.tsx#L34)
