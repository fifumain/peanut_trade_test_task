const axios = require("axios");
const { ethers } = require("ethers");
const QUOTER_ABI = require("../abis/quoterABI");
const config = require("../config");
const logger = require("../logger");

// Get config information
const { PROVIDER_URL, QUOTER_ADDRESS, POOL_FEE, TOKEN_LIST, EXCHANGE_APIS } =
  config;

// Set up Ethereum provider
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

// Function to get price from an exchange
const getPriceFromExchange = async (exchangeName, token1, token2) => {
  const { url, getParams } = EXCHANGE_APIS[exchangeName];
  try {
    const response = await axios.get(url, {
      params: getParams(token1, token2),
    });
    return parseFloat(response.data.price || response.data.data.price);
  } catch (error) {
    logger.error(`Error fetching price from ${exchangeName}:`, error);
    throw error;
  }
};

// Function to get price from Uniswap V3 using config info
const getUniswapPrice = async (baseCurrency, quoteCurrency) => {
  const tokenIn = TOKEN_LIST[baseCurrency]?.address;
  const tokenOut = TOKEN_LIST[quoteCurrency]?.address;
  const decimalsOut = TOKEN_LIST[quoteCurrency]?.decimals;

  if (!tokenIn || !tokenOut || decimalsOut === undefined) {
    logger.error("Invalid token info for Uniswap:", {
      baseCurrency,
      quoteCurrency,
    });
    return 0;
  }

  const quoter = new ethers.Contract(QUOTER_ADDRESS, QUOTER_ABI, provider);
  const amountIn = ethers.parseUnits("1", TOKEN_LIST[baseCurrency].decimals);
  const sqrtPriceLimitX96 = 0;

  try {
    const amountOut = await provider.call({
      to: QUOTER_ADDRESS,
      data: quoter.interface.encodeFunctionData("quoteExactInputSingle", [
        tokenIn,
        tokenOut,
        POOL_FEE,
        amountIn,
        sqrtPriceLimitX96,
      ]),
    });

    const decodedAmountOut = quoter.interface.decodeFunctionResult(
      "quoteExactInputSingle",
      amountOut
    );
    return (
      parseFloat(ethers.formatUnits(decodedAmountOut[0], decimalsOut)) || 0
    );
  } catch (error) {
    logger.error("Error in getUniswapPrice:", error);
    return 0;
  }
};

// Function to get prices from all exchanges
const getPricesFromExchanges = async (token1, token2) => {
  return Promise.all(
    Object.keys(EXCHANGE_APIS).map(async (exchangeName) => {
      const price = await getPriceFromExchange(exchangeName, token1, token2);
      return { exchangeName, rate: price };
    })
  );
};

module.exports = {
  getUniswapPrice,
  getPricesFromExchanges,
};
