import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [{ data }, { data: count }] = await Promise.all([
        api.notifications.list(token, { limit: 30 }),
        api.notifications.unreadCount(token),
      ]);
      setItems(data);
      setUnread(count.count);
    } catch (e) {
      console.error("Notification fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // initial load + polling fallback
  useEffect(() => {
    if (!user || !token) return;
    const initialRefreshId = setTimeout(refresh, 0);
    const id = setInterval(refresh, 30000); // poll every 30s
    return () => {
      clearTimeout(initialRefreshId);
      clearInterval(id);
    };
  }, [user, token, refresh]);

  const markRead = async (id) => {
    const item = items.find((n) => n.id === id);
    if (!item || item.read_at) return;
    // optimistic
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    setUnread((c) => Math.max(0, c - 1));
    try {
      await api.notifications.markRead(token, id);
    } catch {
      refresh();
    }
  };

  const markAllRead = async () => {
    setItems((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at || new Date().toISOString(),
      })),
    );
    setUnread(0);
    try {
      await api.notifications.markAllRead(token);
    } catch {
      refresh();
    }
  };

  return (
    <NotificationContext.Provider
      value={{ items, unread, loading, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// This hook intentionally lives with its context provider; keep the export
// explicit so existing consumers can continue importing it from this module.
// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  return ctx;
};
