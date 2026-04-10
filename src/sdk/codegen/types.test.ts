import { describe, expect, it } from 'vitest'
import type { CodegenPlugin, CodegenResult } from './types'

describe('CodegenPlugin interface', () => {
  it('accepts a plugin with name and run function', () => {
    const plugin: CodegenPlugin = {
      name: 'test-plugin',
      run: async () => ({ files: ['out.ts'] }),
    }

    expect(plugin.name).toBe('test-plugin')
    expect(typeof plugin.run).toBe('function')
  })

  it('run returns CodegenResult with files array', async () => {
    const plugin: CodegenPlugin = {
      name: 'test-plugin',
      run: async () => ({
        files: ['src/generated/hooks.ts', 'src/generated/actions.ts'],
        warnings: ['deprecated API used'],
      }),
    }

    const result: CodegenResult = await plugin.run()

    expect(result.files).toEqual(['src/generated/hooks.ts', 'src/generated/actions.ts'])
    expect(result.warnings).toEqual(['deprecated API used'])
  })

  it('CodegenResult.warnings is optional', async () => {
    const plugin: CodegenPlugin = {
      name: 'minimal',
      run: async () => ({ files: [] }),
    }

    const result = await plugin.run()

    expect(result.files).toEqual([])
    expect(result.warnings).toBeUndefined()
  })
})
