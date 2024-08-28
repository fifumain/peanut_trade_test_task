const axios = require("axios");
const config = require("../config");
const logger = require("../logger");

const { EXCHANGE_APIS } = config;

class ExchangePriceFetcher {
  async getPriceFromExchange(exchangeName, token1, token2) {
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
  }
  // getting prices from all the cex exchanges
  async getPricesFromExchanges(token1, token2) {
    return Promise.all(
      Object.keys(EXCHANGE_APIS).map(async (exchangeName) => {
        const price = await this.getPriceFromExchange(
          exchangeName,
          token1,
          token2
        );
        return { exchangeName, rate: price };
      })
    );
  }
}

module.exports = ExchangePriceFetcher;
