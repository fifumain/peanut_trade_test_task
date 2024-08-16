const axios = require("axios");
const { ethers } = require("ethers");
const QUOTER_ABI = require("../abis/quoterABI");
const config = require("../config");
const logger = require("../logger");
// get cfg information
const { PROVIDER_URL, QUOTER_ADDRESS, POOL_FEE, TOKEN_LIST, EXCHANGE_APIS } =
  config;

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

// function for getting price with config info (DRY)
const getPriceFromExchange = async (exchangeName, token1, token2) => {
  const { url, getParams } = EXCHANGE_APIS[exchangeName];
  try {
    const response = await axios.get(url, {
      params: getParams(token1, token2),
    });
    // kucoin send data price in response.data.data.price, while binance just in data.price
    return parseFloat(response.data.price || response.data.data.price);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
// get cex prices with api
const getBinancePrice = (token1, token2) =>
  getPriceFromExchange("binance", token1, token2);
const getKucoinPrice = (token1, token2) =>
  getPriceFromExchange("kucoin", token1, token2);

// get price from uniswap v3 using config info of tokens list
const getUniswapPrice = async (baseCurrency, quoteCurrency) => {
  const tokenIn = TOKEN_LIST[baseCurrency]?.address;
  const tokenOut = TOKEN_LIST[quoteCurrency]?.address;
  const decimalsOut = TOKEN_LIST[quoteCurrency]?.decimals;

  if (!tokenIn || !tokenOut || decimalsOut === undefined) {
    console.error("Invalid token info for Uniswap:", {
      baseCurrency,
      quoteCurrency,
    });
    return 0;
  }
  // same instrument I used in arbitrage bot on previus job
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
    logger.error(error);
    console.error("Error in getUniswapPrice:", error);
    return 0;
  }
};

// get all the prices in one response
const getPriceByTokens = async (token1, token2) => {
  try {
    const [binancePrice, kucoinPrice, uniswapV3Price] = await Promise.all([
      getBinancePrice(token1, token2),
      getKucoinPrice(token1, token2),
      getUniswapPrice(token1, token2),
    ]);
    result = [
      { exchangeName: "binance", rate: binancePrice },
      { exchangeName: "kucoin", rate: kucoinPrice },
      { exchangeName: "uniswap", rate: uniswapV3Price },
    ];
    return result;
  } catch (error) {
    // if we dont have pool (like usdt/btc, etc.), calculate by own.
    // to get this working, need to do 1/( bad pool) -> 1/(btc/usdt) == usdt/btc
    // so tokens need to be reversed
    logger.error(error);
    const reverseToken1 = token2;
    const reverseToken2 = token1;

    try {
      const [
        binancePriceReversed,
        kucoinPriceReversed,
        uniswapV3PriceReversed,
      ] = await Promise.all([
        getBinancePrice(reverseToken1, reverseToken2),
        getKucoinPrice(reverseToken1, reverseToken2),
        getUniswapPrice(reverseToken1, reverseToken2),
      ]);
      return [
        { exchangeName: "binance", rate: 1 / binancePriceReversed },
        { exchangeName: "kucoin", rate: 1 / kucoinPriceReversed },
        { exchangeName: "uniswap", rate: 1 / uniswapV3PriceReversed },
      ];
    } catch (reverseError) {
      logger.error(reverseError);
      throw new Error(
        `No such trading pair found: ${token1}/${token2} or ${reverseToken1}/${reverseToken2}`
      );
    }
  }
};

module.exports = {
  getPriceByTokens,
};
