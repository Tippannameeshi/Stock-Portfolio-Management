import express from "express";
import {
  registerUser,
  loginUser,
  deactivateUser,
  deleteUser,
} from "../controllers/auth.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.patch("/deactivate", authMiddleware, deactivateUser);
router.delete("/delete", authMiddleware, deleteUser);

export default router;
