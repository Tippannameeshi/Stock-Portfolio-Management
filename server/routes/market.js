import express from "express";
import { getAllStocks, getStockById } from "../controllers/market.js";

const router = express.Router();

router.get("/stocks", getAllStocks);
router.get("/stocks/:stockId", getStockById);

export default router;
