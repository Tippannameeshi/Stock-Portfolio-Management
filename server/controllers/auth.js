import pool from "../config/database.js";
import { createToken } from "../utils/jwt.js";
import { verifyPassword, hashPassword } from "../utils/hashing.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      "SELECT * FROM register_user($1, $2, $3) AS result",
      [name, email, hashedPassword]
    );

    if (result.rows.length == 0) {
      return res
        .status(400)
        .json({ sucess: false, error: "User registration failed" });
    }
    const temp_res = result.rows[0].result;

    console.log(temp_res);

    res.json({
      success: temp_res.success,
      message: temp_res.message,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM login_user($1)", [email]);
    console.log("pool done");
    if (result.rows.length == 0) {
      return res.status(400).json({
        success: false,
        error: "User not found, please try registering",
      });
    }

    const user = result.rows[0];

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        error: "Your account has been suspended. Please contact admin.",
      });
    }

    if (user.status === "INACTIVE") {
      return res.status(403).json({
        success: false,
        error:
          "Your account is deactivated. Please contact admin to reactivate.",
      });
    }
    const hashedPassword = user.hashedpassword;

    const match = await verifyPassword(password, hashedPassword);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Password" });
    }

    const token = createToken(user);

    res.json({
      success: true,
      message: "User logged in successfully",
      token: token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.userrole,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { role: userRole } = req.user;

    console.log(userRole);

    if (userRole === "ADMIN") {
      console.log(userRole);
      return res.status(403).json({
        success: false,
        error: "Admins are not allowed to deactivate their own account",
      });
    }

    await pool.query("UPDATE users SET status = $1 WHERE userid = $2", [
      "INACTIVE",
      userId,
    ]);

    res.json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to deactivate account" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { role: userRole } = req.user;

    if (userRole === "ADMIN") {
      console.log(userRole);
      return res.status(403).json({
        success: false,
        error: "Admins are not allowed to delete their own account",
      });
    }

    const result = await pool.query("SELECT * FROM delete_user($1);", [userId]);

    const response = result.rows[0].delete_user;

    console.log(response);

    if (response.success) {
      res.json({
        success: true,
        message: response.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.error,
      });
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ success: false, error: "Failed to delete account" });
  }
};
