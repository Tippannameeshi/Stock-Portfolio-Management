import pool from "../config/database.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM get_dashboard_data($1) AS dashboard",
      [userId]
    );

    const dashboard = result.rows[0]?.dashboard ?? null;

    if (!dashboard) {
      return res
        .status(404)
        .json({ success: false, error: "Dashboard not found" });
    }

    return res.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
