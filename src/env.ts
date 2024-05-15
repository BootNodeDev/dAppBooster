import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  client: {
    PUBLIC_ALCHEMY_ID: z.string().optional(),
    PUBLIC_INFURA_KEY: z.string().optional(),
    PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().length(32),
    PUBLIC_APP_NAME: z.string().min(1),
    PUBLIC_APP_DESCRIPTION: z.string().min(1).optional(),
    PUBLIC_APP_URL: z.string().optional(),
    PUBLIC_APP_LOGO: z.string().optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
