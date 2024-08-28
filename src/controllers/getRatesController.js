// src/controllers/priceController.js

const PriceFetcher = require("../services/getPriceByTokensService");
const logger = require("../logger");

// Instantiate the PriceFetcher class
const priceFetcher = new PriceFetcher();

const getRates = async (req, res) => {
  const token1 = req.query.baseCurrency;
  const token2 = req.query.quoteCurrency;

  if (!token1 || !token2) {
    return res.status(400).send("Provide both tokens");
  }

  try {
    // Use the PriceFetcher instance to get prices
    const price = await priceFetcher.getPriceByTokens(
      token1.toUpperCase(),
      token2.toUpperCase()
    );
    // Just send the price result
    res.send(price);
  } catch (error) {
    logger.error("Error fetching price:", error);
    console.error("Error fetching price:", error);
    res.status(500).send("Error fetching price for the given symbol");
  }
};

module.exports = {
  getRates,
};
