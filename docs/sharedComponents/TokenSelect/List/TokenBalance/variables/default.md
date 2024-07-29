[**dappbooster**](../../../../../README.md) • **Docs**

***

[dappbooster](../../../../../modules.md) / [sharedComponents/TokenSelect/List/TokenBalance](../README.md) / default

# Variable: default

> `const` **default**: `ComponentType`\<`object` & `WithSuspenseAndRetryProps`\>

Renders the token balance in the token list row.

## Param

The component props.

## Param

Indicates if the token balance is currently being loaded.

## Param

The token object containing the amount, decimals, and price in USD.

## Throws

If the token balance is still loading or if the token does not have balance information.

## Example

```tsx
<TokenBalance isLoading={false} token={token} />
```

## Defined in

[src/sharedComponents/TokenSelect/List/TokenBalance.tsx:46](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/TokenSelect/List/TokenBalance.tsx#L46)
