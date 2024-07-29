[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [utils/suspenseWrapper](../README.md) / withSuspense

# Function: withSuspense()

> **withSuspense**\<`WrappedProps`\>(`WrappedComponent`): `ComponentType`\<`WrappedProps` & `WithSuspenseProps`\>

A generic wrapper for all the components that use suspense

## Type Parameters

• **WrappedProps** *extends* `object`

## Parameters

• **WrappedComponent**: `ComponentType`\<`WrappedProps`\>

a component that will be wrapped inside ErrorBoundary and Suspense

## Returns

`ComponentType`\<`WrappedProps` & `WithSuspenseProps`\>

## Defined in

[src/utils/suspenseWrapper.tsx:29](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/utils/suspenseWrapper.tsx#L29)
