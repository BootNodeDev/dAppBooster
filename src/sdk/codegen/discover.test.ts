import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { discoverAllPlugins, discoverLocalPlugins, discoverPackagePlugins } from './discover'

// ---- local discovery: against the real src/sdk tree --------------------------

describe('discoverLocalPlugins', () => {
  it('discovers the real evm-wagmi plugin from src/sdk', async () => {
    const { plugins, diagnostics } = await discoverLocalPlugins(resolve(process.cwd(), 'src/sdk'))
    const names = plugins.map((p) => p.name)
    expect(names).toContain('evm-wagmi')
    for (const plugin of plugins) {
      expect(typeof plugin.run).toBe('function')
    }
    // The real tree has no broken local plugins
    expect(diagnostics).toEqual([])
  })

  it('returns empty plugins + empty diagnostics when sdkRoot does not exist', async () => {
    const { plugins, diagnostics } = await discoverLocalPlugins(
      resolve(process.cwd(), 'does/not/exist'),
    )
    expect(plugins).toEqual([])
    expect(diagnostics).toEqual([])
  })
})

// ---- package discovery: against temp fixtures --------------------------------

describe('discoverPackagePlugins', () => {
  let projectRoot: string
  let scopeDir: string

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'dab-codegen-'))
    scopeDir = join(projectRoot, 'node_modules', '@dappbooster')
    mkdirSync(scopeDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true })
  })

  const writePkg = (
    name: string,
    pkgJson: object,
    entryFile?: { rel: string; contents: string },
  ) => {
    const dir = join(scopeDir, name)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'package.json'), JSON.stringify(pkgJson))
    if (entryFile) {
      const entryPath = join(dir, entryFile.rel)
      mkdirSync(join(entryPath, '..'), { recursive: true })
      writeFileSync(entryPath, entryFile.contents)
    }
  }

  const validPlugin = (name: string) =>
    `export default { name: ${JSON.stringify(name)}, run: async () => ({ files: [] }) }`

  it('discovers a valid package plugin and tags it with its package name', async () => {
    writePkg(
      'evm-adapter',
      { name: '@dappbooster/evm-adapter', dappbooster: { codegen: './codegen.mjs' } },
      { rel: 'codegen.mjs', contents: validPlugin('evm-pkg') },
    )
    const { packages, diagnostics } = await discoverPackagePlugins(projectRoot)
    expect(packages).toHaveLength(1)
    expect(packages[0].packageName).toBe('evm-adapter')
    expect(packages[0].plugin.name).toBe('evm-pkg')
    expect(diagnostics).toEqual([])
  })

  it('rejects a codegen path that escapes the package directory (path containment)', async () => {
    // write a target outside the package dir to prove containment, not existence, is the gate
    writeFileSync(join(projectRoot, 'evil.mjs'), validPlugin('evil'))
    writePkg('evm-adapter', {
      name: '@dappbooster/evm-adapter',
      dappbooster: { codegen: '../../../evil.mjs' },
    })
    const { packages, diagnostics } = await discoverPackagePlugins(projectRoot)
    expect(packages).toEqual([])
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].source).toBe('package')
    expect(diagnostics[0].reason.toLowerCase()).toContain('outside')
  })

  it('surfaces a diagnostic (does not swallow) when the entry throws on import', async () => {
    writePkg(
      'broken',
      { name: '@dappbooster/broken', dappbooster: { codegen: './codegen.mjs' } },
      { rel: 'codegen.mjs', contents: `throw new Error('boom on import')` },
    )
    const { packages, diagnostics } = await discoverPackagePlugins(projectRoot)
    expect(packages).toEqual([])
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].reason).toContain('boom on import')
  })

  it('surfaces a diagnostic for malformed package.json', async () => {
    const dir = join(scopeDir, 'malformed')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'package.json'), '{ not valid json')
    const { packages, diagnostics } = await discoverPackagePlugins(projectRoot)
    expect(packages).toEqual([])
    expect(diagnostics).toHaveLength(1)
  })

  it('skips (without diagnostic) packages that declare no dappbooster.codegen field', async () => {
    writePkg('plain', { name: '@dappbooster/plain' })
    const { packages, diagnostics } = await discoverPackagePlugins(projectRoot)
    expect(packages).toEqual([])
    expect(diagnostics).toEqual([])
  })

  it('surfaces a diagnostic when the entry loads but lacks a valid plugin shape', async () => {
    writePkg(
      'shapeless',
      { name: '@dappbooster/shapeless', dappbooster: { codegen: './codegen.mjs' } },
      { rel: 'codegen.mjs', contents: `export default { name: 'x' }` }, // no run()
    )
    const { packages, diagnostics } = await discoverPackagePlugins(projectRoot)
    expect(packages).toEqual([])
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].reason.toLowerCase()).toContain('shape')
  })

  it('returns empty when no @dappbooster scope exists', async () => {
    const empty = mkdtempSync(join(tmpdir(), 'dab-empty-'))
    const { packages, diagnostics } = await discoverPackagePlugins(empty)
    expect(packages).toEqual([])
    expect(diagnostics).toEqual([])
    rmSync(empty, { recursive: true, force: true })
  })
})

describe('discoverAllPlugins', () => {
  it('returns local (trusted) and packages (gated) separately, plus diagnostics', async () => {
    const result = await discoverAllPlugins(process.cwd())
    expect(result.local.map((p) => p.name)).toContain('evm-wagmi')
    expect(Array.isArray(result.packages)).toBe(true)
    expect(Array.isArray(result.diagnostics)).toBe(true)
  })
})
