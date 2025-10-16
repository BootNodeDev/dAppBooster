import type { ActionsConfig } from '@wagmi/cli/plugins'
import { pascalCase } from 'change-case'

/**
 * This plugin generates a set of React hooks for reading contract state using suspenseQuery.
 *
 */

// Change this string to use another wallet
const walletConfigImport = `import { config } from '@/src/lib/wallets/connectkit.config'`

type ActionsResult = {
  name: string

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  run: ({ contracts }: { contracts: any[] }) => Promise<{
    imports: string
    content: string
  }>
}

export function reactSuspenseRead(config: ActionsConfig = {}): ActionsResult {
  return {
    name: 'SuspenseRead',
    async run({ contracts }) {
      const imports = new Set<string>([])
      const content: string[] = []
      const pure = '/*#__PURE__*/'

      const actionNames = new Set<string>()

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const isReadFunction = (item: any) =>
        item.type === 'function' &&
        (item.stateMutability === 'view' || item.stateMutability === 'pure')

      for (const contract of contracts) {
        const readItems = contract.abi.filter(isReadFunction)
        const hasReadFunction = readItems.length > 0

        let innerContent = `abi: ${contract.meta.abiName}`
        if (contract.meta.addressName) {
          innerContent += `, address: ${contract.meta.addressName}`
        }

        if (hasReadFunction) {
          const actionName = getActionName(config, actionNames, 'read', contract.name)
          const functionName = 'createReadContract'
          imports.add(functionName)
          content.push(`export const ${actionName} = ${pure} ${functionName}({ ${innerContent} })`)

          const names = new Set<string>()
          for (const item of readItems) {
            if (names.has(item.name)) continue
            names.add(item.name)

            const hookName = getActionName(config, actionNames, 'read', contract.name, item.name)

            content.push(
              `
                export const ${hookName} = ${pure} ${functionName}({ ${innerContent}, functionName: '${
                  item.name
                }' })
                export const useSuspense${pascalCase(
                  hookName,
                )} = (params: Parameters<typeof ${hookName}>[1], options?: UseSuspenseQueryOptions<Awaited<ReturnType<typeof ${hookName}>>>) => {
                  return useSuspenseQuery<Awaited<ReturnType<typeof ${hookName}>>>({ queryKey: ['${hookName}', params, config.state.chainId], queryFn: () => ${hookName}(config, params), ...options })
                }
              `,
            )
          }
        }
      }

      const importValues = [...imports.values()]

      return {
        imports: importValues.length
          ? `import { ${importValues.join(', ')} } from 'wagmi/codegen'
             import { useSuspenseQuery, UseSuspenseQueryOptions } from '@tanstack/react-query'
             ${walletConfigImport}`
          : '',
        content: content.join('\n\n'),
      }
    },
  }
}

function getActionName(
  config: ActionsConfig,
  actionNames: Set<string>,
  type: 'read' | 'simulate' | 'watch' | 'write',
  contractName: string,
  itemName?: string | undefined,
) {
  const ContractName = pascalCase(contractName)
  const ItemName = itemName ? pascalCase(itemName) : undefined

  let actionName: string
  if (typeof config.getActionName === 'function')
    actionName = config.getActionName({ type, contractName: ContractName, itemName: ItemName })
  else if (typeof config.getActionName === 'string' && type === 'simulate') {
    actionName = `prepareWrite${ContractName}${ItemName ?? ''}`
  } else {
    actionName = `${type}${ContractName}${ItemName ?? ''}`
    if (type === 'watch') actionName = `${actionName}Event`
  }

  if (actionNames.has(actionName))
    throw new Error(
      `Action name "${actionName}" must be unique for contract "${contractName}". Try using \`getActionName\` to create a unique name.`,
    )

  actionNames.add(actionName)
  return actionName
}
