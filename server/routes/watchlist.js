import express from "express";
import { getWatchListDetails, updateWatchlist } from "../controllers/watchlist.js";

const router = express.Router();

router.get("/", getWatchListDetails)
router.post("/:ticker", updateWatchlist)

export default router;
