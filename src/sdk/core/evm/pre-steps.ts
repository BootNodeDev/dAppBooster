/**
 * Helpers that produce PreStep objects for common EVM pre-transaction steps.
 */

import type { Address, Hex } from 'viem'

import type { PreStep } from '../adapters/transaction'
import type { EvmContractCall } from './types'

// ---------------------------------------------------------------------------
// ERC-20 approve
// ---------------------------------------------------------------------------

const ERC20_APPROVE_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

export interface ApprovalPreStepParams {
  token: Address
  spender: Address
  amount: bigint
  chainId: string | number
}

/**
 * Creates a PreStep for ERC-20 approve(spender, amount).
 */
export function createApprovalPreStep(params: ApprovalPreStepParams): PreStep {
  return {
    label: `Approve ${params.token}`,
    params: {
      chainId: params.chainId,
      payload: {
        contract: {
          address: params.token,
          abi: ERC20_APPROVE_ABI,
          functionName: 'approve',
          args: [params.spender, params.amount],
        },
      } satisfies EvmContractCall,
    },
  }
}

// ---------------------------------------------------------------------------
// EIP-2612 permit
// ---------------------------------------------------------------------------

const ERC20_PERMIT_ABI = [
  {
    type: 'function',
    name: 'permit',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export interface PermitPreStepParams {
  token: Address
  owner: Address
  spender: Address
  value: bigint
  deadline: bigint
  v: number
  r: Hex
  s: Hex
  chainId: string | number
}

/**
 * Creates a PreStep for EIP-2612 permit(owner, spender, value, deadline, v, r, s).
 */
export function createPermitPreStep(params: PermitPreStepParams): PreStep {
  return {
    label: `Permit ${params.token}`,
    params: {
      chainId: params.chainId,
      payload: {
        contract: {
          address: params.token,
          abi: ERC20_PERMIT_ABI,
          functionName: 'permit',
          args: [
            params.owner,
            params.spender,
            params.value,
            params.deadline,
            params.v,
            params.r,
            params.s,
          ],
        },
      } satisfies EvmContractCall,
    },
  }
}
