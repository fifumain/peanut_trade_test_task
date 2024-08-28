const UniswapPriceFetcher = require("../utils/UniswapPriceFetcher");
const ExchangePriceFetcher = require("../utils/ExchangePriceFetcher");
const logger = require("../logger");

class PriceFetcher {
  constructor() {
    this.uniswapFetcher = new UniswapPriceFetcher();
    this.exchangeFetcher = new ExchangePriceFetcher();
  }

  async getPriceByTokens(token1, token2) {
    try {
      // getting results from cex and dex in common way
      const [cexPrices, uniswapV3Price] = await Promise.all([
        this.exchangeFetcher.getPricesFromExchanges(token1, token2),
        this.uniswapFetcher.getUniswapPrice(token1, token2),
      ]);

      // combine the results into one array
      const result = [
        ...cexPrices,
        { exchangeName: "uniswap", rate: uniswapV3Price },
      ];

      return result;
    } catch (error) {
      logger.error(
        `Failed to get direct price for ${token1}/${token2}:`,
        error
      );

      // seccond try if pool does not exist
      const reverseToken1 = token2;
      const reverseToken2 = token1;

      try {
        const [cexPricesReversed, uniswapV3PriceReversed] = await Promise.all([
          this.exchangeFetcher.getPricesFromExchanges(
            reverseToken1,
            reverseToken2
          ),
          this.uniswapFetcher.getUniswapPrice(reverseToken1, reverseToken2),
        ]);

        // calculations for reversed search
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
  }
}

module.exports = PriceFetcher;
