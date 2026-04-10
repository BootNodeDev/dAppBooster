import { describe, expect, it, vi } from 'vitest'
import { runCodegen } from './run'
import type { CodegenPlugin, CodegenResult } from './types'

function makePlugin(name: string, result: CodegenResult): CodegenPlugin {
  return { name, run: vi.fn().mockResolvedValue(result) }
}

describe('runCodegen', () => {
  it('runs all plugins and returns combined results', async () => {
    const pluginA = makePlugin('alpha', { files: ['a.ts'] })
    const pluginB = makePlugin('beta', { files: ['b.ts', 'c.ts'] })

    const results = await runCodegen([pluginA, pluginB])

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({
      plugin: 'alpha',
      files: ['a.ts'],
      warnings: undefined,
      error: undefined,
    })
    expect(results[1]).toEqual({
      plugin: 'beta',
      files: ['b.ts', 'c.ts'],
      warnings: undefined,
      error: undefined,
    })
    expect(pluginA.run).toHaveBeenCalledOnce()
    expect(pluginB.run).toHaveBeenCalledOnce()
  })

  it('captures plugin errors without stopping other plugins', async () => {
    const failing: CodegenPlugin = {
      name: 'broken',
      run: vi.fn().mockRejectedValue(new Error('codegen crashed')),
    }
    const passing = makePlugin('ok', { files: ['ok.ts'] })

    const results = await runCodegen([failing, passing])

    expect(results).toHaveLength(2)
    expect(results[0].plugin).toBe('broken')
    expect(results[0].error).toBe('codegen crashed')
    expect(results[0].files).toEqual([])
    expect(results[1].plugin).toBe('ok')
    expect(results[1].files).toEqual(['ok.ts'])
  })

  it('returns empty array when no plugins provided', async () => {
    const results = await runCodegen([])

    expect(results).toEqual([])
  })

  it('includes warnings from plugins', async () => {
    const withWarnings = makePlugin('warn', {
      files: ['out.ts'],
      warnings: ['deprecated API'],
    })

    const results = await runCodegen([withWarnings])

    expect(results[0].warnings).toEqual(['deprecated API'])
  })
})
