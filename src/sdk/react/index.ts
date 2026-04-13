// Intentionally empty.
//
// `@dappbooster/react` exports nothing from its root barrel.
// Each symbol has exactly ONE canonical import path via a sub-barrel:
//
//   @/src/sdk/react/components  — ConnectWalletButton, WalletGuard
//   @/src/sdk/react/hooks       — useWallet, useTransaction, useReadOnly, useChainRegistry, useMultiWallet
//   @/src/sdk/react/lifecycle   — createNotificationLifecycle, createSigningNotificationLifecycle
//   @/src/sdk/react/provider    — DAppBoosterProvider, useProviderContext
//
// This enforces agent-deterministic imports: the sub-path signals the layer.
export {}
