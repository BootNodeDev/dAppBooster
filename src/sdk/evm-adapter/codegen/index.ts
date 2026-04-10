import { execSync } from 'node:child_process'
import type { CodegenPlugin, CodegenResult } from '../../codegen/types'

const WAGMI_CONFIG_PATH = 'src/contracts/wagmi/config.ts'
const GENERATED_OUTPUT = 'src/contracts/generated.ts'

/**
 * EVM codegen plugin. Wraps wagmi-cli to generate typed React hooks
 * and framework-agnostic actions from contract ABIs.
 *
 * @throws {Error} When wagmi-cli execution fails (e.g., missing config, invalid ABIs)
 */
const evmCodegenPlugin: CodegenPlugin = {
  name: 'evm-wagmi',

  async run(): Promise<CodegenResult> {
    try {
      execSync(`pnpm wagmi generate --config ${WAGMI_CONFIG_PATH}`, {
        stdio: 'pipe',
        cwd: process.cwd(),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`EVM codegen failed: ${message}`)
    }

    return {
      files: [GENERATED_OUTPUT],
    }
  },
}

export default evmCodegenPlugin
