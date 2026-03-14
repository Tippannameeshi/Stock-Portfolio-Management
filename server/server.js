import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/database.js";
import authMiddleware from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import adminRoutes from "./routes/admin.js";
import fundsRoutes from "./routes/funds.js";
import historyRoutes from "./routes/history.js";
import marketRoutes from "./routes/market.js";
import tradeRoutes from "./routes/trade.js";
import watchlistRoutes from "./routes/watchlist.js";
// import "./worker.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

pool.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to the database");
  }
});

//public routes (no auth required)
app.use("/api/auth", authRoutes);

//protected routes (auth required)
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/market", authMiddleware, marketRoutes);
app.use("/api/trade", authMiddleware, tradeRoutes);
app.use("/api/history", authMiddleware, historyRoutes);
app.use("/api/watchlist", authMiddleware, watchlistRoutes);
app.use("/api/funds", authMiddleware, fundsRoutes);
app.use("/api/history", authMiddleware, historyRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
