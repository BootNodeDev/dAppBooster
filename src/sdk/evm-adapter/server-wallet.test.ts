import type { WalletClient } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { CapabilityNotSupportedError } from '../core/errors'
import { createEvmServerWallet } from './server-wallet'

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createWalletClient: vi.fn(),
  }
})

vi.mock('viem/accounts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem/accounts')>()
  return {
    ...actual,
    privateKeyToAccount: vi.fn(),
  }
})

const MOCK_ADDRESS = '0xDeadBeefDeadBeefDeadBeefDeadBeefDeadBeef'
const MOCK_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

const mockSignMessage = vi.fn()
const mockSignTypedData = vi.fn()

const mockWalletClient: Partial<WalletClient> = {
  signMessage: mockSignMessage,
  signTypedData: mockSignTypedData,
}

const mockAccount = {
  address: MOCK_ADDRESS,
}

const mockChain = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://eth.example.com'] } },
}

describe('createEvmServerWallet', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const viemAccounts = await import('viem/accounts')
    ;(viemAccounts.privateKeyToAccount as Mock).mockReturnValue(mockAccount)
    const viem = await import('viem')
    ;(viem.createWalletClient as Mock).mockReturnValue(mockWalletClient)
  })

  it('getStatus() returns connected: true with the account address', async () => {
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    const status = bundle.adapter.getStatus()
    expect(status.connected).toBe(true)
    expect(status.activeAccount).toBe(MOCK_ADDRESS)
    expect(status.connecting).toBe(false)
    expect(status.connectedChainIds).toContain(mockChain.id)
  })

  it('connect() returns WalletConnection with account address', async () => {
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    const connection = await bundle.adapter.connect()
    expect(connection.activeAccount).toBe(MOCK_ADDRESS)
    expect(connection.accounts).toContain(MOCK_ADDRESS)
    expect(connection.chainId).toBe(mockChain.id)
  })

  it('signMessage() delegates to walletClient.signMessage and returns SignatureResult', async () => {
    mockSignMessage.mockResolvedValue('0xsignature')
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    const result = await bundle.adapter.signMessage({ message: 'hello' })
    expect(result.signature).toBe('0xsignature')
    expect(result.address).toBe(MOCK_ADDRESS)
    expect(mockSignMessage).toHaveBeenCalledOnce()
  })

  it('getSigner() returns the walletClient', async () => {
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    const signer = await bundle.adapter.getSigner()
    expect(signer).toBe(mockWalletClient)
  })

  it('switchChain() throws CapabilityNotSupportedError', async () => {
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    await expect(bundle.adapter.switchChain(1)).rejects.toThrow(CapabilityNotSupportedError)
  })

  it('metadata.capabilities.switchChain is false', () => {
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    expect(bundle.adapter.metadata.capabilities.switchChain).toBe(false)
  })

  it('metadata.capabilities.signTypedData is true', () => {
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    expect(bundle.adapter.metadata.capabilities.signTypedData).toBe(true)
  })

  it('bundle.Provider is undefined (no UI for server wallet)', () => {
    const bundle = createEvmServerWallet({
      privateKey: MOCK_PRIVATE_KEY,
      chain: mockChain as never,
    })
    expect(bundle.Provider).toBeUndefined()
  })

  it('throws when privateKey is not 0x-prefixed', () => {
    expect(() =>
      createEvmServerWallet({
        privateKey:
          'abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234' as `0x${string}`,
        chain: mainnet,
      }),
    ).toThrow('privateKey must be a 0x-prefixed 66-character hex string')
  })

  it('throws when privateKey is wrong length', () => {
    expect(() =>
      createEvmServerWallet({
        privateKey: '0xabcd' as `0x${string}`,
        chain: mainnet,
      }),
    ).toThrow('privateKey must be a 0x-prefixed 66-character hex string')
  })
})
