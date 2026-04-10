import type { CodegenPlugin } from './types'

/** Result of running a single codegen plugin. */
export interface PluginRunResult {
  plugin: string
  files: string[]
  warnings: string[] | undefined
  error: string | undefined
}

/**
 * Runs all codegen plugins sequentially. Captures errors per-plugin
 * so one failure doesn't prevent others from running.
 *
 * @expects plugins is an array of valid CodegenPlugin instances
 * @postcondition returns one PluginRunResult per plugin, in order
 */
export async function runCodegen(plugins: CodegenPlugin[]): Promise<PluginRunResult[]> {
  const results: PluginRunResult[] = []

  for (const plugin of plugins) {
    try {
      const result = await plugin.run()
      results.push({
        plugin: plugin.name,
        files: result.files,
        warnings: result.warnings,
        error: undefined,
      })
    } catch (err) {
      results.push({
        plugin: plugin.name,
        files: [],
        warnings: undefined,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return results
}
