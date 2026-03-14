// test-api.js
import dotenv from "dotenv";
import { getLivePrice } from "./utils/stockUtils.js";

dotenv.config();

console.log("Testing Finnhub Connection...");

try {
  const { currPrice, percentChange } = await getLivePrice("AAPL");
  console.log(`Success! Apple Price is: $${currPrice} ${percentChange}%`);
} catch (error) {
  console.error("Error:", error.message);
}
