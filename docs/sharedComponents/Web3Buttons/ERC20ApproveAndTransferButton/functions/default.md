[**dappbooster**](../../../../README.md) • **Docs**

***

[dappbooster](../../../../modules.md) / [sharedComponents/Web3Buttons/ERC20ApproveAndTransferButton](../README.md) / default

# Function: default()

> **default**(`__namedParameters`): `Element`

Dynamically renders either an approval button or a transaction button based on the user's current token allowance.
After the approval, the transaction button will be rendered.
Use with <Suspense> to add an skeleton loader while fetching the allowance.

## Parameters

• **\_\_namedParameters**: `ERC20ApproveAndTransferButtonProps`

## Returns

`Element`

## Defined in

[src/sharedComponents/Web3Buttons/ERC20ApproveAndTransferButton.tsx:35](https://github.com/bootnodedev/dAppBooster/blob/f016c1ebca45f77d0633b6815de7286e523f8f20/src/sharedComponents/Web3Buttons/ERC20ApproveAndTransferButton.tsx#L35)
