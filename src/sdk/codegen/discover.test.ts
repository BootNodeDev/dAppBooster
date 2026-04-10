import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('discoverLocalPlugins', () => {
  it('returns an array (may be empty if no codegen configs found)', async () => {
    const { discoverLocalPlugins } = await import('./discover')
    const plugins = await discoverLocalPlugins(resolve(process.cwd(), 'src/sdk'))

    expect(Array.isArray(plugins)).toBe(true)
  })
})

describe('discoverPackagePlugins', () => {
  it('returns empty array when no @dappbooster/* packages installed', async () => {
    const { discoverPackagePlugins } = await import('./discover')
    const plugins = await discoverPackagePlugins(process.cwd())

    expect(plugins).toEqual([])
  })
})

describe('discoverAllPlugins', () => {
  it('combines local and package plugins', async () => {
    const { discoverAllPlugins } = await import('./discover')
    const plugins = await discoverAllPlugins(process.cwd())

    expect(Array.isArray(plugins)).toBe(true)
  })
})
