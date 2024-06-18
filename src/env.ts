import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  client: {
    PUBLIC_APP_NAME: z.string().min(1),
    PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().length(32),
    PUBLIC_ALCHEMY_KEY: z.string().optional(),
    PUBLIC_INFURA_KEY: z.string().optional(),
    PUBLIC_APP_URL: z.string().optional(),
    PUBLIC_APP_LOGO: z.string().optional(),
    PUBLIC_RPC_MAINNET: z.string().optional(),
    PUBLIC_RPC_OP_SEPOLIA: z.string().optional(),
    PUBLIC_RPC_SEPOLIA: z.string().optional(),
    PUBLIC_APP_DESCRIPTION: z.string().min(1).optional(),
    PUBLIC_APP_KEYWORDS: z.string().min(1).optional(),
    PUBLIC_APP_TWITTER_HANDLE: z.string().min(1).optional(),
    PUBLIC_APP_SHARE_IMAGE: z.string().min(1).optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
