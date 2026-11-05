/* The context and hook are intentionally colocated; suppress the Fast Refresh export warning. */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken || storedToken === "null" || storedToken === "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
    return storedToken;
  });
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(token));
  const [error, setError] = useState(null);


  // ─── Global auto-logout on 401 (dispatched by apiClient) ───
  useEffect(() => {
    const handleExpired = (event) => {
      const { code, message } = event.detail || {};

      // Clear all auth state
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Map backend codes to friendly messages
      const friendlyMessages = {
        NO_TOKEN: "Please sign in to continue.",
        TOKEN_EXPIRED: "Your session expired. Please sign in again.",
        TOKEN_INVALID: "Your session is invalid. Please sign in again.",
        USER_NOT_FOUND: "Your account is no longer available.",
        USER_DISABLED: "Your account has been disabled. Contact an administrator.",
      };

      const finalMessage =
        friendlyMessages[code] || message || "Please sign in again.";

      // Only show toast if we're not already on the login page
      if (!window.location.pathname.startsWith("/login")) {
        toast.error(finalMessage, { duration: 5000 });
      }

      const isAuthPage =
      window.location.pathname.startsWith("/login")

      if (!isAuthPage) {
      // ✅ Plain redirect — no router needed
      const currentPath = window.location.pathname + window.location.search;
      const encodedFrom = encodeURIComponent(currentPath);
      window.location.replace(`/login?from=${encodedFrom}`);
    }
    };

    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  // ─── Load user on mount (only verify if we have a token) ───
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken || storedToken === "null" || storedToken === "undefined") {
      return;
    }

    const loadUser = async () => {
      try {
        // api.auth.getProfile() no longer takes a token — the wrapper adds it
        const response = await api.auth.getProfile();

        if (response.success) {
          setUser(response.data);
        } else {
          // Server responded but with success: false (rare with apiFetch
          // since 401s are thrown and handled by auth:expired)
          console.warn("Profile load failed:", response.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (err) {
        // 401s are already handled by auth:expired listener.
        // Anything else (network/CORS) → keep the token, don't logout.
        console.error("Failed to load user:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await api.auth.staffLogin(email, password);

      if (response.success && response.data?.token) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        return { success: true };
      } else {
        setError(response.message || "Login failed");
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err?.message === "Failed to fetch"
          ? "Network error. Please try again."
          : err?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.auth.logout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [token]);

  const updateGlobalUser = useCallback((newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    updateUser,
    updateGlobalUser,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;