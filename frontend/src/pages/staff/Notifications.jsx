import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiAlertTriangle, FiBell, FiCheckCircle, FiClipboard, FiFilter, FiRefreshCw } from "react-icons/fi";

const API_BASE = "http://localhost:5000/api";

const TAB_DEFS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "duties", label: "Duties" },
  { key: "leave", label: "Leave" },
  { key: "festival", label: "Festival" },
  { key: "inventory", label: "Inventory" },
  { key: "attendance", label: "Attendance" },
];

const CATEGORY_LABELS = {
  duties: "Duty",
  leave: "Leave",
  festival: "Festival",
  inventory: "Inventory",
  attendance: "Attendance",
  pooja: "Pooja",
  support: "Support",
};

const ACTION_MAP = {
  duties: { label: "View Duty", section: "duties" },
  leave: { label: "View Leave", section: "leaveRequests" },
  festival: { label: "View Festival", section: "dashboard" },
  inventory: { label: "View Request", section: "inventory" },
  attendance: { label: "View Attendance", section: "dashboard" },
  pooja: { label: "View Support", section: "poojaSupport" },
  support: { label: "View Support", section: "poojaSupport" },
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getNotificationCategory = (notification = {}) => {
  const category = normalizeText(notification.category);
  if (["task", "duty", "duties"].includes(category)) return "duties";
  if (category === "leave") return "leave";
  if (["festival", "event"].includes(category)) return "festival";
  if (category === "inventory") return "inventory";
  if (category === "attendance") return "attendance";
  if (["pooja", "support", "pooja-support"].includes(category)) return "pooja";

  const combined = `${normalizeText(notification.title)} ${normalizeText(notification.message)}`;
  if (combined.includes("leave")) return "leave";
  if (combined.includes("festival")) return "festival";
  if (combined.includes("inventory")) return "inventory";
  if (combined.includes("attendance") || combined.includes("check-in")) return "attendance";
  if (combined.includes("duty") || combined.includes("task")) return "duties";
  if (combined.includes("support") || combined.includes("pooja")) return "pooja";

  return "duties";
};

const getPriority = (notification = {}) => {
  const category = getNotificationCategory(notification);
  const combined = `${normalizeText(notification.title)} ${normalizeText(notification.message)}`;

  if (combined.includes("warning") || combined.includes("tomorrow") || combined.includes("late")) {
    return { tone: "high", label: "High Priority", icon: FiAlertTriangle };
  }

  if (category === "attendance") {
    return { tone: "medium", label: "Medium Priority", icon: FiAlertTriangle };
  }

  if (combined.includes("approved") || combined.includes("completed")) {
    return { tone: "normal", label: "Normal", icon: FiCheckCircle };
  }

  return { tone: "normal", label: "Normal", icon: FiClipboard };
};

const formatGroupLabel = (group) => CATEGORY_LABELS[group] || group;

const getDisplayTime = (value) => {
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

const Notifications = ({ staffId, onUnreadCountChange, onQuickAction }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  const normalizedNotifications = useMemo(
    () =>
      notifications
        .map((notification) => ({
          ...notification,
          type: getNotificationCategory(notification),
          priority: getPriority(notification),
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0).getTime();
          const dateB = new Date(b.date || b.createdAt || 0).getTime();
          return dateB - dateA;
        }),
    [notifications]
  );

  const notificationCounts = useMemo(
    () =>
      normalizedNotifications.reduce(
        (summary, notification) => {
          summary.all += 1;
          if (!notification.read) summary.unread += 1;
          if (summary[notification.type] != null) summary[notification.type] += 1;
          return summary;
        },
        { all: 0, unread: 0, duties: 0, leave: 0, festival: 0, inventory: 0, attendance: 0 }
      ),
    [normalizedNotifications]
  );

  const visibleNotifications = useMemo(() => {
    if (activeTab === "all") return normalizedNotifications;
    if (activeTab === "unread") return normalizedNotifications.filter((notification) => !notification.read);
    return normalizedNotifications.filter((notification) => notification.type === activeTab);
  }, [activeTab, normalizedNotifications]);

  const summaryCards = useMemo(
    () => [
      { label: "Unread Notifications", value: notificationCounts.unread, tone: "red" },
      { label: "Duty Notifications", value: notificationCounts.duties, tone: "orange" },
      { label: "Leave Notifications", value: notificationCounts.leave, tone: "green" },
      { label: "Festival Notifications", value: notificationCounts.festival, tone: "violet" },
    ],
    [notificationCounts]
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

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

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
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to mark notification as read");
    } finally {
      setMarkingId("");
    }
  };

  const handleQuickAction = (notification) => {
    const action = ACTION_MAP[notification.type];
    if (!action) return;

    if (action.section === "dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    onQuickAction?.(action.section);
  };

  return (
    <section className="notifications-page">
      <div className="notifications-head">
        <div>
          <h2>Notifications</h2>
          <p>Temple duty updates, leave decisions, and staff announcements.</p>
        </div>
        <div className="notifications-head-actions">
          <button type="button" className="ghost-action" onClick={loadNotifications} disabled={loading}>
            <FiRefreshCw />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="notification-summary-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className="notification-summary-card">
            <span className={`summary-icon ${card.tone}`}>
              <FiBell />
            </span>
            <div>
              <strong>{String(card.value).padStart(2, "0")}</strong>
              <p>{card.label}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="notification-tabs" role="tablist" aria-label="Notification categories">
        {TAB_DEFS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? "notification-tab active" : "notification-tab"}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.label}</span>
            <strong>{String(notificationCounts[tab.key] ?? notificationCounts.all).padStart(2, "0")}</strong>
          </button>
        ))}
      </div>

      {error ? <div className="staff-error">{error}</div> : null}

      {loading ? <div className="staff-loading">Loading notifications...</div> : null}

      {!loading && notifications.length === 0 ? (
        <div className="notifications-empty">
          <FiBell />
          <h3>No notifications yet</h3>
          <p>New task, leave, festival, attendance, and inventory updates will appear here.</p>
        </div>
      ) : null}

      {!loading && notifications.length > 0 && visibleNotifications.length === 0 ? (
        <div className="notifications-empty">
          <FiFilter />
          <h3>No notifications in this tab</h3>
          <p>Try another category or switch back to All.</p>
        </div>
      ) : null}

      {!loading && visibleNotifications.length > 0 ? (
        <div className="notification-list">
          {visibleNotifications.map((notification) => {
            const action = ACTION_MAP[notification.type];
            const PriorityIcon = notification.priority.icon;

            return (
              <article
                key={notification._id}
                onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                className={`notification-card ${notification.read ? "" : "unread"} priority-${notification.priority.tone} ${!notification.read ? "cursor-pointer" : ""}`}
              >
                <div className={`notification-icon ${notification.type}`}>
                  <PriorityIcon />
                </div>
                <div className="notification-content">
                  <div className="notification-title-row">
                    <div>
                      <span className="notification-type-chip">{formatGroupLabel(notification.type)}</span>
                      <h3>{notification.title}</h3>
                    </div>
                    <span className={notification.read ? "read-status" : notification.viewed ? "read-status viewed" : "read-status unread"}>
                      {notification.read ? "Read" : notification.viewed ? "Viewed" : "Unread"}
                    </span>
                  </div>
                  <p>{notification.message}</p>
                  <div className="notification-meta">
                    <time>{getDisplayTime(notification.date || notification.createdAt)}</time>
                    <span className={`priority-badge ${notification.priority.tone}`}>
                      <PriorityIcon />
                      {notification.priority.label}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {action ? (
                    <button type="button" className="view-action-btn" onClick={(e) => { e.stopPropagation(); handleQuickAction(notification); }}>
                      {action.label}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default Notifications;
