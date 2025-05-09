/****************************************/
/* @uniswap/conedison v1.8.0            */
/* https://github.com/Uniswap/conedison */
/****************************************/

// types
type Nullable<T> = T | null
type Nullish<T> = Nullable<T> | undefined

const FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
})

const FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
  useGrouping: false,
})

const NO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const THREE_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
})

const THREE_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
})

const THREE_DECIMALS_USD = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
  currency: 'USD',
  style: 'currency',
})

const TWO_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 2,
})

const TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const TWO_DECIMALS_USD = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
})

const SHORTHAND_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
})

const SHORTHAND_ONE_DECIMAL = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const SHORTHAND_USD_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
})

const SHORTHAND_USD_ONE_DECIMAL = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  currency: 'USD',
  style: 'currency',
})

const SIX_SIG_FIGS_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumSignificantDigits: 6,
  minimumSignificantDigits: 3,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const SIX_SIG_FIGS_NO_COMMAS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumSignificantDigits: 6,
  useGrouping: false,
})

const SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumSignificantDigits: 6,
  minimumSignificantDigits: 3,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  useGrouping: false,
})

const THREE_SIG_FIGS_USD = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  minimumSignificantDigits: 3,
  maximumSignificantDigits: 3,
  currency: 'USD',
  style: 'currency',
})

const SEVEN_SIG_FIGS__SCI_NOTATION_USD = new Intl.NumberFormat('en-US', {
  notation: 'scientific',
  minimumSignificantDigits: 7,
  maximumSignificantDigits: 7,
  currency: 'USD',
  style: 'currency',
})

type Format = Intl.NumberFormat | string

// each rule must contain either an `upperBound` or an `exact` value.
// upperBound => number will use that formatter as long as it is < upperBound
// exact => number will use that formatter if it is === exact
type FormatterRule =
  | { upperBound?: undefined; exact: number; formatter: Format }
  | { upperBound: number; exact?: undefined; formatter: Format }

// these formatter objects dictate which formatter rule to use based on the interval that
// the number falls into. for example, based on the rule set below, if your number
// falls between 1 and 1e6, you'd use TWO_DECIMALS as the formatter.
const tokenNonTxFormatter: FormatterRule[] = [
  { exact: 0, formatter: '0' },
  { upperBound: 0.001, formatter: '<0.001' },
  { upperBound: 1, formatter: THREE_DECIMALS },
  { upperBound: 1e6, formatter: TWO_DECIMALS },
  { upperBound: 1e15, formatter: SHORTHAND_TWO_DECIMALS },
  { upperBound: Number.POSITIVE_INFINITY, formatter: '>999T' },
]

const tokenTxFormatter: FormatterRule[] = [
  { exact: 0, formatter: '0' },
  { upperBound: 0.00001, formatter: '<0.00001' },
  { upperBound: 1, formatter: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN },
  { upperBound: 10000, formatter: SIX_SIG_FIGS_TWO_DECIMALS },
  { upperBound: Number.POSITIVE_INFINITY, formatter: TWO_DECIMALS },
]

const swapTradeAmountFormatter: FormatterRule[] = [
  { exact: 0, formatter: '0' },
  { upperBound: 0.1, formatter: SIX_SIG_FIGS_NO_COMMAS },
  { upperBound: 1, formatter: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS },
  { upperBound: Number.POSITIVE_INFINITY, formatter: SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS },
]

const swapPriceFormatter: FormatterRule[] = [
  { exact: 0, formatter: '0' },
  { upperBound: 0.00001, formatter: '<0.00001' },
  ...swapTradeAmountFormatter,
]

