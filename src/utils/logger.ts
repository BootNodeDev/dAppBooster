import { isDev } from '@/src/constants/common'

const time = (label: string) => isDev && console.time(label)

const timeEnd = (label: string) => isDev && console.timeEnd(label)

const logger = { time, timeEnd }

export { logger }
