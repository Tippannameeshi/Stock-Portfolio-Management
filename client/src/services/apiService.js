import { API_BASE_URL } from "../config/constants";
import { authService } from "./authService";

const apiRequest = async (endpoint, options = {}) => {
  const token = authService.getToken();
  const userId = authService.getUserIdFromToken
    ? authService.getUserIdFromToken()
    : null;
  const userRole = authService.getUserRoleFromToken
    ? authService.getUserRoleFromToken()
    : null;

  console.log(userRole);
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let body = options.body;

  try {
    if (userId) {
      // FormData handling
      if (body instanceof FormData) {
        if (!body.has("user_id") && !body.has("userId")) {
          body.append("user_id", String(userId));
        }
        if (userRole && !body.has("user_role") && !body.has("userRole")) {
          body.append("user_role", userRole);
        }
        // For FormData, Content-Type should NOT be application/json
        // Remove Content-Type so browser sets the right multipart boundary
        delete headers["Content-Type"];
      } else {
        // If body is a string, try to parse JSON and merge
        if (typeof body === "string" && body.trim().length > 0) {
          try {
            const parsed = JSON.parse(body);
            if (parsed && typeof parsed === "object") {
              if (!parsed.user_id && !parsed.userId) parsed.user_id = userId;
              if (userRole && !parsed.user_role && !parsed.userRole)
                parsed.user_role = userRole;
              body = JSON.stringify(parsed);
            } else {
              // not an object -> wrap it
              body = JSON.stringify({
                payload: parsed,
                user_id: userId,
                ...(userRole && { user_role: userRole }),
              });
            }
          } catch (err) {
            // body is a plain string that's not JSON -> wrap it
            body = JSON.stringify({
              payload: body,
              user_id: userId,
              ...(userRole && { user_role: userRole }),
            });
          }
        } else if (body && typeof body === "object") {
          // already an object (caller passed a plain object) -> merge then stringify
          const merged = { ...(body || {}) };
          if (!merged.user_id && !merged.userId) merged.user_id = userId;

          if (userRole && !merged.user_role && !merged.userRole)
            body = JSON.stringify(merged);
        } else {
          // no body provided -> create one with user_id
          body = JSON.stringify({ user_id: userId, user_role: userRole });
        }
        // ensure JSON content type
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
      }
    } else {
      // no userId found: keep existing body as-is (do not modify)
      if (typeof body === "object" && !(body instanceof FormData)) {
        // If caller passed object, stringify it so fetch can send it
        body = JSON.stringify(body);
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
      }
    }
  } catch (err) {
    console.warn(
      "apiRequest: failed to attach user_id/ user_role to request body",
      err
    );
    // fall back to original body; still proceed
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  //Admin - User Management
  getAllUsers: (params) =>
    apiRequest(`/admin/users?${new URLSearchParams(params)}`),

  getPendingReactivations: () => apiRequest("/admin/users/pending"),

  updateUserStatus: (userId, status) =>
    apiRequest(`/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // Admin - Stock Management
  addStock: (data) =>
    apiRequest("/admin/stocks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStockPrice: (stockId, currentPrice) =>
    apiRequest(`/admin/stocks/${stockId}/price`, {
      method: "PUT",
      body: JSON.stringify({ currentPrice }),
    }),

  deleteStock: (stockId) =>
    apiRequest(`/admin/stocks/${stockId}`, {
      method: "DELETE",
    }),

  // Auth
  register: async (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: async (data) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deactivateAccount: async () => {
    apiRequest("/auth/deactivate", {
      method: "PATCH",
    });
  },

  deleteAccount: async () => {
    return apiRequest("/auth/delete", {
      method: "DELETE",
    });
  },
  // Dashboard
  getDashboard: async () => apiRequest("/dashboard"),

  // Stocks
  getAllStocks: async () => apiRequest("/market/stocks"),
  getStockById: async (id) => apiRequest(`/market/stocks/${id}`),

  // Funds
  getFunds: async () => apiRequest("/funds"),
  updateFunds: async (data) =>
    apiRequest("/funds", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getWalletTransactions: async () => apiRequest("/funds/history"),

  // Trade
  executeTrade: async (data) =>
    apiRequest("/trade", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Watchlist
  getWatchlist: async () => apiRequest("/watchlist"),
  updateWatchlist: async (ticker) =>
    apiRequest(`/watchlist/${ticker}`, {
      method: "POST",
    }),

  // History
  getTradeHistory: async () => apiRequest("/history"),
};
