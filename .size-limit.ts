import type { SizeLimitConfig } from 'size-limit'

// Brotli-compressed budgets for each sub-path entry point. The `ignore` lists
// mark peer-installed deps (viem, wagmi, react, etc.) as external so the
// numbers reflect what dAppBooster adds, not what the consumer's ecosystem
// already brings.
//
// Budgets are set to roughly 2x the baseline captured on 2026-05-13 so that
// accidental bloat surfaces in a single PR. Legitimate growth raises the
// budget deliberately with a changelog note.

const config: SizeLimitConfig = [
  // Core — zero runtime deps. Sub-paths are tree-shaken independently.
  {
    name: '@dappbooster/core',
    path: 'src/sdk/core/index.ts',
    limit: '3 KB',
  },
  {
    name: '@dappbooster/core/chain',
    path: 'src/sdk/core/chain/index.ts',
    limit: '1.5 KB',
  },

  // EVM adapter — viem-only root (agent scripts, CLI tools, relayers).
  {
    name: '@dappbooster/evm-adapter',
    path: 'src/sdk/evm-adapter/index.ts',
    limit: '6 KB',
    ignore: ['viem'],
  },
  // EVM adapter — adds wagmi/core actions for browser wallet connection.
  {
    name: '@dappbooster/evm-adapter/wagmi',
    path: 'src/sdk/evm-adapter/wagmi/index.ts',
    limit: '3 KB',
    ignore: ['viem', 'wagmi', '@wagmi/core'],
  },
  // EVM adapter — full React bundle (Provider stack + read-only hook).
  {
    name: '@dappbooster/evm-adapter/react',
    path: 'src/sdk/evm-adapter/react/index.ts',
    limit: '5 KB',
    ignore: ['viem', 'wagmi', '@wagmi/core', 'react', 'react-dom', '@tanstack/react-query'],
  },

  // React SDK — headless hooks and components, peer-installed React only.
  {
    name: '@dappbooster/react/hooks',
    path: 'src/sdk/react/hooks/index.ts',
    limit: '6 KB',
    ignore: ['react', 'react-dom'],
  },
  {
    name: '@dappbooster/react/components',
    path: 'src/sdk/react/components/index.ts',
    limit: '4 KB',
    ignore: ['react', 'react-dom'],
  },
]

export default config
