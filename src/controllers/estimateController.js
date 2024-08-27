const { getPriceByTokens } = require("../services/getPriceByTokensService");
const logger = require("../logger");
const estimate = async (req, res) => {
  const token1 = req.query.inputCurrency;
  const token2 = req.query.outputCurrency;
  const inputAmount = req.query.inputAmount;
  if (!token1 || !token2) {
    return res.status(400).send("Provide both tokens");
  }

  try {
    const price = await getPriceByTokens(
      token1.toUpperCase(),
      token2.toUpperCase()
    );
    // need to choose best rate with this
    const highestPrice = price.reduce(
      (max, obj) => (obj.rate > max.rate ? obj : max),
      price[0]
    );
    const result = {
      exchangeName: highestPrice.exchangeName,
      // getting exchange price result
      outputAmount: highestPrice.rate * inputAmount,
    };
    res.send(result);
  } catch (error) {
    logger.error(error);
    res.status(500).send("Error fetching price for the given symbol");
  }
};

module.exports = {
  estimate,
};
