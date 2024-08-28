// src/controllers/estimateController.js

const PriceFetcher = require("../services/getPriceByTokensService");
const logger = require("../logger");

// Instantiate the PriceFetcher class
const priceFetcher = new PriceFetcher();

const estimate = async (req, res) => {
  const token1 = req.query.inputCurrency;
  const token2 = req.query.outputCurrency;
  const inputAmount = parseFloat(req.query.inputAmount);

  if (!token1 || !token2 || isNaN(inputAmount)) {
    return res.status(400).send("Provide valid tokens and input amount");
  }

  try {
    // Use the PriceFetcher instance to get prices
    const prices = await priceFetcher.getPriceByTokens(
      token1.toUpperCase(),
      token2.toUpperCase()
    );

    // Choose the best rate from the fetched prices
    const highestPrice = prices.reduce(
      (max, obj) => (obj.rate > max.rate ? obj : max),
      prices[0]
    );

    const result = {
      exchangeName: highestPrice.exchangeName,
      outputAmount: highestPrice.rate * inputAmount,
    };

    res.send(result);
  } catch (error) {
    logger.error("Error fetching price:", error);
    res.status(500).send("Error fetching price for the given symbol");
  }
};

module.exports = {
  estimate,
};
