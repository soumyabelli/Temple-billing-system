import { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import EmailNotificationsView from "../../components/shared/EmailNotificationsView";

const API_BASE = "http://localhost:5000/api";

const Notifications = ({ staffId, onUnreadCountChange, onQuickAction }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  const loadNotifications = useCallback(async () => {
    if (!staffId) return;

    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE}/staff/notifications/${staffId}`);
      const notificationList = Array.isArray(response.data?.notifications) ? response.data.notifications : [];
      setNotifications(notificationList);

      const hasUnviewed = notificationList.some((notification) => !notification.viewed);
      if (hasUnviewed) {
        await axios.patch(`${API_BASE}/staff/notifications/${staffId}/view-all`);
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            viewed: true,
            viewedAt: notification.viewedAt || new Date().toISOString(),
          }))
        );
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setError("");
      await axios.patch(`${API_BASE}/staff/notifications/read/${notificationId}`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true, readAt: notification.readAt || new Date().toISOString() }
            : notification
        )
      );
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to mark notification as read");
    }
  };

  return (
    <div className="p-6">
      <EmailNotificationsView
        title="Staff Notifications"
        subtitle="Temple duty updates, leave decisions, and staff announcements."
        notifications={notifications}
        loading={loading}
        error={error}
        onMarkRead={handleMarkAsRead}
        onRefresh={loadNotifications}
      />
    </div>
  );
};

export default Notifications;
