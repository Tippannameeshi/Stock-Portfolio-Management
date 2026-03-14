import jwt from "jsonwebtoken";

const createToken = (user) => {
  // Create a payload with all the data we need on the frontend
  const payload = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.userrole,
    // Add any other static user data you need (e.g., 'isAdmin: user.isAdmin')
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export { createToken, verifyToken };
