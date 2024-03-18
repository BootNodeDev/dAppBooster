## Opinionated Libs

TODO pnpm, Wagmi, TansTank, Nextjs, React

## Folder structure

TODO

## Wagmi and TanksTank config

TODO

## Managing Contract Interactions

Interacting with smart contracts is key in any dApp. Although Wagmi makes it easier to call contracts methods, organizing them across multiple blockchains, can be tricky. We've developed a method to keep your contract configuration organized and ensure your code is consistent and type-safe.

- **Contract keys**: Inside the `[_constants](./app/_constants/contracts.ts)` file, we use `ContractKeys` to list all the contract names we work with.

- **Contract Details**: For each contract, we store its address and ABI per chain in the `contracts` object. This approach maintains consistency by requiring entries for each `ContractKeys` and an address for each `ChainKeys`.

| Note: We assume that a contract's ABI remains the same across blockchains. If your contracts have different ABIs on different blockchains, consider using unique names for each version.

```tsx
import { mainnet } from "viem/chains";
import { useReadContract } from "wagmi";
// import contracts helpers
import { ContractKeys, getContractInfo } from "@/app/_constants/contracts";

export default function ERC20BalanceExample() {
  // get contract information
  const daiInfo = getContractInfo(ContractKeys.DAI, mainnet.id);

  const res = useReadContract({
    chainId: mainnet.id,
    address: daiInfo.address,
    abi: daiInfo.abi,
    functionName: "balanceOf",
    args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
  });

  return <div>{res.data?.toString()}</div>;
}
```

## Roadmap