const fiatTokenDetailsFormatter: FormatterRule[] = [
  { exact: 0, formatter: '$0.00' },
  { upperBound: 0.00000001, formatter: '<$0.00000001' },
  { upperBound: 0.1, formatter: THREE_SIG_FIGS_USD },
  { upperBound: 1.05, formatter: THREE_DECIMALS_USD },
  { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
  { upperBound: Number.POSITIVE_INFINITY, formatter: SHORTHAND_USD_TWO_DECIMALS },
]

const fiatTokenPricesFormatter: FormatterRule[] = [
  { exact: 0, formatter: '$0.00' },
  { upperBound: 0.00000001, formatter: '<$0.00000001' },
  { upperBound: 1, formatter: THREE_SIG_FIGS_USD },
  { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
  { upperBound: 1e16, formatter: SHORTHAND_USD_TWO_DECIMALS },
  { upperBound: Number.POSITIVE_INFINITY, formatter: SEVEN_SIG_FIGS__SCI_NOTATION_USD },
]

const fiatTokenStatsFormatter: FormatterRule[] = [
  // if token stat value is 0, we probably don't have the data for it, so show '-' as a placeholder
  { exact: 0, formatter: '-' },
  { upperBound: 0.01, formatter: '<$0.01' },
  { upperBound: 1000, formatter: TWO_DECIMALS_USD },
  { upperBound: Number.POSITIVE_INFINITY, formatter: SHORTHAND_USD_ONE_DECIMAL },
]

const fiatGasPriceFormatter: FormatterRule[] = [
  { exact: 0, formatter: '$0.00' },
  { upperBound: 0.01, formatter: '<$0.01' },
  { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
  { upperBound: Number.POSITIVE_INFINITY, formatter: SHORTHAND_USD_TWO_DECIMALS },
]

const fiatTokenQuantityFormatter = [{ exact: 0, formatter: '$0.00' }, ...fiatGasPriceFormatter]

const portfolioBalanceFormatter: FormatterRule[] = [
  { exact: 0, formatter: '$0.00' },
  { upperBound: Number.POSITIVE_INFINITY, formatter: TWO_DECIMALS_USD },
]

const ntfTokenFloorPriceFormatterTrailingZeros: FormatterRule[] = [
  { exact: 0, formatter: '0' },
  { upperBound: 0.001, formatter: '<0.001' },
  { upperBound: 1, formatter: THREE_DECIMALS },
  { upperBound: 1000, formatter: TWO_DECIMALS },
  { upperBound: 1e15, formatter: SHORTHAND_TWO_DECIMALS },
  { upperBound: Number.POSITIVE_INFINITY, formatter: '>999T' },
]

const ntfTokenFloorPriceFormatter: FormatterRule[] = [
  { exact: 0, formatter: '0' },
  { upperBound: 0.001, formatter: '<0.001' },
  { upperBound: 1, formatter: THREE_DECIMALS_NO_TRAILING_ZEROS },
  { upperBound: 1000, formatter: TWO_DECIMALS_NO_TRAILING_ZEROS },
  { upperBound: 1e15, formatter: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS },
  { upperBound: Number.POSITIVE_INFINITY, formatter: '>999T' },
]

const ntfCollectionStatsFormatter: FormatterRule[] = [
  { upperBound: 1000, formatter: NO_DECIMALS },
  { upperBound: Number.POSITIVE_INFINITY, formatter: SHORTHAND_ONE_DECIMAL },
]

export enum NumberType {
  // used for token quantities in non-transaction contexts (e.g. portfolio balances)
  TokenNonTx = 'token-non-tx',

  // used for token quantities in transaction contexts (e.g. swap, send)
  TokenTx = 'token-tx',

  // this formatter is used for displaying swap price conversions
  // below the input/output amounts
  SwapPrice = 'swap-price',

  // this formatter is only used for displaying the swap trade output amount
  // in the text input boxes. Output amounts on review screen should use the above TokenTx formatter
  SwapTradeAmount = 'swap-trade-amount',

  // fiat prices in any component that belongs in the Token Details flow (except for token stats)
  FiatTokenDetails = 'fiat-token-details',

  // fiat prices everywhere except Token Details flow
  FiatTokenPrice = 'fiat-token-price',

  // fiat values for market cap, TVL, volume in the Token Details screen
  FiatTokenStats = 'fiat-token-stats',

  // fiat price of token balances
  FiatTokenQuantity = 'fiat-token-quantity',

  // fiat gas prices
  FiatGasPrice = 'fiat-gas-price',

  // portfolio balance
  PortfolioBalance = 'portfolio-balance',

  // nft floor price denominated in a token (e.g, ETH)
  NFTTokenFloorPrice = 'nft-token-floor-price',

  // nft collection stats like number of items, holder, and sales
  NFTCollectionStats = 'nft-collection-stats',

  // nft floor price with trailing zeros
  NFTTokenFloorPriceTrailingZeros = 'nft-token-floor-price-trailing-zeros',
}

const TYPE_TO_FORMATTER_RULES = {
  [NumberType.TokenNonTx]: tokenNonTxFormatter,
  [NumberType.TokenTx]: tokenTxFormatter,
  [NumberType.SwapPrice]: swapPriceFormatter,
  [NumberType.SwapTradeAmount]: swapTradeAmountFormatter,
  [NumberType.FiatTokenQuantity]: fiatTokenQuantityFormatter,
  [NumberType.FiatTokenDetails]: fiatTokenDetailsFormatter,
  [NumberType.FiatTokenPrice]: fiatTokenPricesFormatter,
  [NumberType.FiatTokenStats]: fiatTokenStatsFormatter,
  [NumberType.FiatGasPrice]: fiatGasPriceFormatter,
  [NumberType.PortfolioBalance]: portfolioBalanceFormatter,
  [NumberType.NFTTokenFloorPrice]: ntfTokenFloorPriceFormatter,
  [NumberType.NFTTokenFloorPriceTrailingZeros]: ntfTokenFloorPriceFormatterTrailingZeros,
  [NumberType.NFTCollectionStats]: ntfCollectionStatsFormatter,
}

/**
 * Returns the appropriate formatter for a number based on its value and desired format type.
 *
 * This function looks up the correct formatting rule to apply based on the numeric input
 * and the specified number type. It searches through a predefined set of formatting rules
 * for the given type and returns the first matching formatter.
 *
 * @param {number} input - The numeric value to be formatted
 * @param {NumberType} type - The type of formatting to apply (e.g., TokenNonTx, FiatTokenPrice)
 * @returns {Format} A string formatter or Intl.NumberFormat instance to format the input
 * @throws {Error} If no formatting rule matches or if the formatter type is not configured correctly
 *
 * @example
 * ```tsx
 * // Get formatter for a token amount in non-transaction context
 * const formatter = getFormatterRule(0.0005, NumberType.TokenNonTx);
 * // Returns the '<0.001' string formatter
 * ```
 *
 * @example
 * ```tsx
 * // Get formatter for a USD price
 * const formatter = getFormatterRule(1234.56, NumberType.FiatTokenPrice);
 * // Returns a TWO_DECIMALS_USD Intl.NumberFormat instance
 * ```
 */
function getFormatterRule(input: number, type: NumberType): Format {
  const rules = TYPE_TO_FORMATTER_RULES[type]
  for (const rule of rules) {
    if (
      (rule.exact !== undefined && input === rule.exact) ||
      (rule.upperBound !== undefined && input < rule.upperBound)
    ) {
      return rule.formatter
    }
  }

  throw new Error(`formatter for type ${type} not configured correctly`)
}

/**
 * Formats a numeric value according to the specified number type formatting rules.
 *
 * This function serves as the main entry point for number formatting throughout the application.
 * It applies consistent formatting based on the context where the number is displayed (e.g., token amounts,
 * fiat prices, portfolio balances) using predefined formatter rules.
 *
 * @param {Nullish<number>} input - The numeric value to format (can be null or undefined)
 * @param {NumberType} [type=NumberType.TokenNonTx] - The formatting type to apply
 * @param {string} [placeholder='-'] - Value to return if input is null or undefined
 * @returns {string} The formatted number as a string
 *
 * @example
 * ```tsx
 * // Format a token balance
 * formatNumber(0.0005, NumberType.TokenNonTx);
 * // Returns: '<0.001'
 * ```
 *
 * @example
 * ```tsx
 * // Format a fiat price with default parameters
 * formatNumber(1234.567, NumberType.FiatTokenPrice);
 * // Returns: '$1,234.57'
 * ```
 *
 * @example
 * ```tsx
 * // Format a token amount for a transaction with custom placeholder
 * formatNumber(null, NumberType.TokenTx, 'N/A');
 * // Returns: 'N/A'
 * ```
 *
 * @example
 * ```tsx
 * // Format a gas price
 * formatNumber(0.0099, NumberType.FiatGasPrice);
 * // Returns: '<$0.01'
 * ```
 */
export function formatNumber(
  input: Nullish<number>,
  type: NumberType = NumberType.TokenNonTx,
  placeholder = '-',
): string {
  if (input === null || input === undefined) {
    return placeholder
  }

  const formatter = getFormatterRule(input, type)
  if (typeof formatter === 'string') return formatter
  return formatter.format(input)
}

/**
 * Formats a number or string value according to the specified number type.
 *
 * This utility function handles both numeric and string inputs by converting
 * string values to numbers before applying the appropriate formatting rules.
 * It provides a convenient way to format values that might come from different
 * data sources in different types.
 *
 * @param {Nullish<number | string>} price - The numeric value or string representation to format
 * @param {NumberType} type - The formatting type to apply (e.g., TokenNonTx, FiatTokenPrice)
 * @returns {string} The formatted value as a string, or '-' if the input is null or undefined
 *
 * @example
 * ```tsx
 * // Format a number
 * formatNumberOrString(1234.56, NumberType.FiatTokenPrice);
 * // Returns: '$1,234.56'
 * ```
 *
 * @example
 * ```tsx
 * // Format a string representing a number
 * formatNumberOrString('0.0099', NumberType.FiatGasPrice);
 * // Returns: '<$0.01'
 * ```
 *
 * @example
 * ```tsx
 * // Handle null input
 * formatNumberOrString(null, NumberType.TokenNonTx);
 * // Returns: '-'
 * ```
 */
export function formatNumberOrString(price: Nullish<number | string>, type: NumberType): string {
  if (price === null || price === undefined) return '-'
  if (typeof price === 'string') return formatNumber(Number.parseFloat(price), type)
  return formatNumber(price, type)
}

/**
 * Formats a numeric value as a USD price using the FiatTokenPrice formatter by default.
 *
 * This function is a convenience wrapper around formatNumberOrString that specifically
 * handles USD price formatting. It applies the appropriate currency symbol, decimal places,
 * and abbreviations (like K, M, B) according to the provided number type.
 *
 * @param {Nullish<number | string>} price - The USD price value to format
 * @param {NumberType} [type=NumberType.FiatTokenPrice] - The specific USD price formatting type to apply
 * @returns {string} The formatted USD price as a string (e.g. '$1,234.57', '<$0.01', '$1.23M')
 *
 * @example
 * ```tsx
 * // Format a standard USD price
 * formatUSDPrice(1234.567);
 * // Returns: '$1,234.57'
 * ```
 *
 * @example
 * ```tsx
 * // Format a very small USD price
 * formatUSDPrice(0.000000009876);
 * // Returns: '<$0.00000001'
 * ```
 *
 * @example
 * ```tsx
 * // Format a large USD price
 * formatUSDPrice(1234567.891);
 * // Returns: '$1.23M'
 * ```
 *
 * @example
 * ```tsx
 * // Format USD price with specific type
 * formatUSDPrice(0.0099, NumberType.FiatGasPrice);
 * // Returns: '<$0.01'
 * ```
 */
export function formatUSDPrice(
  price: Nullish<number | string>,
  type: NumberType = NumberType.FiatTokenPrice,
): string {
  return formatNumberOrString(price, type)
}

/**
 * Formats a numeric value as a price in the specified currency.
 *
 * Unlike formatUSDPrice, this function allows for formatting prices in any currency
 * using the browser's Intl.NumberFormat API. It applies the appropriate currency symbol
 * and number formatting based on the specified currency code.
 *
 * @param {Nullish<number>} price - The price value to format
 * @param {string} [currency='USD'] - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')
 * @returns {string} The formatted price as a string with appropriate currency symbol, or '-' if input is null or undefined
 *
 * @example
 * ```tsx
 * // Format a USD price (default)
 * formatFiatPrice(1234.56);
 * // Returns: '$1,234.56'
 * ```
 *
 * @example
 * ```tsx
 * // Format a Euro price
 * formatFiatPrice(1234.56, 'EUR');
 * // Returns: '€1,234.56'
 * ```
 *
 * @example
 * ```tsx
 * // Format a Japanese Yen price
 * formatFiatPrice(1234.56, 'JPY');
 * // Returns: '¥1,235'
 * ```
 *
 * @example
 * ```tsx
 * // Handle null input
 * formatFiatPrice(null);
 * // Returns: '-'
 * ```
 */
export function formatFiatPrice(price: Nullish<number>, currency = 'USD'): string {
  if (price === null || price === undefined) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}
