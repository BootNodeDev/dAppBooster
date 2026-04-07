import { describe, expect, it } from 'vitest'

import { createApprovalPreStep, createPermitPreStep } from './pre-steps'

const TOKEN_ADDRESS = '0xTokenAddress000000000000000000000000000'
const SPENDER_ADDRESS = '0xSpenderAddress00000000000000000000000000'
const OWNER_ADDRESS = '0xOwnerAddress000000000000000000000000000'
const CHAIN_ID = 1

describe('createApprovalPreStep', () => {
  it('returns a PreStep with label containing the token address', () => {
    const result = createApprovalPreStep({
      token: TOKEN_ADDRESS as `0x${string}`,
      spender: SPENDER_ADDRESS as `0x${string}`,
      amount: BigInt(1000),
      chainId: CHAIN_ID,
    })
    expect(result.label).toContain(TOKEN_ADDRESS)
  })

  it('returns a PreStep with the correct chainId', () => {
    const result = createApprovalPreStep({
      token: TOKEN_ADDRESS as `0x${string}`,
      spender: SPENDER_ADDRESS as `0x${string}`,
      amount: BigInt(1000),
      chainId: CHAIN_ID,
    })
    expect(result.params.chainId).toBe(CHAIN_ID)
  })

  it('payload contract functionName is "approve"', () => {
    const result = createApprovalPreStep({
      token: TOKEN_ADDRESS as `0x${string}`,
      spender: SPENDER_ADDRESS as `0x${string}`,
      amount: BigInt(1000),
      chainId: CHAIN_ID,
    })
    const payload = result.params.payload as { contract: { functionName: string; args: unknown[] } }
    expect(payload.contract.functionName).toBe('approve')
  })

  it('payload contract args are [spender, amount]', () => {
    const amount = BigInt(1000)
    const result = createApprovalPreStep({
      token: TOKEN_ADDRESS as `0x${string}`,
      spender: SPENDER_ADDRESS as `0x${string}`,
      amount,
      chainId: CHAIN_ID,
    })
    const payload = result.params.payload as { contract: { args: unknown[] } }
    expect(payload.contract.args).toEqual([SPENDER_ADDRESS, amount])
  })
})

describe('createPermitPreStep', () => {
  const permitParams = {
    token: TOKEN_ADDRESS as `0x${string}`,
    owner: OWNER_ADDRESS as `0x${string}`,
    spender: SPENDER_ADDRESS as `0x${string}`,
    value: BigInt(500),
    deadline: BigInt(9999999),
    v: 27,
    r: '0xr000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
    s: '0xs000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
    chainId: CHAIN_ID,
  }

  it('returns a PreStep with label containing the token address', () => {
    const result = createPermitPreStep(permitParams)
    expect(result.label).toContain(TOKEN_ADDRESS)
  })

  it('payload contract functionName is "permit"', () => {
    const result = createPermitPreStep(permitParams)
    const payload = result.params.payload as { contract: { functionName: string } }
    expect(payload.contract.functionName).toBe('permit')
  })

  it('payload contract args[0] is the owner address', () => {
    const result = createPermitPreStep(permitParams)
    const payload = result.params.payload as { contract: { args: unknown[] } }
    expect(payload.contract.args[0]).toBe(OWNER_ADDRESS)
  })

  it('payload contract args has 7 elements', () => {
    const result = createPermitPreStep(permitParams)
    const payload = result.params.payload as { contract: { args: unknown[] } }
    expect(payload.contract.args).toHaveLength(7)
  })
})
