import { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import EmailNotificationsView from "../../components/shared/EmailNotificationsView";

const Notifications = () => {
  const { notifications, loading, loadNotifications, markRead, markAllRead } = useNotifications();
  const [error, setError] = useState("");

  const handleMarkRead = async (notificationId) => {
    try {
      await markRead(notificationId);
    } catch (err) {
      setError("Unable to update notification status.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (markAllRead) {
        await markAllRead();
      }
    } catch (err) {
      setError("Unable to mark all as read.");
    }
  };

  return (
    <div className="p-6">
      <EmailNotificationsView
        title="Cashier Notifications & Email Inbox"
        subtitle=""
        notifications={notifications}
        loading={loading}
        error={error}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onRefresh={loadNotifications}
      />
    </div>
  );
};

export default Notifications;
