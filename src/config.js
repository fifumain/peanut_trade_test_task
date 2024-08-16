module.exports = {
  PORT: 3000,
  PROVIDER_URL: "https://mainnet.infura.io/v3/990099b5879c4e918272cf14aa5f097e",
  QUOTER_ADDRESS: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  POOL_FEE: 3000,
  // "Передбачити в архітектурі сервісу швидке додавання нових бірж та криптовалют." - зручний конфіг для додавання апі, та токенів
  TOKEN_LIST: {
    ETH: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
    },
    BTC: {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      decimals: 8,
    },
    USDT: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
  },
  // different dex needs different symbol format
  EXCHANGE_APIS: {
    binance: {
      url: "https://api.binance.com/api/v3/ticker/price",
      getParams: (token1, token2) => ({
        symbol: `${token1.toUpperCase()}${token2.toUpperCase()}`,
      }),
    },
    kucoin: {
      url: "https://api.kucoin.com/api/v1/market/orderbook/level1",
      getParams: (token1, token2) => ({
        symbol: `${token1.toUpperCase()}-${token2.toUpperCase()}`,
      }),
    },
  },
};
