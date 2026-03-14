import pool from "./config/database.js";
import { getLivePrice } from "./utils/stockUtils.js";

const UPDATE_INTERVAL_MS = 5000;

const updateNextStock = async () => {
  try {
    const { rows: stocks } = await pool.query(
      "SELECT tickersymbol FROM stocks"
    );

    if (stocks.length === 0) return;

    for (const stock of stocks) {
      const symbol = stock.tickersymbol;

      try {
        console.log(`Worker: Updating ${symbol}...`);

        const { currPrice, percentChange } = await getLivePrice(symbol);

        await pool.query(
          "UPDATE stocks SET currentprice = $1, lastpriceupdate = NOW(), priceChangePercent = $2 WHERE tickersymbol = $3",
          [currPrice, percentChange, symbol]
        );
      } catch (err) {
        console.error(`Worker: Failed to update ${symbol} - ${err.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, UPDATE_INTERVAL_MS));
    }

    updateNextStock();
  } catch (error) {
    console.error("Worker Logic Failed:", error);

    //retry after 10 sec if DB connection fails
    setTimeout(updateNextStock, 10000);
  }
};

console.log("Stock Price worker started...");
updateNextStock();
