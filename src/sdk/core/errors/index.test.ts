import { describe, expect, it } from 'vitest'
import {
  AdapterNotFoundError,
  AmbiguousAdapterError,
  CapabilityNotSupportedError,
  ChainNotSupportedError,
  ChainRegistryConflictError,
  InsufficientFundsError,
  InvalidSignerError,
  PreStepsNotExecutedError,
  SigningRejectedError,
  TransactionNotReadyError,
  WalletConnectionRejectedError,
  WalletNotConnectedError,
  WalletNotInstalledError,
} from './index'

describe('WalletNotConnectedError', () => {
  it('extends Error', () => {
    const error = new WalletNotConnectedError()
    expect(error).toBeInstanceOf(Error)
  })

  it('is instanceof WalletNotConnectedError', () => {
    const error = new WalletNotConnectedError()
    expect(error).toBeInstanceOf(WalletNotConnectedError)
  })

  it('sets name to class name', () => {
    const error = new WalletNotConnectedError()
    expect(error.name).toBe('WalletNotConnectedError')
  })

  it('has a human-readable message', () => {
    const error = new WalletNotConnectedError()
    expect(error.message.length).toBeGreaterThan(0)
  })

  it('accepts a custom message', () => {
    const error = new WalletNotConnectedError('custom message')
    expect(error.message).toBe('custom message')
  })
})

describe('WalletNotInstalledError', () => {
  it('extends Error', () => {
    expect(new WalletNotInstalledError()).toBeInstanceOf(Error)
  })

  it('is instanceof WalletNotInstalledError', () => {
    expect(new WalletNotInstalledError()).toBeInstanceOf(WalletNotInstalledError)
  })

  it('sets name to class name', () => {
    expect(new WalletNotInstalledError().name).toBe('WalletNotInstalledError')
  })

  it('has a human-readable message', () => {
    expect(new WalletNotInstalledError().message.length).toBeGreaterThan(0)
  })

  it('accepts a custom message', () => {
    const error = new WalletNotInstalledError('MetaMask not found')
    expect(error.message).toBe('MetaMask not found')
  })
})

describe('WalletConnectionRejectedError', () => {
  it('extends Error', () => {
    expect(new WalletConnectionRejectedError()).toBeInstanceOf(Error)
  })

  it('is instanceof WalletConnectionRejectedError', () => {
    expect(new WalletConnectionRejectedError()).toBeInstanceOf(WalletConnectionRejectedError)
  })

  it('sets name to class name', () => {
    expect(new WalletConnectionRejectedError().name).toBe('WalletConnectionRejectedError')
  })

  it('has a human-readable message', () => {
    expect(new WalletConnectionRejectedError().message.length).toBeGreaterThan(0)
  })

  it('accepts a custom message', () => {
    const error = new WalletConnectionRejectedError('user dismissed the popup')
    expect(error.message).toBe('user dismissed the popup')
  })
})

describe('ChainNotSupportedError', () => {
  it('extends Error', () => {
    expect(new ChainNotSupportedError(1)).toBeInstanceOf(Error)
  })

  it('is instanceof ChainNotSupportedError', () => {
    expect(new ChainNotSupportedError(1)).toBeInstanceOf(ChainNotSupportedError)
  })

  it('sets name to class name', () => {
    expect(new ChainNotSupportedError(1).name).toBe('ChainNotSupportedError')
  })

  it('carries the chainId property', () => {
    const error = new ChainNotSupportedError(137)
    expect(error.chainId).toBe(137)
  })

  it('includes chainId in the message', () => {
    const error = new ChainNotSupportedError(137)
    expect(error.message).toContain('137')
  })
})

describe('SigningRejectedError', () => {
  it('extends Error', () => {
    expect(new SigningRejectedError()).toBeInstanceOf(Error)
  })

  it('is instanceof SigningRejectedError', () => {
    expect(new SigningRejectedError()).toBeInstanceOf(SigningRejectedError)
  })

  it('sets name to class name', () => {
    expect(new SigningRejectedError().name).toBe('SigningRejectedError')
  })

  it('has a human-readable message', () => {
    expect(new SigningRejectedError().message.length).toBeGreaterThan(0)
  })

  it('accepts a custom message', () => {
    const error = new SigningRejectedError('user closed the signing dialog')
    expect(error.message).toBe('user closed the signing dialog')
  })
})

