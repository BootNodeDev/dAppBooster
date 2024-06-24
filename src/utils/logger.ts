const isDev = import.meta.env.DEV

const time = (label: string) => isDev && console.time(label)

const timeEnd = (label: string) => isDev && console.timeEnd(label)

const logger = { time, timeEnd }

export { logger }
