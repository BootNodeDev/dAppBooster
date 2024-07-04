import { pascalCase } from 'change-case'

/**
 * This plugin generates a set of React hooks for reading contract state using suspenseQuery.
 *
 */

// Change this string to use another wallet
const walletConfigImport = `import { config } from '@/src/lib/wallets/connectkit.config'`

export type ActionsConfig = {
  getActionName?:
    | 'legacy'
    | ((options: {
        contractName: string
        itemName?: string | undefined
        type: 'read' | 'simulate' | 'watch' | 'write'
      }) => string)
  overridePackageName?: '@wagmi/core' | 'wagmi' | undefined
}

type ActionsResult = {
  name: string
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
      for (const contract of contracts) {
        let hasReadFunction = false
        const readItems = []
        for (const item of contract.abi) {
          if (
            item.type === 'function' &&
            (item.stateMutability === 'view' || item.stateMutability === 'pure')
          ) {
            hasReadFunction = true
            readItems.push(item)
          }
        }

        let innerContent: string
        if (contract.meta.addressName)
          innerContent = `abi: ${contract.meta.abiName}, address: ${contract.meta.addressName}`
        else innerContent = `abi: ${contract.meta.abiName}`

        if (hasReadFunction) {
          const actionName = getActionName(config, actionNames, 'read', contract.name)
          const functionName = 'createReadContract'
          imports.add(functionName)
          content.push(
            `
export const ${actionName} = ${pure} ${functionName}({ ${innerContent} })`,
          )

          const names = new Set<string>()
          for (const item of readItems) {
            if (item.type !== 'function') continue

            // Skip overrides since they are captured by same hook
            if (names.has(item.name)) continue
            names.add(item.name)

            const hookName = getActionName(config, actionNames, 'read', contract.name, item.name)

            const contractAddress = contract.meta.addressName
              ? `${contract.meta.addressName}[config.state.chainId as keyof typeof ${contract.meta.addressName}]`
              : 'config.state.chainId'
            content.push(
              `
export const ${hookName} = ${pure} ${functionName}({ ${innerContent}, functionName: '${item.name}' })

export const useSuspense${pascalCase(hookName)} = (args: Parameters<typeof ${hookName}>[1]) => {
  return useSuspenseQuery({queryKey: ['${hookName}', args, ${contractAddress}, config.state.chainId], queryFn: () => ${hookName}(config, args)})
}`,
            )
          }
        }
      }

      const importValues = [...imports.values()]

      let packageName = 'wagmi/codegen'
      if (config.overridePackageName) {
        switch (config.overridePackageName) {
          case '@wagmi/core':
            packageName = '@wagmi/core/codegen'
            break
          case 'wagmi':
            packageName = 'wagmi/codegen'
            break
        }
      }
      return {
        imports: importValues.length
          ? `import { ${importValues.join(', ')} } from '${packageName}'
import { useSuspenseQuery } from '@tanstack/react-query'
\n ${walletConfigImport} \n`
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
