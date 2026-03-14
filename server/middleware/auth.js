import { verifyToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);
    if (!decoded) {
      console.warn(
        "authMiddleware: verifyToken returned false for token:",
        token?.slice?.(0, 10)
      );
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Standardize the user object on req so controllers can read req.user.id
    const normalizedId =
      decoded.id || decoded.user_id || decoded.userId || null;

    req.user = { id: normalizedId, ...decoded };
    req.user_id = normalizedId;

    console.log(
      "authMiddleware: decoded token payload:",
      decoded,
      "normalizedId:",
      normalizedId
    );

    return next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};

export default authMiddleware;