describe('CapabilityNotSupportedError', () => {
  it('extends Error', () => {
    expect(new CapabilityNotSupportedError('signMessage')).toBeInstanceOf(Error)
  })

  it('is instanceof CapabilityNotSupportedError', () => {
    expect(new CapabilityNotSupportedError('signMessage')).toBeInstanceOf(
      CapabilityNotSupportedError,
    )
  })

  it('sets name to class name', () => {
    expect(new CapabilityNotSupportedError('signMessage').name).toBe('CapabilityNotSupportedError')
  })

  it('carries the capability property', () => {
    const error = new CapabilityNotSupportedError('batchTransactions')
    expect(error.capability).toBe('batchTransactions')
  })

  it('includes capability in the message', () => {
    const error = new CapabilityNotSupportedError('batchTransactions')
    expect(error.message).toContain('batchTransactions')
  })
})

describe('InvalidSignerError', () => {
  it('extends Error', () => {
    expect(new InvalidSignerError('evm')).toBeInstanceOf(Error)
  })

  it('is instanceof InvalidSignerError', () => {
    expect(new InvalidSignerError('evm')).toBeInstanceOf(InvalidSignerError)
  })

  it('sets name to class name', () => {
    expect(new InvalidSignerError('evm').name).toBe('InvalidSignerError')
  })

  it('carries the expected property', () => {
    const error = new InvalidSignerError('solana')
    expect(error.expected).toBe('solana')
  })

  it('includes expected signer type in the message', () => {
    const error = new InvalidSignerError('evm')
    expect(error.message).toContain('evm')
  })
})

describe('InsufficientFundsError', () => {
  it('extends Error', () => {
    expect(new InsufficientFundsError()).toBeInstanceOf(Error)
  })

  it('is instanceof InsufficientFundsError', () => {
    expect(new InsufficientFundsError()).toBeInstanceOf(InsufficientFundsError)
  })

  it('sets name to class name', () => {
    expect(new InsufficientFundsError().name).toBe('InsufficientFundsError')
  })

  it('has a human-readable message', () => {
    expect(new InsufficientFundsError().message.length).toBeGreaterThan(0)
  })

  it('accepts a custom message', () => {
    const error = new InsufficientFundsError('Not enough ETH to cover gas')
    expect(error.message).toBe('Not enough ETH to cover gas')
  })
})

describe('PreStepsNotExecutedError', () => {
  it('extends Error', () => {
    expect(new PreStepsNotExecutedError(2)).toBeInstanceOf(Error)
  })

  it('is instanceof PreStepsNotExecutedError', () => {
    expect(new PreStepsNotExecutedError(2)).toBeInstanceOf(PreStepsNotExecutedError)
  })

  it('sets name to class name', () => {
    expect(new PreStepsNotExecutedError(2).name).toBe('PreStepsNotExecutedError')
  })

  it('carries the pendingCount property', () => {
    const error = new PreStepsNotExecutedError(3)
    expect(error.pendingCount).toBe(3)
  })

  it('includes pendingCount in the message', () => {
    const error = new PreStepsNotExecutedError(3)
    expect(error.message).toContain('3')
  })
})

describe('ChainRegistryConflictError', () => {
  it('extends Error', () => {
    expect(new ChainRegistryConflictError({ chainId: 1, caip2Id: 'eip155:1' })).toBeInstanceOf(
      Error,
    )
  })

  it('is instanceof ChainRegistryConflictError', () => {
    expect(new ChainRegistryConflictError({ chainId: 1, caip2Id: 'eip155:1' })).toBeInstanceOf(
      ChainRegistryConflictError,
    )
  })

  it('sets name to class name', () => {
    expect(new ChainRegistryConflictError({ chainId: 1, caip2Id: 'eip155:1' }).name).toBe(
      'ChainRegistryConflictError',
    )
  })

  it('carries conflicting descriptor info', () => {
    const error = new ChainRegistryConflictError({ chainId: 137, caip2Id: 'eip155:137' })
    expect(error.chainId).toBe(137)
    expect(error.caip2Id).toBe('eip155:137')
  })

  it('includes the conflicting chainId in the message when conflictOn is chainId', () => {
    const error = new ChainRegistryConflictError({
      chainId: 137,
      caip2Id: 'eip155:137',
      conflictOn: 'chainId',
    })
    expect(error.message).toContain('137')
  })

  it('includes the conflicting caip2Id in the message when conflictOn is caip2Id', () => {
    const error = new ChainRegistryConflictError({
      chainId: 137,
      caip2Id: 'eip155:137',
      conflictOn: 'caip2Id',
    })
    expect(error.message).toContain('eip155:137')
  })

  it('exposes the conflictOn property', () => {
    const error = new ChainRegistryConflictError({
      chainId: 137,
      caip2Id: 'eip155:137',
      conflictOn: 'caip2Id',
    })
    expect(error.conflictOn).toBe('caip2Id')
  })
})

