import pool from "../config/database.js";

export const getTradeHistory = async (req, res) => {
  const { user_id: userId } = req.user;
  try {
    const history = await pool.query(
      "SELECT * FROM get_user_trade_history($1)",
      [userId]
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching trade history:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching trade history" });
  }
};
