import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "authToken";

export const getStoredUser = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const decoded = jwtDecode(token); // throws if invalid
    // Support shapes: { user: {...} }, { data: {...} }, or flat
    const source =
      decoded.user ||
      decoded.data ||
      decoded.payload ||
      decoded.dashboard ||
      decoded;

    console.log(source);

    // try many possible id fields
    const user_id =
      source.user_id ||
      source.userId ||
      source.id ||
      (source.user && (source.user.user_id || source.user.id)) ||
      null;

    const name =
      source.name ||
      source.userName ||
      source.user_name ||
      (source.user && (source.user.name || source.user.userName)) ||
      null;

    const email =
      source.email ||
      (source.user && (source.user.email || source.user.user_email)) ||
      null;

    const cashBalance =
      source.cashBalance || source.cash_balance || source.balance || 0;

    const role = source.role;

    // token expiration check (exp in seconds)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      // token expired
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    if (!user_id) {
      // no user id in token -> treat as unauthenticated
      console.error("getStoredUser: token payload missing user id", decoded);
      return null;
    }

    return {
      user_id,
      name,
      email,
      cashBalance,
      role,
      rawPayload: decoded,
    };
  } catch (err) {
    console.error("getStoredUser: failed to decode token", err);
    localStorage.removeItem(TOKEN_KEY); // cleanup invalid token
    return null;
  }
};

export const getUserIdFromToken = () => {
  const u = getStoredUser();
  return u ? u.user_id : null;
};

export const getUserRoleFromToken = () => {
  const u = getStoredUser();
  return u ? u.role || null : null;
};

export const setToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => !!getStoredUser();

// default export kept for compatibility if you import authService
export const authService = {
  getStoredUser,
  getUserIdFromToken,
  getUserRoleFromToken,
  setToken,
  getToken,
  removeToken,
  isAuthenticated,
};
