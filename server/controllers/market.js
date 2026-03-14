import pool from "../config/database.js";
import { getLivePrice } from "../utils/stockUtils.js";

const CACHE_DURATION_SECONDS = 60;

export const getAllStocks = async (req, res) => {
  try {
    const stocks = await pool.query(
      "SELECT * FROM stocks ORDER BY TickerSymbol ASC"
    );
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ success: false, message: "Error fetching stocks" });
  }
};

export const getStockById = async (req, res) => {
  const userId = req.user.id;
  const { stockId } = req.params;

  try {
    const { rows: checkRows } = await pool.query(
      "SELECT TickerSymbol, LastPriceUpdate FROM Stocks WHERE StockID = $1",
      [stockId]
    );

    if (checkRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Stock not found" });
    }

    const { tickersymbol, lastpriceupdate } = checkRows[0];

    const lastUpdatedDate = new Date(lastpriceupdate);
    const now = new Date();
    const diffSeconds = (now - lastUpdatedDate) / 1000;

    if (diffSeconds > CACHE_DURATION_SECONDS) {
      console.log(`Stale data for ${tickersymbol}, Fetching from API...`);

      try {
        const { currPrice, percentChange } = await getLivePrice(tickersymbol);

        await pool.query(
          "UPDATE Stocks SET CurrentPrice = $1, LastPriceUpdate = NOW(), priceChangePercent = $2 WHERE StockID = $3",
          [currPrice, percentChange, stockId]
        );

        console.log(`${tickersymbol} updated to $${currPrice}`);
      } catch (err) {
        console.warn(
          `API Failed for ${tickersymbol}, proceeding with old data.`
        );
      }
    } else {
      console.log(`Cache Hit for ${tickersymbol}. No API call needed.`);
    }

    const stock = await pool.query("SELECT * FROM get_stock_details($1, $2)", [
      stockId,
      userId,
    ]);
    res.json(stock);
  } catch (error) {
    console.error("Error fetching stock details:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching stock details" });
  }
};
