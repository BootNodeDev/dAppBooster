import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import type {
  CodegenPlugin,
  DiscoveryResult,
  LocalDiscoveryResult,
  PackageDiscoveryResult,
  PluginDiscoveryDiagnostic,
} from './types'

function isValidPlugin(value: unknown): value is CodegenPlugin {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CodegenPlugin).name === 'string' &&
    typeof (value as CodegenPlugin).run === 'function'
  )
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/**
 * Discovers local codegen plugins by scanning for codegen/index.ts files
 * inside adapter directories matching the convention:
 *   <sdkRoot>/<adapter-dir>/codegen/index.ts
 *
 * Local plugins are the project's own source — trusted and auto-run.
 *
 * @expects sdkRoot is an absolute path to the SDK source directory
 * @postcondition returns { plugins, diagnostics }; load failures appear in diagnostics, never swallowed
 */
export async function discoverLocalPlugins(sdkRoot: string): Promise<LocalDiscoveryResult> {
  const plugins: CodegenPlugin[] = []
  const diagnostics: PluginDiscoveryDiagnostic[] = []

  if (!existsSync(sdkRoot)) {
    return { plugins, diagnostics }
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
      if (isValidPlugin(mod.default)) {
        plugins.push(mod.default)
      } else {
        diagnostics.push({
          source: 'local',
          path: codegenPath,
          reason: 'default export is not a valid CodegenPlugin shape (needs name + run())',
        })
      }
    } catch (err) {
      diagnostics.push({ source: 'local', path: codegenPath, reason: errorMessage(err) })
    }
  }

  return { plugins, diagnostics }
}

/**
 * Discovers installed @dappbooster/* packages that declare a codegen plugin
 * via the "dappbooster.codegen" field in their package.json.
 *
 * Package plugins are installed code — discovered here but NOT auto-run by the
 * orchestrator; the caller gates execution behind explicit enablement. The
 * resolved entry path is contained to the package directory; an escaping path
 * is rejected with a diagnostic.
 *
 * @expects projectRoot is an absolute path to the project root
 * @postcondition returns { packages, diagnostics }; every package plugin is tagged with its packageName; load/containment failures appear in diagnostics, never swallowed
 */
export async function discoverPackagePlugins(projectRoot: string): Promise<PackageDiscoveryResult> {
  const packages: PackageDiscoveryResult['packages'] = []
  const diagnostics: PluginDiscoveryDiagnostic[] = []
  const nodeModulesScope = join(projectRoot, 'node_modules', '@dappbooster')

  if (!existsSync(nodeModulesScope)) {
    return { packages, diagnostics }
  }

  const entries = readdirSync(nodeModulesScope, { withFileTypes: true })

  for (const pkg of entries) {
    if (!pkg.isDirectory()) {
      continue
    }

    const packageDir = join(nodeModulesScope, pkg.name)
    const pkgJsonPath = join(packageDir, 'package.json')
    if (!existsSync(pkgJsonPath)) {
      continue
    }

    try {
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
      const codegenPath = pkgJson?.dappbooster?.codegen

      if (typeof codegenPath !== 'string') {
        continue
      }

      const resolvedPath = resolve(packageDir, codegenPath)
      const containmentRoot = packageDir + sep
      if (resolvedPath !== packageDir && !resolvedPath.startsWith(containmentRoot)) {
        diagnostics.push({
          source: 'package',
          path: `${pkg.name} → ${codegenPath}`,
          reason: `codegen entry resolves outside the package directory (${resolvedPath})`,
        })
        continue
      }

      const mod = await import(resolvedPath)
      if (isValidPlugin(mod.default)) {
        packages.push({ plugin: mod.default, packageName: pkg.name })
      } else {
        diagnostics.push({
          source: 'package',
          path: `${pkg.name} → ${codegenPath}`,
          reason: 'default export is not a valid CodegenPlugin shape (needs name + run())',
        })
      }
    } catch (err) {
      diagnostics.push({ source: 'package', path: pkg.name, reason: errorMessage(err) })
    }
  }

  return { packages, diagnostics }
}

/**
 * Discovers all codegen plugins: local (trusted) and package (gated), separately.
 *
 * @expects projectRoot is an absolute path to the project root
 * @postcondition returns { local, packages, diagnostics }; local plugins are trusted-and-runnable, package plugins require explicit enablement by the caller
 */
export async function discoverAllPlugins(projectRoot: string): Promise<DiscoveryResult> {
  const sdkRoot = join(projectRoot, 'src', 'sdk')

  const [local, pkg] = await Promise.all([
    discoverLocalPlugins(sdkRoot),
    discoverPackagePlugins(projectRoot),
  ])

  return {
    local: local.plugins,
    packages: pkg.packages,
    diagnostics: [...local.diagnostics, ...pkg.diagnostics],
  }
}
