// @vitest-environment node
import * as childProcess from 'node:child_process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CodegenPlugin } from '../../codegen/types'

// Mock child_process.execSync to avoid actually running wagmi-cli in tests
vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  return {
    ...actual,
    execSync: vi.fn(),
  }
})

beforeEach(() => {
  vi.mocked(childProcess.execSync).mockReset()
})

describe('EVM codegen plugin', () => {
  it('exports a valid CodegenPlugin as default', async () => {
    const { default: plugin } = await import('./index')
    const typed: CodegenPlugin = plugin

    expect(typed.name).toBe('evm-wagmi')
    expect(typeof typed.run).toBe('function')
  })

  it('run() calls wagmi generate and returns generated file paths', async () => {
    vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from(''))

    const { default: plugin } = await import('./index')
    const result = await plugin.run()

    expect(vi.mocked(childProcess.execSync)).toHaveBeenCalledWith(
      expect.stringContaining('wagmi generate'),
      expect.objectContaining({ stdio: 'pipe' }),
    )
    expect(result.files).toContain('src/contracts/generated.ts')
  })

  it('wraps wagmi-cli errors in a meaningful message', async () => {
    vi.mocked(childProcess.execSync).mockImplementation(() => {
      throw new Error('wagmi-cli not found')
    })

    const { default: plugin } = await import('./index')

    await expect(plugin.run()).rejects.toThrow('EVM codegen failed')
  })
})
