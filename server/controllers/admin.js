import pool from "../config/database.js";

export const getAllUsers = async (req, res) => {
  try {
    const { status = "ACTIVE", search = "", page = 1, limit = 20 } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_all_users($1, $2, $3, $4)`,
      [status, search, parseInt(page), parseInt(limit)]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: +page, limit: +limit, total: 0 },
      });
    }

    const total = parseInt(rows[0].total_count);

    res.json({
      success: true,
      data: rows.map(({ total_count, ...r }) => r),
      pagination: {
        page: +page,
        limit: +limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be ACTIVE, INACTIVE, or SUSPENDED",
      });
    }

    // Prevent admin from changing their own status
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "Cannot change your own account status",
      });
    }

    const result = await pool.query(
      "CALL update_user_status($1, $2, $3, $4, $5, $6)",
      [userId, status, req.user.id, null, null, null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const resultRow = result.rows[0];
    const success = resultRow.p_success;
    const message = resultRow.p_message;
    const error = resultRow.p_error;

    if (!success) {
      return res.status(400).json({ success, error });
    }

    res.json({ success, message });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getPendingReactivations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT UserID, Name, Email, CashBalance, registrationDate
       FROM Users 
       WHERE Status IN ('INACTIVE', 'SUSPENDED')
       ORDER BY registrationDate DESC`
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching pending reactivations:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const addStock = async (req, res) => {
  try {
    const { tickerSymbol, companyName, logoUrl, industry, currentPrice } =
      req.body;

    if (
      !tickerSymbol ||
      !companyName ||
      !logoUrl ||
      !industry ||
      !currentPrice
    ) {
      return res.status(400).json({
        success: false,
        error:
          "All fields required: tickerSymbol, companyName, logoUrl, industry, currentPrice",
      });
    }

    const result = await pool.query(
      `SELECT * FROM add_stock($1, $2, $3, $4, $5)`,
      [tickerSymbol, companyName, logoUrl, industry, currentPrice]
    );

    res.json({
      success: true,
      message: "Stock added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding stock:", error);
    if (error.code === "23505") {
      // This catches the duplicate ticker symbol issue
      return res.status(400).json({
        success: false,
        error: `Stock with ticker symbol "${req.body.tickerSymbol}" already exists`,
      });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const updateStockPrice = async (req, res) => {
  try {
    const { stockId } = req.params;
    const { newPrice } = req.body;

    if (!newPrice || newPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid newPrice is required and must be > 0",
      });
    }

    // Fetch old price for calculating change
    const oldPriceResult = await pool.query(
      "SELECT currentprice FROM stocks WHERE stockid = $1",
      [stockId]
    );

    if (oldPriceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Stock not found",
      });
    }

    const oldPrice = parseFloat(oldPriceResult.rows[0].currentprice);
    const priceChangePercent =
      oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;

    // Update Stocks table
    const updatedStock = await pool.query(
      `UPDATE stocks
       SET currentprice = $1,
           lastpriceupdate = NOW(),
           pricechangepercent = $2
       WHERE stockid = $3
       RETURNING *`,
      [currentPrice, priceChangePercent, stockId]
    );

    // Insert into StockPrices table (log of price change)
    await pool.query(
      `INSERT INTO stockprices (stockid, price, asoftimestamp)
       VALUES ($1, $2, NOW())`,
      [stockId, newPrice]
    );

    res.json({
      success: true,
      message: "Stock and StockPrices updated successfully",
      data: updatedStock.rows[0],
    });
  } catch (error) {
    console.error("Error updating stock price:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { stockId } = req.params;

    // Check if stock has any trades
    const tradesCheck = await pool.query(
      "SELECT COUNT(*) FROM transactionsledger WHERE stockid = $1",
      [stockId]
    );

    if (parseInt(tradesCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete stock with existing trades",
      });
    }

    // Delete from stockprices first (child table)
    await pool.query("DELETE FROM stockprices WHERE stockid = $1", [stockId]);

    // 3️⃣ Delete from stocks (parent table)
    const result = await pool.query(
      "DELETE FROM stocks WHERE stockid = $1 RETURNING *",
      [stockId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Stock not found",
      });
    }

    res.json({
      success: true,
      message: "Stock and related price records deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
