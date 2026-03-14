import express from "express";
import { getFunds, getHistory, updateFunds } from "../controllers/funds.js";

const router = express.Router();

router.get("/", getFunds);
router.post("/", updateFunds);
router.get("/history", getHistory);

export default router;
