[**dappbooster**](../../../../README.md) • **Docs**

***

[dappbooster](../../../../modules.md) / [constants/contracts/contracts](../README.md) / getContract

# Function: getContract()

> **getContract**(`name`, `chainId`): `Contract`

Retrieves the contract information based on the contract name and chain ID.

## Parameters

• **name**: `string`

The name of the contract.

• **chainId**: `1` \| `137` \| `42161` \| `11155111` \| `11155420`

The chain ID configured in the dApp. See networks.config.ts.

## Returns

`Contract`

An object containing the contract's ABI and address.

## Throws

If contract is not found.

## Defined in

[src/constants/contracts/contracts.ts:43](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/constants/contracts/contracts.ts#L43)
