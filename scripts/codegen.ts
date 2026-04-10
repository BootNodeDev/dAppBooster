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

  const plugins = await discoverAllPlugins(projectRoot)

  if (plugins.length === 0) {
    console.log('No codegen plugins found.')
    return
  }

  console.log(`Found ${plugins.length} plugin(s): ${plugins.map((p) => p.name).join(', ')}\n`)

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
