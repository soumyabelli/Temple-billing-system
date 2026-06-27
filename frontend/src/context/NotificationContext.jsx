import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { fetchNotifications, markNotificationRead } from "../services/cashierService";

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30_000; // poll every 30 seconds

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const userId = user?.id || user?._id || "";
  const isCashier = user?.role === "cashier";

  const loadNotifications = useCallback(async () => {
    if (!isCashier) return;
    setLoading(true);
    try {
      const rows = await fetchNotifications(userId);
      setNotifications(rows);
    } catch (_) {
      // silently fail — we don't want the polling to crash the app
    } finally {
      setLoading(false);
    }
  }, [userId, isCashier]);

  // Initial load + polling
  useEffect(() => {
    if (!isCashier) return;
    loadNotifications();
    timerRef.current = setInterval(loadNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [isCashier, loadNotifications]);

  const markRead = useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );
    } catch (_) {}
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, loadNotifications, markRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
