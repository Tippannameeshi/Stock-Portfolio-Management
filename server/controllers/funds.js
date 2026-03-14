import pool from "../config/database.js";

export const getFunds = async (req, res) => {
  const { user_id: userId } = req.user;
  try {
    console.log(userId);
    const funds = await pool.query(
      "SELECT cashbalance FROM users WHERE userId=$1",
      [userId]
    );
    res.json(funds.rows[0]);
  } catch (error) {
    console.error("Error fetching funds:", error);
    res.status(500).json({ success: false, message: "Error fetching funds" });
  }
};

export const updateFunds = async (req, res) => {
  const { user_id: userId } = req.user;
  console.log();
  const { amount, transactionType } = req.body;
  try {
    await pool.query("CALL update_cash_balance($1, $2, $3)", [
      userId,
      transactionType,
      amount,
    ]);
    res.json({
      success: true,
      message: `${transactionType} of ${amount} successfull`,
    });
  } catch (error) {
    console.error("Error updating funds:", error);
    res.status(500).json({ success: false, message: "Error updating funds" });
  }
};

export const getHistory = async (req, res) => {
  const { user_id: userId } = req.user;
  try {
    const history = await pool.query(
      "SELECT * FROM get_wallet_transactions($1)",
      [userId]
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching funds:", error);
    res.status(500).json({ success: false, message: "Error fetching funds" });
  }
};
