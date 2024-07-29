[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [utils/suspenseWrapper](../README.md) / withSuspenseAndRetry

# Function: withSuspenseAndRetry()

> **withSuspenseAndRetry**\<`WrappedProps`\>(`WrappedComponent`): `ComponentType`\<`WrappedProps` & `WithSuspenseAndRetryProps`\>

A wrapper for a component that uses suspense, with the capacity to retry if a useSuspenseQuery fails

## Type Parameters

• **WrappedProps** *extends* `object`

## Parameters

• **WrappedComponent**: `ComponentType`\<`WrappedProps`\>

a component wrapped inside a tanstack's QueryErrorResetBoundary, ErrorBoundary, and a Suspense

## Returns

`ComponentType`\<`WrappedProps` & `WithSuspenseAndRetryProps`\>

## Defined in

[src/utils/suspenseWrapper.tsx:112](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/utils/suspenseWrapper.tsx#L112)
