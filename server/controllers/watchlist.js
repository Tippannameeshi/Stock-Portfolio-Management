import pool from "../config/database.js";

export const getWatchListDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlist = await pool.query(
      "SELECT * FROM get_watchlist_details($1)",
      [userId]
    );
    res.json(watchlist);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching watchlist" });
  }
};

export const updateWatchlist = async (req, res) => {
  const { ticker } = req.params;
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM update_watchlist($1, $2)",
      [userId, ticker]
    );
    if (result) {
      console.log(result.rows[0].sp_updatewatchlist);
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating watchlist" });
  }
};
