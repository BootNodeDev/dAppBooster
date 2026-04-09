import type { WalletLifecycle } from '../../core/adapters/lifecycle'
import type {
  SignatureResult,
  SignMessageInput,
  SignTypedDataInput,
  WalletAdapter,
} from '../../core/adapters/wallet'

/**
 * Invokes a single WalletLifecycle hook by key, swallowing any error it throws.
 *
 * @expects key must be a valid WalletLifecycle method name
 * @postcondition the hook is called with args if defined; errors are logged, never propagated
 * @throws never — errors thrown by hooks are caught and logged to console.error
 */
export function fireWalletLifecycle<K extends keyof WalletLifecycle>(
  key: K,
  lifecycle: WalletLifecycle | undefined,
  ...args: Parameters<NonNullable<WalletLifecycle[K]>>
): void {
  const fn = lifecycle?.[key] as ((...a: unknown[]) => void) | undefined
  if (!fn) {
    return
  }
  try {
    fn(...(args as unknown[]))
  } catch (err) {
    console.error(`wallet lifecycle hook "${key}" threw:`, err)
  }
}

/**
 * Wraps adapter.signMessage with lifecycle dispatch (onSign, onSignComplete, onSignError).
 *
 * @expects adapter must implement signMessage
 * @postcondition returned function delegates to adapter.signMessage with full lifecycle hooks
 * @throws re-throws the original error from adapter.signMessage after firing onSignError
 */
export function wrapSignMessage(
  adapter: WalletAdapter,
  lifecycle: WalletLifecycle | undefined,
): (input: SignMessageInput) => Promise<SignatureResult> {
  return async (input) => {
    fireWalletLifecycle('onSign', lifecycle, 'message', input)
    try {
      const result = await adapter.signMessage(input)
      fireWalletLifecycle('onSignComplete', lifecycle, result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      fireWalletLifecycle('onSignError', lifecycle, error)
      throw err
    }
  }
}

/**
 * Wraps adapter.signTypedData with lifecycle dispatch (onSign, onSignComplete, onSignError).
 * Returns undefined when the adapter does not support signTypedData.
 *
 * @expects adapter may or may not have signTypedData
 * @postcondition returns undefined if adapter.signTypedData is not defined
 * @postcondition returned function (when defined) delegates with full lifecycle hooks
 * @throws re-throws the original error from adapter.signTypedData after firing onSignError
 */
export function wrapSignTypedData(
  adapter: WalletAdapter,
  lifecycle: WalletLifecycle | undefined,
): ((input: SignTypedDataInput) => Promise<SignatureResult>) | undefined {
  if (!adapter.signTypedData) {
    return undefined
  }
  const { signTypedData } = adapter
  return async (input) => {
    fireWalletLifecycle('onSign', lifecycle, 'typedData', input)
    try {
      const result = await signTypedData(input)
      fireWalletLifecycle('onSignComplete', lifecycle, result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      fireWalletLifecycle('onSignError', lifecycle, error)
      throw err
    }
  }
}
