import express from "express";
import {
  addStock,
  deleteStock,
  getAllUsers,
  getPendingReactivations,
  updateStockPrice,
  updateUserStatus,
} from "../controllers/admin.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/pending", getPendingReactivations);
router.put("/users/:userId/status", updateUserStatus);

router.post("/stocks", addStock);
router.put("/stocks/:stockId/price", updateStockPrice);
router.delete("/stocks/:stockId", deleteStock);

export default router;
