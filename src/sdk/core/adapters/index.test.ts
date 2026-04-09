import { describe, it } from 'vitest'
import type {
  ChainSigner,
  ConfirmOptions,
  ConnectOptions,
  DAppBoosterConfig,
  PrepareResult,
  PreStep,
  ReadClientFactory,
  SignatureResult,
  SignMessageInput,
  SignTypedDataInput,
  TransactionAdapter,
  TransactionAdapterMetadata,
  TransactionLifecycle,
  TransactionParams,
  TransactionPhase,
  TransactionRef,
  TransactionResult,
  WalletAdapter,
  WalletAdapterBundle,
  WalletAdapterMetadata,
  WalletConnection,
  WalletInfo,
  WalletLifecycle,
  WalletStatus,
} from './index'

// This file verifies that all types compile and export correctly.
// No runtime assertions needed — TypeScript compilation is the test.

describe('adapter interfaces', () => {
  it('types compile and export correctly', () => {
    // TypeScript compilation verifies all types are exported.
    // If any export is missing, tsc will fail when this file is compiled.
    // No runtime assertions needed.
    const _signer: ChainSigner | undefined = undefined
    const _options: ConnectOptions | undefined = undefined
    const _connection: WalletConnection | undefined = undefined
    const _status: WalletStatus | undefined = undefined
    const _signMsg: SignMessageInput | undefined = undefined
    const _signTyped: SignTypedDataInput | undefined = undefined
    const _sigResult: SignatureResult | undefined = undefined
    const _walletInfo: WalletInfo | undefined = undefined
    const _walletMeta: WalletAdapterMetadata | undefined = undefined
    const _w: WalletAdapter | undefined = undefined
    const _preStep: PreStep | undefined = undefined
    const _params: TransactionParams | undefined = undefined
    const _prepare: PrepareResult | undefined = undefined
    const _ref: TransactionRef | undefined = undefined
    const _confirmOpts: ConfirmOptions | undefined = undefined
    const _result: TransactionResult | undefined = undefined
    const _txMeta: TransactionAdapterMetadata | undefined = undefined
    const _t: TransactionAdapter | undefined = undefined
    const _phase: TransactionPhase | undefined = undefined
    const _txLifecycle: TransactionLifecycle | undefined = undefined
    const _walletLifecycle: WalletLifecycle | undefined = undefined
    const _bundle: WalletAdapterBundle | undefined = undefined
    const _factory: ReadClientFactory<unknown> | undefined = undefined
    const _config: DAppBoosterConfig | undefined = undefined
    void _signer
    void _options
    void _connection
    void _status
    void _signMsg
    void _signTyped
    void _sigResult
    void _walletInfo
    void _walletMeta
    void _w
    void _preStep
    void _params
    void _prepare
    void _ref
    void _confirmOpts
    void _result
    void _txMeta
    void _t
    void _phase
    void _txLifecycle
    void _walletLifecycle
    void _bundle
    void _factory
    void _config
  })
})
