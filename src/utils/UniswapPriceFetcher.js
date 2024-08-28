const { ethers } = require("ethers");
const QUOTER_ABI = require("../abis/quoterABI");
const config = require("../config");
const logger = require("../logger");

const { PROVIDER_URL, QUOTER_ADDRESS, POOL_FEE, TOKEN_LIST } = config;

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
// uniswap fetch functionality
class UniswapPriceFetcher {
  constructor() {
    this.quoter = new ethers.Contract(QUOTER_ADDRESS, QUOTER_ABI, provider);
  }

  async getUniswapPrice(baseCurrency, quoteCurrency) {
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

    const amountIn = ethers.parseUnits("1", TOKEN_LIST[baseCurrency].decimals);
    const sqrtPriceLimitX96 = 0;

    try {
      const amountOut = await provider.call({
        to: QUOTER_ADDRESS,
        data: this.quoter.interface.encodeFunctionData(
          "quoteExactInputSingle",
          [tokenIn, tokenOut, POOL_FEE, amountIn, sqrtPriceLimitX96]
        ),
      });

      const decodedAmountOut = this.quoter.interface.decodeFunctionResult(
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
  }
}

module.exports = UniswapPriceFetcher;
