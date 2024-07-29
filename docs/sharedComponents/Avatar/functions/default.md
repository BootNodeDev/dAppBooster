[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [sharedComponents/Avatar](../README.md) / default

# Function: default()

> **default**(`__namedParameters`): `Element`

Avatar component, displays an avatar with an ENS image or Jazzicon based on the provided props.
If an ENS image is provided, it will be displayed, otherwise a Jazzicon will be displayed based on the address.
This component is used as a custom avatar for the WalletProvider.

## Parameters

• **\_\_namedParameters**: `AvatarProps`

## Returns

`Element`

## Example

```ts
<Avatar address="0x1234567890abcdef1234567890abcdef12345678" ensImage="avatar.png" ensName="test.eth" radius={96} size={96} />
```

## Defined in

[src/sharedComponents/Avatar.tsx:33](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/Avatar.tsx#L33)
