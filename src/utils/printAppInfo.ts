import { name, version } from '../../package.json'

export function printAppInfo() {
  // if running on server (NODE_ENV is defined), do nothing
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return
  }

  const css =
    'background-image: linear-gradient(90deg, #FF3CAC 0%, #784BA0 25%, #2B86C5 50%, #06D6A0 75%, #FFD166 100%); padding: 5px 10px; border-radius: 5px; color: #fff; font-size: 24px; font-weight: 700;'

  console.log(
    '\n%cdAppBooster',
    css,
    '\n___________________________________________________',
    `\n\nPackage Name: ${name}`,
    `\nPackage Version: ${version}`,
    '\n___________________________________________________',
  )
}
