import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createConfig } from 'wagmi'
import {
  connect,
  getAccount,
  getConnectors,
  getWalletClient,
  signMessage,
  watchAccount,
  watchChainId,
} from 'wagmi/actions'
import { mock } from 'wagmi/connectors'

import type { WalletStatus } from '../adapters/wallet'
import {
  ChainNotSupportedError,
  SigningRejectedError,
  WalletConnectionRejectedError,
  WalletNotConnectedError,
  WalletNotInstalledError,
} from '../errors'
import type { EvmCoreConnectorConfig } from './types'
import { createEvmWalletAdapter } from './wallet'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('wagmi/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi/actions')>()
  return {
    ...actual,
    getAccount: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    watchAccount: vi.fn(),
    watchChainId: vi.fn(),
    signMessage: vi.fn(),
    signTypedData: vi.fn(),
    switchChain: vi.fn(),
    getConnectors: vi.fn(),
    getWalletClient: vi.fn(),
  }
})

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return { ...actual }
})

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const

function makeConfig({ withConnector = false } = {}) {
  return createConfig({
    chains: [mainnet],
    transports: { [mainnet.id]: http() },
    connectors: withConnector ? [mock({ accounts: [TEST_ADDRESS] })] : [],
  })
}

function makeDisconnectedAccount() {
  return {
    isConnected: false as const,
    address: undefined,
    chainId: undefined,
    isConnecting: false,
    isDisconnected: true as const,
    isReconnecting: false,
    connector: undefined,
    addresses: [] as readonly `0x${string}`[],
    status: 'disconnected' as const,
  } as unknown as ReturnType<typeof getAccount>
}

function makeConnectedAccount(address: `0x${string}` = TEST_ADDRESS, chainId = 1) {
  return {
    isConnected: true as const,
    address,
    chainId,
    isConnecting: false,
    isDisconnected: false as const,
    isReconnecting: false,
    connector: undefined,
    addresses: [address] as readonly [`0x${string}`, ...`0x${string}`[]],
    status: 'connected' as const,
  } as unknown as ReturnType<typeof getAccount>
}

function makeConnectingAccount() {
  return {
    isConnected: false as const,
    address: undefined,
    chainId: undefined,
    isConnecting: true,
    isDisconnected: false as const,
    isReconnecting: false,
    connector: undefined,
    addresses: [] as readonly `0x${string}`[],
    status: 'connecting' as const,
  } as unknown as ReturnType<typeof getAccount>
}

// ---------------------------------------------------------------------------
// Unit tests (mocked @wagmi/core)
// ---------------------------------------------------------------------------

