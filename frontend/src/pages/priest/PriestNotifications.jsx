import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, readNotification, readAllNotifications } from "../../services/priestService";
import EmailNotificationsView from "../../components/shared/EmailNotificationsView";

const PriestNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(false);
    const interval = setInterval(() => loadNotifications(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id) => {
    try {
      await readNotification(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true, viewed: true } : n))
      );
    } catch (err) {
      console.warn("Failed to mark notification as read", err);
    }
  };

  const handleReadAll = async () => {
    try {
      await readAllNotifications();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, viewed: true })));
    } catch (err) {
      console.warn("Failed to mark all as read", err);
    }
  };

  return (
    <div className="p-6">
      <EmailNotificationsView
        title="Priest Notifications & Email Inbox"
        subtitle=""
        userEmail={user?.email}
        notifications={notifications}
        loading={loading}
        error={error}
        onMarkRead={handleRead}
        onMarkAllRead={handleReadAll}
        onRefresh={loadNotifications}
      />
    </div>
  );
};

export default PriestNotifications;
