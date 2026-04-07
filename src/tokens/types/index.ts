import { z } from 'zod'

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/)

const extensionValue = z
  .string()
  .or(z.number())
  .or(z.boolean())
  .or(z.null())
  .or(z.undefined())
  .or(z.bigint())

const key = z.string()

/**
 * An schema of a token object. Matches the Uniswap token type.
 *
 * @source
 */
export const tokenSchema = z.object({
  name: z.string().min(1),
  address,
  symbol: z.string().min(1),
  decimals: z.number(),
  chainId: z.number().min(1),
  logoURI: z.string().url().optional(),
  extensions: z
    .record(key, z.record(key, z.record(key, extensionValue).or(extensionValue)).or(extensionValue))
    .optional(),
})

/**
 * A collection of tokenSchema objects.
 *
 * @source
 */
export const tokensSchema = z.array(tokenSchema)

export type Token = z.infer<typeof tokenSchema>

export type Tokens = z.infer<typeof tokensSchema>

/**
 * An schema of a version object.
 *
 * @source
 */
export const versionSchema = z.object({
  major: z.number(),
  minor: z.number(),
  patch: z.number(),
})

/**
 * A collection of tags objects.
 *
 * @source
 */
export const tagsSchema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    description: z.string(),
  }),
)

/**
 * An schema of a token list object. Matches the Uniswap token list type.
 *
 * @source
 */
export const tokenListSchema = z.object({
  name: z.string(),
  timestamp: z.string(),
  version: versionSchema,
  tokens: tokensSchema,
  keywords: z.array(z.string()).optional(),
  tags: tagsSchema.optional(),
  logoURI: z.string().optional(),
})

export type Version = z.infer<typeof versionSchema>

export type Tags = z.infer<typeof tagsSchema>

export type TokenList = z.infer<typeof tokenListSchema>
