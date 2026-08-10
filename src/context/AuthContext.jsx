/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { STORAGE_KEYS } from '../constants/config';
import { ROLES } from '../constants/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
      setToken(authToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const permissions = {
      [ROLES.ADMIN]: {
        canManageProducts: true,
        canManageCategories: true,
        canManageUsers: true,
        canManageRoles: true,
        canManageQuotes: true,
        canViewAnalytics: true,
        canDeleteAny: true,
        canEditAny: true,
      },
      [ROLES.MANAGER]: {
        canManageProducts: true,
        canManageCategories: true,
        canManageUsers: false,
        canManageRoles: false,
        canManageQuotes: true,
        canViewAnalytics: true,
        canDeleteAny: false,
        canEditAny: true,
      },
      [ROLES.SALES]: {
        canManageProducts: false,
        canManageCategories: false,
        canManageUsers: false,
        canManageRoles: false,
        canManageQuotes: true,
        canViewAnalytics: false,
        canDeleteAny: false,
        canEditAny: false,
      },
      [ROLES.USER]: {
        canManageProducts: false,
        canManageCategories: false,
        canManageUsers: false,
        canManageRoles: false,
        canManageQuotes: false,
        canViewAnalytics: false,
        canDeleteAny: false,
        canEditAny: false,
      },
    };

    return permissions[user.role]?.[permission] || false;
  };

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === ROLES.ADMIN,
    isManager: user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};