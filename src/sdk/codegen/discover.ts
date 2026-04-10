import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { CodegenPlugin } from './types'

/**
 * Discovers local codegen plugins by scanning for codegen/index.ts files
 * inside adapter directories matching the convention:
 *   <sdkRoot>/<adapter-dir>/codegen/index.ts
 *
 * @expects sdkRoot is an absolute path to the SDK source directory
 * @postcondition returns an array of CodegenPlugin instances (may be empty)
 */
export async function discoverLocalPlugins(sdkRoot: string): Promise<CodegenPlugin[]> {
  const plugins: CodegenPlugin[] = []

  if (!existsSync(sdkRoot)) {
    return plugins
  }

  const entries = readdirSync(sdkRoot, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const codegenPath = join(sdkRoot, entry.name, 'codegen', 'index.ts')
    if (!existsSync(codegenPath)) {
      continue
    }

    try {
      const mod = await import(codegenPath)
      if (
        mod.default &&
        typeof mod.default.name === 'string' &&
        typeof mod.default.run === 'function'
      ) {
        plugins.push(mod.default)
      }
    } catch {
      // Skip plugins that fail to load
    }
  }

  return plugins
}

/**
 * Discovers installed @dappbooster/* packages that declare a codegen plugin
 * via the "dappbooster.codegen" field in their package.json.
 *
 * @expects projectRoot is an absolute path to the project root
 * @postcondition returns an array of CodegenPlugin instances (may be empty)
 */
export async function discoverPackagePlugins(projectRoot: string): Promise<CodegenPlugin[]> {
  const plugins: CodegenPlugin[] = []
  const nodeModulesScope = join(projectRoot, 'node_modules', '@dappbooster')

  if (!existsSync(nodeModulesScope)) {
    return plugins
  }

  const packages = readdirSync(nodeModulesScope, { withFileTypes: true })

  for (const pkg of packages) {
    if (!pkg.isDirectory()) {
      continue
    }

    const pkgJsonPath = join(nodeModulesScope, pkg.name, 'package.json')
    if (!existsSync(pkgJsonPath)) {
      continue
    }

    try {
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
      const codegenPath = pkgJson?.dappbooster?.codegen

      if (typeof codegenPath !== 'string') {
        continue
      }

      const resolvedPath = resolve(nodeModulesScope, pkg.name, codegenPath)
      const mod = await import(resolvedPath)

      if (
        mod.default &&
        typeof mod.default.name === 'string' &&
        typeof mod.default.run === 'function'
      ) {
        plugins.push(mod.default)
      }
    } catch {
      // Skip packages that fail to load
    }
  }

  return plugins
}

/**
 * Discovers all codegen plugins from both local and installed sources.
 *
 * @expects projectRoot is an absolute path to the project root
 * @postcondition returns combined array of local + package plugins
 */
export async function discoverAllPlugins(projectRoot: string): Promise<CodegenPlugin[]> {
  const sdkRoot = join(projectRoot, 'src', 'sdk')

  const [localPlugins, packagePlugins] = await Promise.all([
    discoverLocalPlugins(sdkRoot),
    discoverPackagePlugins(projectRoot),
  ])

  return [...localPlugins, ...packagePlugins]
}
