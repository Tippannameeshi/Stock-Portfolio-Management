import pool from "../config/database.js";
import { getLivePrice } from "../utils/stockUtils.js";

export const executeTrade = async (req, res) => {
  // const userId = req.user.id;
  const { userId, ticker, quantity, tradeType } = req.body;
  try {
    //fetch real time price
    const { currPrice, percentChange } = await getLivePrice(ticker);

    const result = await pool.query(
      "SELECT * FROM execute_trade($1, $2, $3, $4, $5)",
      [userId, ticker, quantity, tradeType, currPrice]
    );

    await pool.query(
      "UPDATE stocks SET currentprice = $1, lastpriceupdate = NOW(), pricechangepercent = $2 WHERE tickersymbol = $3",
      [currPrice, percentChange, ticker]
    );

    res.json(result);
  } catch (error) {
    console.error("Error executing trade:", error);
    res.status(500).json({ success: false, message: "Error executing trade" });
  }
};
