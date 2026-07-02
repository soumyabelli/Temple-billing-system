import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiAlertTriangle, FiBell, FiCheckCircle, FiClipboard, FiFilter, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getSupportRequests } from "../../services/devoteeService";
import "../staff/StaffDashboard.css"; // Import styles used by staff notifications

const API_BASE = "http://localhost:5000/api";

const TAB_DEFS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "support", label: "Support Requests" },
  { key: "alerts", label: "Admin Alerts" },
];

const CATEGORY_LABELS = {
  support: "Support",
  alerts: "System Alert",
};

const getPriority = (type, item) => {
  if (type === "support") {
    const text = `${item.subject || ""} ${item.message || ""}`.toLowerCase();
    if (text.includes("urgent") || text.includes("issue") || text.includes("payment")) {
      return { tone: "high", label: "High Priority", icon: FiAlertTriangle };
    }
    return { tone: "medium", label: "Support", icon: FiClipboard };
  } else {
    return { tone: "normal", label: "System Notification", icon: FiBell };
  }
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

const NotificationsCenter = ({ darkMode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const adminId = user?._id || user?.id || JSON.parse(localStorage.getItem("user") || "null")?._id;
      if (!adminId) return;
      const [nRes, sRes] = await Promise.all([
        axios.get(`${API_BASE}/notifications/admin/${adminId}`),
        getSupportRequests(),
      ]);
      setNotifications(Array.isArray(nRes.data) ? nRes.data : []);
      setSupportRequests(sRes.requests || []);
    } catch (error) {
      console.warn("Unable to load notifications center", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const normalizedNotifications = useMemo(() => {
    const combined = [
      ...supportRequests.map(req => ({
        ...req,
        type: "support",
        displayTitle: req.subject,
        displayMessage: `${req.name} (${req.email}): ${req.message}`,
        dateObj: new Date(req.createdAt || Date.now()),
        isRead: req.read,
        priority: getPriority("support", req)
      })),
      ...notifications.map(notif => ({
        ...notif,
        type: "alerts",
        displayTitle: notif.title,
        displayMessage: notif.message,
        dateObj: new Date(notif.date || notif.createdAt || Date.now()),
        isRead: notif.read || notif.viewed,
        priority: getPriority("alerts", notif)
      }))
    ];

    return combined.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [notifications, supportRequests]);

  const notificationCounts = useMemo(() => {
    return normalizedNotifications.reduce((summary, item) => {
      summary.all += 1;
      if (!item.isRead) summary.unread += 1;
      if (item.type === "support") summary.support += 1;
      if (item.type === "alerts") summary.alerts += 1;
      return summary;
    }, { all: 0, unread: 0, support: 0, alerts: 0 });
  }, [normalizedNotifications]);

  const visibleNotifications = useMemo(() => {
    if (activeTab === "all") return normalizedNotifications;
    if (activeTab === "unread") return normalizedNotifications.filter((item) => !item.isRead);
    return normalizedNotifications.filter((item) => item.type === activeTab);
  }, [activeTab, normalizedNotifications]);

  const summaryCards = useMemo(() => [
    { label: "Unread Notifications", value: notificationCounts.unread, tone: "red" },
    { label: "Support Requests", value: notificationCounts.support, tone: "orange" },
    { label: "Admin Alerts", value: notificationCounts.alerts, tone: "green" }
  ], [notificationCounts]);

  const handleMarkAsRead = async (item) => {
    if (item.isRead) return;

    try {
      if (item.type === "support") {
        await axios.patch(`${API_BASE}/devotees/support/${item._id}/read`);
        setSupportRequests(prev => prev.map(req => req._id === item._id ? { ...req, read: true } : req));
      } else {
        await axios.put(`${API_BASE}/notifications/read/${item._id}`);
        setNotifications(prev => prev.map(notif => notif._id === item._id ? { ...notif, read: true, viewed: true } : notif));
      }
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      console.warn("Failed to mark as read", error);
    }
  };

  return (
    <div className={`mt-5 space-y-6 notifications-page ${darkMode ? "dark" : ""}`}>
      <div className="notifications-head">
        <div>
          <h2 className="text-2xl font-bold">Admin Notifications</h2>
          <p>Monitor devotee support requests and system alerts.</p>
        </div>
        <div className="notifications-head-actions">
          <button type="button" className="ghost-action" onClick={load} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="notification-summary-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className="notification-summary-card">
            <span className={`summary-icon ${card.tone}`}>
              {card.tone === "red" ? <FiBell /> : card.tone === "orange" ? <FiAlertTriangle /> : <FiCheckCircle />}
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
            <strong>
              {String(tab.key === "all" ? notificationCounts.all : tab.key === "unread" ? notificationCounts.unread : notificationCounts[tab.key] || 0).padStart(2, "0")}
            </strong>
          </button>
        ))}
      </div>

      <section className="notifications-content">
        {loading ? (
          <div className="staff-loading">Loading notifications...</div>
        ) : visibleNotifications.length > 0 ? (
          <div className="notification-list">
            {visibleNotifications.map((item) => {
              const PriorityIcon = item.priority.icon;
              return (
                <article
                  key={item._id}
                  onClick={() => !item.isRead && handleMarkAsRead(item)}
                  className={`notification-card ${item.isRead ? "" : "unread"} priority-${item.priority.tone} ${!item.isRead ? "cursor-pointer" : ""}`}
                >
                  <div className={`notification-icon ${item.type}`}>
                    <PriorityIcon />
                  </div>
                  <div className="notification-content">
                    <div className="notification-title-row">
                      <div>
                        <span className="notification-type-chip">{formatGroupLabel(item.type)}</span>
                        <h3>{item.displayTitle}</h3>
                      </div>
                      <span className={item.isRead ? "read-status" : "read-status unread"}>
                        {item.isRead ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p>{item.displayMessage}</p>
                    <div className="notification-meta">
                      <time>{getDisplayTime(item.dateObj)}</time>
                      <span className={`priority-badge ${item.priority.tone}`}>
                        <PriorityIcon />
                        {item.priority.label}
                      </span>
                    </div>
                  </div>
                  <div className="notification-actions">
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="notifications-empty">
            <FiCheckCircle />
            <h3>All Caught Up!</h3>
            <p>You have no notifications in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationsCenter;
