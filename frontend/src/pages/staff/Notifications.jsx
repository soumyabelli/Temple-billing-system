import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiBell, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

const API_BASE = "http://localhost:5000/api";

const formatNotificationTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Notifications = ({ staffId, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState("");
  const [error, setError] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

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

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingId(notificationId);
      setError("");
      await axios.patch(`${API_BASE}/staff/notifications/read/${notificationId}`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true, readAt: notification.readAt || new Date().toISOString() }
            : notification
        )
      );
      onUnreadCountChange?.(Math.max(0, unreadCount - 1));
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to mark notification as read");
    } finally {
      setMarkingId("");
    }
  };

  return (
    <section className="notifications-page">
      <div className="notifications-head">
        <div>
          <h2>Notifications</h2>
          <p>Temple duty updates, leave decisions, and staff announcements.</p>
        </div>
        <button type="button" onClick={loadNotifications} disabled={loading}>
          <FiRefreshCw />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <div className="staff-error">{error}</div> : null}

      {loading ? <div className="staff-loading">Loading notifications...</div> : null}

      {!loading && notifications.length === 0 ? (
        <div className="notifications-empty">
          <FiBell />
          <h3>No notifications yet</h3>
          <p>New task, leave, festival, and inventory updates will appear here.</p>
        </div>
      ) : null}

      {!loading && notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={notification.read ? "notification-card" : "notification-card unread"}
            >
              <div className="notification-icon">
                <FiBell />
              </div>
              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>
                  <span className={notification.read ? "read-status" : notification.viewed ? "read-status viewed" : "read-status unread"}>
                    {notification.read ? "Read" : notification.viewed ? "Viewed" : "Unread"}
                  </span>
                </div>
                <p>{notification.message}</p>
                <time>{formatNotificationTime(notification.date || notification.createdAt)}</time>
              </div>
              <button
                type="button"
                onClick={() => handleMarkAsRead(notification._id)}
                disabled={notification.read || markingId === notification._id}
                className="mark-read-btn"
              >
                <FiCheckCircle />
                {notification.read ? "Read" : "Mark as Read"}
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Notifications;
