import { isAddress, type PublicClient } from 'viem'

import detectHash, { type DetectionResult, isValidTransactionHash } from '@/src/core/utils/hash'

/** Narrows a `DetectionResult` to its `found` variant, preserving the discrimination. */
export type FoundChainHit = {
  chainId: number
  detection: Extract<DetectionResult, { status: 'found' }>
}

export type LookupResult = {
  found: FoundChainHit | null
  errors: Array<{ chainId: number; error: Error }>
}

/**
 * Runs hash detection against multiple chains using a hybrid strategy:
 * primary chain first; on miss/error, fans out to remaining chains in parallel.
 *
 * Address and ENS inputs use single-chain (primary only) — no fan-out.
 *
 * @expects clientByChain.get(primaryChainId) returns a non-null PublicClient
 * @postcondition returns LookupResult — never throws synchronously; per-chain RPC
 *   errors flow through `errors[]`
 */
export async function multiChainLookup(
  input: string,
  clientByChain: Map<number, PublicClient>,
  primaryChainId: number,
): Promise<LookupResult> {
  const primaryClient = clientByChain.get(primaryChainId)
  if (!primaryClient) {
    return { found: null, errors: [] }
  }

  // Single-chain code path: address or ENS (anything that's not a valid 66-char tx hash)
  if (isAddress(input) || !isValidTransactionHash(input)) {
    const detection = await detectHash({ publicClient: primaryClient, hashOrString: input })
    if (detection.status === 'found') {
      return { found: { chainId: primaryChainId, detection }, errors: [] }
    }
    if (detection.status === 'rpc-error') {
      return { found: null, errors: [{ chainId: primaryChainId, error: detection.error }] }
    }
    return { found: null, errors: [] }
  }

  // Tx-hash path: hybrid fan-out
  const primary = await detectHash({ publicClient: primaryClient, hashOrString: input })
  if (primary.status === 'found') {
    return { found: { chainId: primaryChainId, detection: primary }, errors: [] }
  }

  const otherIds = Array.from(clientByChain.keys()).filter((id) => id !== primaryChainId)
  const settled = await Promise.allSettled(
    otherIds.map((id) =>
      detectHash({ publicClient: clientByChain.get(id) as PublicClient, hashOrString: input }),
    ),
  )

  const primaryError =
    primary.status === 'rpc-error' ? [{ chainId: primaryChainId, error: primary.error }] : []

  const secondaryErrors = settled.flatMap((settledResult, index) => {
    if (settledResult.status !== 'fulfilled') {
      return []
    }
    const detection = settledResult.value
    if (detection.status === 'rpc-error') {
      return [{ chainId: otherIds[index], error: detection.error }]
    }
    return []
  })

  const errors = [...primaryError, ...secondaryErrors]

  const firstFound = settled
    .map((settledResult, index) => ({ settledResult, chainId: otherIds[index] }))
    .find(
      ({ settledResult }) =>
        settledResult.status === 'fulfilled' && settledResult.value.status === 'found',
    )

  const found: FoundChainHit | null =
    firstFound &&
    firstFound.settledResult.status === 'fulfilled' &&
    firstFound.settledResult.value.status === 'found'
      ? { chainId: firstFound.chainId, detection: firstFound.settledResult.value }
      : null

  return { found, errors }
}
