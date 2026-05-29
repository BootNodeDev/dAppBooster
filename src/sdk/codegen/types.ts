/** Result returned by a codegen plugin after execution. */
export interface CodegenResult {
  /** Paths of generated files (relative to project root). */
  files: string[]
  /** Non-fatal warnings encountered during generation. */
  warnings?: string[]
}

/**
 * Interface that all codegen plugins implement.
 * Adapter packages declare a codegen entry point that exports this.
 */
export interface CodegenPlugin {
  /** Human-readable name for reporting (e.g., 'evm-wagmi'). */
  name: string
  /** Run code generation. Returns list of generated files. */
  run(): Promise<CodegenResult>
}

/** A reason a discovered plugin candidate was skipped (surfaced, never swallowed). */
export interface PluginDiscoveryDiagnostic {
  source: 'local' | 'package'
  /** The path or package that was skipped. */
  path: string
  /** Why it was skipped (load error, path escape, invalid shape, malformed package.json). */
  reason: string
}

/** A codegen plugin discovered from an installed package, tagged with its origin. */
export interface PackagePlugin {
  plugin: CodegenPlugin
  /** The @dappbooster/* package name that declared it (used for enablement gating). */
  packageName: string
}

/** Result of scanning local adapter directories. */
export interface LocalDiscoveryResult {
  plugins: CodegenPlugin[]
  diagnostics: PluginDiscoveryDiagnostic[]
}

/** Result of scanning installed @dappbooster/* packages. */
export interface PackageDiscoveryResult {
  packages: PackagePlugin[]
  diagnostics: PluginDiscoveryDiagnostic[]
}

/** Combined discovery result. Local plugins are trusted; package plugins are gated. */
export interface DiscoveryResult {
  local: CodegenPlugin[]
  packages: PackagePlugin[]
  diagnostics: PluginDiscoveryDiagnostic[]
}
