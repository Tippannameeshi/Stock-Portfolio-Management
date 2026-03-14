import axios from "axios";

export const getLivePrice = async (symbol) => {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error("Missing FINNHUB_API_KEY in .env file");

    const response = await axios.get("https://finnhub.io/api/v1/quote", {
      params: {
        symbol: symbol.toUpperCase(),
        token: apiKey,
      },
    });

    const currPrice = response.data.c;
    const percentChange = response.data.dp;
    if (!currPrice || currPrice == 0 || percentChange == null) {
      throw new Error(`Invalid Stock Symbol : ${symbol}`);
    }
    return { currPrice, percentChange };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}: `, error.message);
    throw new Error("Failed to fetch real time market data");
  }
};