describe('AdapterNotFoundError', () => {
  it('extends Error', () => {
    expect(new AdapterNotFoundError(42161)).toBeInstanceOf(Error)
  })

  it('is instanceof AdapterNotFoundError', () => {
    expect(new AdapterNotFoundError(42161)).toBeInstanceOf(AdapterNotFoundError)
  })

  it('sets name to class name', () => {
    expect(new AdapterNotFoundError(42161).name).toBe('AdapterNotFoundError')
  })

  it('carries chainId property', () => {
    expect(new AdapterNotFoundError(42161).chainId).toBe(42161)
  })

  it('includes adapter kind in message', () => {
    expect(new AdapterNotFoundError(1, 'wallet').message).toContain('wallet')
    expect(new AdapterNotFoundError(1, 'transaction').message).toContain('transaction')
  })
})

describe('TransactionNotReadyError', () => {
  it('extends Error', () => {
    expect(new TransactionNotReadyError('not enough gas')).toBeInstanceOf(Error)
  })

  it('is instanceof TransactionNotReadyError', () => {
    expect(new TransactionNotReadyError('not enough gas')).toBeInstanceOf(TransactionNotReadyError)
  })

  it('sets name to class name', () => {
    expect(new TransactionNotReadyError('not enough gas').name).toBe('TransactionNotReadyError')
  })

  it('carries reason property', () => {
    expect(new TransactionNotReadyError('not enough gas').reason).toBe('not enough gas')
  })

  it('includes reason in message', () => {
    expect(new TransactionNotReadyError('not enough gas').message).toContain('not enough gas')
  })
})

describe('AmbiguousAdapterError', () => {
  it('extends Error', () => {
    expect(new AmbiguousAdapterError(['evm', 'solana'])).toBeInstanceOf(Error)
  })

  it('is instanceof AmbiguousAdapterError', () => {
    expect(new AmbiguousAdapterError(['evm', 'solana'])).toBeInstanceOf(AmbiguousAdapterError)
  })

  it('sets name to class name', () => {
    expect(new AmbiguousAdapterError(['evm', 'solana']).name).toBe('AmbiguousAdapterError')
  })

  it('carries availableChainTypes property', () => {
    const error = new AmbiguousAdapterError(['evm', 'solana', 'cosmos'])
    expect(error.availableChainTypes).toEqual(['evm', 'solana', 'cosmos'])
  })

  it('includes available chain types in the message', () => {
    const error = new AmbiguousAdapterError(['evm', 'solana'])
    expect(error.message).toContain('evm')
    expect(error.message).toContain('solana')
  })
})

describe('error independence (instanceof isolation)', () => {
  const instances = [
    new WalletNotConnectedError(),
    new WalletNotInstalledError(),
    new WalletConnectionRejectedError(),
    new ChainNotSupportedError(1),
    new SigningRejectedError(),
    new CapabilityNotSupportedError('x'),
    new InvalidSignerError('evm'),
    new InsufficientFundsError(),
    new PreStepsNotExecutedError(1),
    new ChainRegistryConflictError({ chainId: 1, caip2Id: 'eip155:1' }),
    new AdapterNotFoundError(1),
    new TransactionNotReadyError('reason'),
    new AmbiguousAdapterError(['evm']),
  ]

  const classes = [
    WalletNotConnectedError,
    WalletNotInstalledError,
    WalletConnectionRejectedError,
    ChainNotSupportedError,
    SigningRejectedError,
    CapabilityNotSupportedError,
    InvalidSignerError,
    InsufficientFundsError,
    PreStepsNotExecutedError,
    ChainRegistryConflictError,
    AdapterNotFoundError,
    TransactionNotReadyError,
    AmbiguousAdapterError,
  ]

  it('each instance is only instanceof its own class (no cross-matching)', () => {
    for (let i = 0; i < instances.length; i++) {
      for (let j = 0; j < classes.length; j++) {
        if (i === j) {
          expect(instances[i]).toBeInstanceOf(classes[j])
        } else {
          expect(instances[i]).not.toBeInstanceOf(classes[j])
        }
      }
    }
  })
})
