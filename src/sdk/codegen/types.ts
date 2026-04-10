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
