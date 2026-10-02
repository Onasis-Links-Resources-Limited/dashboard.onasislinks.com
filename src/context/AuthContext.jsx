/* The context and hook are intentionally colocated; suppress the Fast Refresh export warning. */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(token));
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    // Clean up any stale "null"/"undefined" values from a previous bug
    const storedToken = localStorage.getItem("token");
    if (!storedToken || storedToken === "null" || storedToken === "undefined") {
      return;
    }

    // If we have a token, verify it with the backend
    const loadUser = async () => {
      try {
        const response = await api.auth.getProfile(storedToken);

        if (response.success) {
          setUser(response.data);
        } else {
          // Server explicitly says the token is bad → clean up
          console.warn("Profile load failed:", response.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        // ✅ Network error ≠ invalid token. DON'T wipe on network errors.
        console.error("Failed to load user (network):", error);
        // keep the token, just don't set user
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []); // ✅ empty deps — run once on mount, not on every token change

  const login = async (email, password) => {
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
  } catch (error) {
    console.error("Login error:", error);
    setError("Network error. Please try again.");
    return { success: false, error: "Network error" };
  }
};

  const logout = async () => {
    try {
      if (token) {
        await api.auth.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const updateGlobalUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      // Persist to localStorage so refresh doesn't lose it
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

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