describe('createEvmWalletAdapter — unit tests', () => {
  let wagmiConfig: ReturnType<typeof makeConfig>

  beforeEach(() => {
    wagmiConfig = makeConfig()
    vi.mocked(getAccount).mockReturnValue(makeDisconnectedAccount())
    vi.mocked(watchAccount).mockReturnValue(() => undefined)
    vi.mocked(watchChainId).mockReturnValue(() => undefined)
    vi.mocked(getConnectors).mockReturnValue([])
  })

  const stubCoreConnector: EvmCoreConnectorConfig = {
    createConfig(chains, transports) {
      return createConfig({
        chains: chains as [typeof mainnet],
        transports,
      })
    },
  }

  function makeAdapter() {
    return createEvmWalletAdapter({
      coreConnector: stubCoreConnector,
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
      wagmiConfig,
    })
  }

  it('throws when config.chains is empty', () => {
    expect(() =>
      createEvmWalletAdapter({
        coreConnector: stubCoreConnector,
        chains: [],
        transports: {},
      }),
    ).toThrow('createEvmWalletAdapter requires at least one chain')
  })

  it('throws when coreConnector does not provide createConfig', () => {
    expect(() =>
      createEvmWalletAdapter({
        coreConnector: {} as never,
        chains: [mainnet],
        transports: { [mainnet.id]: http() },
      }),
    ).toThrow('config.coreConnector must provide a createConfig function')
  })

  // -------------------------------------------------------------------------
  // getStatus()
  // -------------------------------------------------------------------------

  describe('getStatus()', () => {
    it('maps connected account to WalletStatus', () => {
      vi.mocked(getAccount).mockReturnValue(makeConnectedAccount('0xabc' as `0x${string}`, 1))
      const adapter = makeAdapter()
      expect(adapter.getStatus()).toEqual<WalletStatus>({
        connected: true,
        activeAccount: '0xabc',
        connectedChainIds: [1],
        connecting: false,
      })
    })

    it('maps disconnected state', () => {
      vi.mocked(getAccount).mockReturnValue(makeDisconnectedAccount())
      const adapter = makeAdapter()
      expect(adapter.getStatus()).toEqual<WalletStatus>({
        connected: false,
        activeAccount: null,
        connectedChainIds: [],
        connecting: false,
      })
    })

    it('maps connecting state', () => {
      vi.mocked(getAccount).mockReturnValue(makeConnectingAccount())
      const adapter = makeAdapter()
      expect(adapter.getStatus()).toEqual<WalletStatus>({
        connected: false,
        activeAccount: null,
        connectedChainIds: [],
        connecting: true,
      })
    })
  })

  // -------------------------------------------------------------------------
  // metadata
  // -------------------------------------------------------------------------

  describe('metadata', () => {
    it('chainType is "evm"', () => {
      const adapter = makeAdapter()
      expect(adapter.metadata.chainType).toBe('evm')
    })

    it('capabilities has signTypedData and switchChain true', () => {
      const adapter = makeAdapter()
      expect(adapter.metadata.capabilities).toEqual({ signTypedData: true, switchChain: true })
    })
  })

  // -------------------------------------------------------------------------
  // signMessage()
  // -------------------------------------------------------------------------

  describe('signMessage()', () => {
    it('throws WalletNotConnectedError when disconnected', async () => {
      vi.mocked(getAccount).mockReturnValue(makeDisconnectedAccount())
      const adapter = makeAdapter()
      await expect(adapter.signMessage({ message: 'hello' })).rejects.toThrow(
        WalletNotConnectedError,
      )
    })

    it('throws SigningRejectedError on user rejection', async () => {
      vi.mocked(getAccount).mockReturnValue(makeConnectedAccount())
      vi.mocked(signMessage).mockRejectedValue(
        Object.assign(new Error('User rejected request'), { name: 'UserRejectedRequestError' }),
      )
      const adapter = makeAdapter()
      await expect(adapter.signMessage({ message: 'hello' })).rejects.toThrow(SigningRejectedError)
    })

    it('returns SignatureResult with signature and address when connected', async () => {
      vi.mocked(getAccount).mockReturnValue(makeConnectedAccount(TEST_ADDRESS, 1))
      vi.mocked(signMessage).mockResolvedValue('0xsig' as `0x${string}`)
      const adapter = makeAdapter()
      const result = await adapter.signMessage({ message: 'test' })
      expect(result).toEqual({ signature: '0xsig', address: TEST_ADDRESS })
    })

    it('passes Uint8Array message as raw form', async () => {
      vi.mocked(getAccount).mockReturnValue(makeConnectedAccount(TEST_ADDRESS, 1))
      vi.mocked(signMessage).mockResolvedValue('0xsig' as `0x${string}`)
      const adapter = makeAdapter()
      const bytes = new Uint8Array([1, 2, 3])
      await adapter.signMessage({ message: bytes })
      expect(vi.mocked(signMessage)).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ message: { raw: bytes } }),
      )
    })
  })

  // -------------------------------------------------------------------------
  // connect()
  // -------------------------------------------------------------------------

  describe('connect()', () => {
    it('throws WalletConnectionRejectedError on user rejection', async () => {
      wagmiConfig = makeConfig({ withConnector: true })
      vi.mocked(connect).mockRejectedValue(
        Object.assign(new Error('User rejected'), { name: 'UserRejectedRequestError' }),
      )
      const adapter = makeAdapter()
      await expect(adapter.connect()).rejects.toThrow(WalletConnectionRejectedError)
    })

    it('throws WalletNotInstalledError when connector is not found', async () => {
      wagmiConfig = makeConfig({ withConnector: true })
      vi.mocked(connect).mockRejectedValue(
        Object.assign(new Error('Connector not found'), { name: 'ConnectorNotFoundError' }),
      )
      const adapter = makeAdapter()
      await expect(adapter.connect()).rejects.toThrow(WalletNotInstalledError)
    })

    it('throws ChainNotSupportedError when options.chainId is not in supportedChains', async () => {
      wagmiConfig = makeConfig({ withConnector: true })
      const adapter = makeAdapter()
      await expect(adapter.connect({ chainId: 999999 })).rejects.toThrow(ChainNotSupportedError)
    })
  })

  // -------------------------------------------------------------------------
  // getSigner()
  // -------------------------------------------------------------------------

  describe('getSigner()', () => {
    it('returns WalletClient (non-null) when connected', async () => {
      vi.mocked(getAccount).mockReturnValue(makeConnectedAccount())
      vi.mocked(getWalletClient).mockResolvedValue({ type: 'walletClient' } as unknown as Awaited<
        ReturnType<typeof getWalletClient>
      >)
      const adapter = makeAdapter()
      const signer = await adapter.getSigner()
      expect(signer).not.toBeNull()
    })

    it('returns null when disconnected', async () => {
      vi.mocked(getAccount).mockReturnValue(makeDisconnectedAccount())
      const adapter = makeAdapter()
      const signer = await adapter.getSigner()
      expect(signer).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // switchChain()
  // -------------------------------------------------------------------------

  describe('switchChain()', () => {
    it('throws ChainNotSupportedError for unsupported chainId', async () => {
      vi.mocked(getAccount).mockReturnValue(makeConnectedAccount())
      const adapter = makeAdapter()
      await expect(adapter.switchChain(999999)).rejects.toThrow(ChainNotSupportedError)
    })

    it('throws WalletNotConnectedError when switchChain is called while disconnected', async () => {
      vi.mocked(getAccount).mockReturnValue(makeDisconnectedAccount())
      const adapter = makeAdapter()
      await expect(adapter.switchChain(mainnet.id)).rejects.toThrow(WalletNotConnectedError)
    })
  })

  // -------------------------------------------------------------------------
  // chainType property
  // -------------------------------------------------------------------------

  it('chainType is "evm"', () => {
    const adapter = makeAdapter()
    expect(adapter.chainType).toBe('evm')
  })

  // -------------------------------------------------------------------------
  // return shape
  // -------------------------------------------------------------------------

  it('returns WalletAdapter directly with wagmiConfig, not a bundle', () => {
    const adapter = makeAdapter()
    // Adapter is returned directly — not wrapped in { adapter, Provider }
    expect(adapter.chainType).toBe('evm')
    expect(adapter.wagmiConfig).toBeDefined()
    expect(adapter.getStatus).toBeTypeOf('function')
    // No bundle properties
    expect('Provider' in adapter).toBe(false)
    expect('useConnectModal' in adapter).toBe(false)
  })
})
