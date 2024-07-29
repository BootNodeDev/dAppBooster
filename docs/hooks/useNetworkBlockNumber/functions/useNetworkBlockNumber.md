[**dappbooster**](../../../README.md) • **Docs**

***

[dappbooster](../../../modules.md) / [hooks/useNetworkBlockNumber](../README.md) / useNetworkBlockNumber

# Function: useNetworkBlockNumber()

> **useNetworkBlockNumber**(`params`): `undefined` \| `bigint`

Custom hook to fetch the block number of a specific network, despite being supported or not by the app config.

## Parameters

• **params**

The parameters for the hook.

• **params.chain**: `Chain`

The chain object representing the network.

• **params.options?**: `Omit`\<`UseSuspenseQueryOptions`\<`unknown`, `Error`, `unknown`, `QueryKey`\>, `"queryKey"` \| `"queryFn"`\>

Additional options for the useSuspenseQuery hook.

## Returns

`undefined` \| `bigint`

- The block number of the network.

## Dev

It has a default refetch interval of 10 seconds that can be overridden by passing the options object.

## Defined in

[src/hooks/useNetworkBlockNumber.ts:18](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/hooks/useNetworkBlockNumber.ts#L18)
