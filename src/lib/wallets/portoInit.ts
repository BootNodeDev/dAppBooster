import { env } from '@/src/env'
import { Porto } from 'porto'

if (env.PUBLIC_ENABLE_PORTO) {
  try {
    Porto.create()
  } catch (error) {
    console.error('Failed to initialize Porto:', error)
  }
}
