import { Porto } from 'porto'
import { env } from '@/src/env'

if (env.PUBLIC_ENABLE_PORTO) {
  try {
    Porto.create()
  } catch (error) {
    console.error('Failed to initialize Porto:', error)
  }
}
