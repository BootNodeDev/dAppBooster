#!/usr/bin/env tsx
/**
 * Codegen orchestrator — discovers and runs all adapter codegen plugins.
 *
 * Usage: pnpm codegen
 *
 * Discovery:
 * 1. Local: scans src/sdk/{adapter}/codegen/index.ts for convention-based plugins
 * 2. Packages: scans node_modules/@dappbooster/{pkg}/package.json for "dappbooster.codegen" field
 */

import { resolve } from 'node:path'
import { discoverAllPlugins } from '../src/sdk/codegen/discover'
import { runCodegen } from '../src/sdk/codegen/run'

const projectRoot = resolve(import.meta.dirname, '..')

async function main() {
  console.log('Discovering codegen plugins...\n')

  const args = process.argv.slice(2)
  const allowAll = args.includes('--all-packages')
  const allowed = new Set(
    args
      .map((arg, index) => (arg === '--allow' ? args[index + 1] : null))
      // a flag is never a valid --allow value (guards `--allow --all-packages` / trailing `--allow`)
      .filter((name): name is string => typeof name === 'string' && !name.startsWith('--')),
  )

  const { local, packages, diagnostics } = await discoverAllPlugins(projectRoot)

  for (const diagnostic of diagnostics) {
    console.warn(`  [skip] ${diagnostic.source}: ${diagnostic.path} — ${diagnostic.reason}`)
  }

  // Local plugins are the project's own source — always trusted and run.
  // Package plugins require explicit enablement (--allow <name> or --all-packages).
  const enabledPackages = packages.filter(
    (pkg) =>
      allowAll || allowed.has(pkg.packageName) || allowed.has(`@dappbooster/${pkg.packageName}`),
  )
  const gatedOut = packages.filter((pkg) => !enabledPackages.includes(pkg))

  for (const pkg of gatedOut) {
    console.warn(
      `  [gated] @dappbooster/${pkg.packageName} declares a codegen plugin but is not enabled.\n` +
        `          Review it, then run: pnpm codegen --allow @dappbooster/${pkg.packageName}`,
    )
  }

  const plugins = [...local, ...enabledPackages.map((pkg) => pkg.plugin)]

  if (plugins.length === 0) {
    console.log('No codegen plugins to run.')
    return
  }

  console.log(`Running ${plugins.length} plugin(s): ${plugins.map((p) => p.name).join(', ')}\n`)

  const results = await runCodegen(plugins)

  for (const result of results) {
    if (result.error) {
      console.error(`  [FAIL] ${result.plugin}: ${result.error}`)
    } else {
      console.log(`  [OK] ${result.plugin}: generated ${result.files.length} file(s)`)
      for (const file of result.files) {
        console.log(`        ${file}`)
      }
    }

    if (result.warnings) {
      for (const warning of result.warnings) {
        console.warn(`        warning: ${warning}`)
      }
    }
  }

  const failures = results.filter((r) => r.error)
  if (failures.length > 0) {
    console.error(`\n${failures.length} plugin(s) failed.`)
    process.exit(1)
  }

  console.log('\nCodegen complete.')
}

main()
