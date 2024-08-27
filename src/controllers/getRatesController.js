const { getPriceByTokens } = require("../services/getPriceByTokensService");
const logger = require("../logger");
const getRates = async (req, res) => {
  const token1 = req.query.baseCurrency;
  const token2 = req.query.quoteCurrency;

  if (!token1 || !token2) {
    return res.status(400).send("Provide both tokens");
  }

  try {
    const price = await getPriceByTokens(
      token1.toUpperCase(),
      token2.toUpperCase()
    );
    // just send the price result
    res.send(price);
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).send("Error fetching price for the given symbol");
  }
};

module.exports = {
  getRates,
};
