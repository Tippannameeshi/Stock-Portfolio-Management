// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";
import { api } from "../services/apiService";

const AuthContext = createContext(null);

const extractUserFromPayload = (payload = {}) => {
  
  // Support multiple shapes: payload.user, payload.data, flat payload etc.
  const source =
    payload.user ||
    payload.data ||
    payload.dashboard ||
    payload.payload ||
    payload;

  const user_id =
    source.user_id || source.userId || source.id || source.user_id_alt || null;
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

  const role =
    source.role ||
    (source.user && (source.user.role || source.user.user_role)) ||
    null;

  return {
    user_id,
    name,
    email,
    cashBalance,
    role,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = authService.getStoredUser
      ? authService.getStoredUser()
      : null;
    if (localUser) {
      // set minimal optimistic user state (fields normalized)
      setUser({
        user_id: localUser.user_id,
        name: localUser.name || null,
        email: localUser.email || null,
        cashBalance: localUser.cashBalance || 0,
        role: localUser.role,
      });
    }
    // If there's a token stored, try to load dashboard; otherwise finish loading.
    const init = async () => {
      if (authService.isAuthenticated()) {
        try {
          await loadDashboard();
        } catch (err) {
          // loadDashboard already handles logout on failure, but ensure loading ends
          console.error("Initial dashboard load failed:", err);
        }
      } else {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Helpful debug log so you can confirm token reaches server-side
      console.log("loadDashboard: token present?", !!authService.getToken());

      // api.getDashboard should throw for non-2xx or return parsed JSON
      const res = await api.getDashboard();

      // Support both wrapper shapes:
      // - { success: true, data: {...} }
      // - {...} (payload directly)
      const payload = res && res.success && res.data ? res.data : res;

      if (!payload) {
        throw new Error("Empty dashboard payload");
      }

      // If API uses a success:false + error pattern
      if (res && res.success === false) {
        // If unauthenticated, force logout; otherwise throw with server message
        const errMsg = res.error || res.message || "Failed to load dashboard";
        console.warn("Dashboard API reported failure:", errMsg);
        // If you want to treat all failures as logout, uncomment next line:
        // logout();
        throw new Error(errMsg);
      }

      // Save raw dashboard data
      setDashboardData(payload);

      // Normalize & set user (support many possible field names)
      const normalizedUser = extractUserFromPayload(payload);

      // If normalizedUser has at least an id or email, set user; otherwise preserve existing user or set null
      if (normalizedUser.user_id) {
        setUser({
          user_id: normalizedUser.user_id,
          name: normalizedUser.name,
          email: normalizedUser.email,
          cashBalance: normalizedUser.cashBalance || 0,
          role: normalizedUser.role,
        });
      } else {
        // no useful user info in dashboard payload
        // keep existing user (if previously set) or leave null
        setUser((prev) => prev || null);
      }
    } catch (error) {
      console.error("Dashboard load failed:", error);
      // If the error looks like an auth error or token missing, clear session
      // We'll be conservative: logout on any error so UI returns to login flow
      logout();
      // Rethrow if callers need to know (login uses await loadDashboard())
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    // userData usually comes from the login response (Login.jsx calls authService.setToken before calling login)
    // Set minimal user info immediately for optimistic UI
    if (userData) {
      setUser(userData);
    }

    // Ensure token is present before loading dashboard
    if (!authService.isAuthenticated()) {
      console.warn(
        "login called but authService reports not authenticated (no token)."
      );
      // still attempt loadDashboard; loadDashboard checks token and will handle failure
    }

    // Load user-specific dashboard data (this will also update the user with normalized fields from the server)
    await loadDashboard();
  };

  const logout = () => {
    // name of your method — you used removeToken elsewhere
    if (typeof authService.removeToken === "function") {
      authService.removeToken();
    } else if (typeof authService.clearToken === "function") {
      authService.clearToken();
    } else if (typeof authService.setToken === "function") {
      // fallback: overwrite with null if no removeToken
      authService.setToken(null);
    }

    setUser(null);
    setDashboardData(null);
  };

  const refreshDashboard = async () => {
    return await loadDashboard();
  };

  const isAdmin = () => user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        dashboardData,
        loading,
        login,
        logout,
        refreshDashboard,
        // expose authService check as canonical source of truth
        isAuthenticated: authService.isAuthenticated(),
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
