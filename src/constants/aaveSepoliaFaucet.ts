import { getAddress } from 'viem'
import { sepolia } from 'viem/chains'
import type { TokenList } from '@/src/types/token'

const TW = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets'

// Source: AAVE v3 Sepolia deployment — https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3Sepolia.sol
// Addresses are the underlying ERC-20 assets (not aTokens).
// logoURIs point to Trust Wallet CDN using each token's mainnet checksummed address.
export const aaveSepoliaFaucetTokens: TokenList = {
  name: 'AAVE Sepolia Faucet',
  timestamp: '2024-01-01T00:00:00Z',
  version: { major: 1, minor: 0, patch: 0 },
  tokens: [
    {
      chainId: sepolia.id,
      address: getAddress('0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357'),
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      logoURI: `${TW}/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5'),
      name: 'Chainlink Token',
      symbol: 'LINK',
      decimals: 18,
      logoURI: `${TW}/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8'),
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: `${TW}/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0x29f2D40B0605204364af54EC677bD022dA425d03'),
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      logoURI: `${TW}/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c'),
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logoURI: `${TW}/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'),
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logoURI: `${TW}/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a'),
      name: 'Aave Token',
      symbol: 'AAVE',
      decimals: 18,
      logoURI: `${TW}/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0x6d906e526a4e2Ca02097BA9d0caA3c382F52278E'),
      name: 'Euro Stablecoin',
      symbol: 'EURS',
      decimals: 2,
      logoURI: `${TW}/0xdB25f211AB05b1c97D595516F45794528a807ad8/logo.png`,
    },
    {
      chainId: sepolia.id,
      address: getAddress('0xc4bF5CbDaBE595361438F8c6a187bDc330539c60'),
      name: 'Gho Token',
      symbol: 'GHO',
      decimals: 18,
      logoURI: `${TW}/0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f/logo.png`,
    },
  ],
}
