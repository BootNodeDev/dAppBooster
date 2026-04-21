import { Porto } from 'porto'
import { env } from '@/src/env'

if (env.PUBLIC_ENABLE_PORTO && globalThis.location?.protocol === 'https:') {
  try {
    Porto.create()
  } catch (error) {
    console.error('Failed to initialize Porto:', error)
  }
}
