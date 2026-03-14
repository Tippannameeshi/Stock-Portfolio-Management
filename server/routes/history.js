import express from "express";
import { getTradeHistory } from "../controllers/history.js";

const router = express.Router();

router.get("/", getTradeHistory);

export default router;
