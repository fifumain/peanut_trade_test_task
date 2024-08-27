const {
  getUniswapPrice,
  getPricesFromExchanges,
} = require("../utils/getPriceUtils");
const logger = require("../logger");

// Main function to get price by tokens
const getPriceByTokens = async (token1, token2) => {
  try {
    // Attempt to fetch prices directly
    const [cexPrices, uniswapV3Price] = await Promise.all([
      getPricesFromExchanges(token1, token2),
      getUniswapPrice(token1, token2),
    ]);

    // Combine the results into one array
    const result = [
      ...cexPrices,
      { exchangeName: "uniswap", rate: uniswapV3Price },
    ];

    return result;
  } catch (error) {
    logger.error(`Failed to get direct price for ${token1}/${token2}:`, error);

    // Reverse tokens if no direct pool is found
    const reverseToken1 = token2;
    const reverseToken2 = token1;

    try {
      const [cexPricesReversed, uniswapV3PriceReversed] = await Promise.all([
        getPricesFromExchanges(reverseToken1, reverseToken2),
        getUniswapPrice(reverseToken1, reverseToken2),
      ]);

      // Calculate inverse rate for reversed pairs
      const reversedResult = [
        ...cexPricesReversed.map((exchange) => ({
          exchangeName: exchange.exchangeName,
          rate: 1 / exchange.rate,
        })),
        { exchangeName: "uniswap", rate: 1 / uniswapV3PriceReversed },
      ];

      return reversedResult;
    } catch (reverseError) {
      logger.error(
        `Failed to get reversed price for ${reverseToken1}/${reverseToken2}:`,
        reverseError
      );
      throw new Error(
        `No such trading pair found: ${token1}/${token2} or ${reverseToken1}/${reverseToken2}`
      );
    }
  }
};

module.exports = {
  getPriceByTokens,
};
