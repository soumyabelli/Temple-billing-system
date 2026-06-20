import { useState, useEffect } from "react";
import { getNotifications, readNotification, readAllNotifications } from "../../services/priestService";
import { FiBell, FiCheckCircle, FiCheck } from "react-icons/fi";

const PriestNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await readNotification(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      alert("Failed to mark as read");
    }
  };

  const handleReadAll = async () => {
    try {
      await readAllNotifications();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      alert("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FiBell className="text-amber-500" /> Notifications
          </h1>
          <p className="text-slate-500">Stay updated with temple announcements and duty changes.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleReadAll}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <FiCheckCircle /> Mark all as read
          </button>
        )}
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}

      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-slate-500">You have no notifications.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start gap-4 p-5 transition-colors ${notification.read ? 'bg-white' : 'bg-amber-50/50'}`}
              >
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.read ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'}`}>
                  <FiBell />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className={`text-base ${notification.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                      {notification.title}
                    </h4>
                    <span className="shrink-0 text-xs text-slate-500">
                      {new Date(notification.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                    {notification.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      {notification.category}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={() => handleRead(notification.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
                      >
                        <FiCheck /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriestNotifications;
