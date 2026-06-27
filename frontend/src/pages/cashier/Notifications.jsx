import { useMemo, useState } from "react";
import { FaBell, FaCheckCircle, FaFilter, FaSyncAlt } from "react-icons/fa";
import CashierPageShell from "../../components/cashier/CashierPageShell";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { formatDateTime } from "../../services/cashierService";
import templeBg from "../../assets/temple-bg.jpg";

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, loadNotifications, markRead } = useNotifications();
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  const filteredNotifications = useMemo(() => {
    return [...notifications]
      .filter((notification) => {
        if (filter === "Unread") return !notification.read;
        if (filter === "Read") return Boolean(notification.read);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
  }, [notifications, filter]);

  const stats = [
    {
      title: "All Notifications",
      value: notifications.length,
      note: "Counter and admin alerts",
      tone: "orange",
    },
    {
      title: "Unread",
      value: unreadCount,
      note: "Needs attention",
      tone: "gold",
    },
    {
      title: "Read",
      value: notifications.length - unreadCount,
      note: "Already reviewed",
      tone: "green",
    },
    {
      title: "User Role",
      value: "Cashier",
      note: user?.name || "Signed in user",
      tone: "blue",
    },
  ];

  const handleMarkRead = async (notificationId) => {
    try {
      await markRead(notificationId);
      setMessage("Notification marked as read.");
    } catch (error) {
      setMessage("Unable to update notification status.");
    }
  };

  return (
    <CashierPageShell
      eyebrow="Notifications"
      title="Keep cashier alerts and broadcasts in one place"
      description="Track admin announcements, booking alerts and donation updates, then mark them as read once the cashier has handled them."
      image={templeBg}
      imageAlt="Temple cashier notifications"
      stats={stats}
      actions={
        <>
          <button
            type="button"
            onClick={loadNotifications}
            className="inline-flex items-center gap-2 rounded-full border border-[#f0c58f] bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#fff8ef]"
          >
            <FaSyncAlt /> Refresh
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c58f] bg-white px-4 py-3 text-sm font-bold text-slate-900">
            <FaBell className="text-[#f28c18]" />
            {unreadCount} unread
          </div>
        </>
      }
    >
      <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">Notifications inbox</h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              Mark alerts as read after the cashier has seen them.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Unread", "Read"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                  filter === item
                    ? "border-[#f28c18] bg-[#fff1df] text-[#8a5200]"
                    : "border-[#ead7bb] bg-white text-slate-700 hover:bg-[#fff8ef]"
                }`}
              >
                <FaFilter />
                {item}
              </button>
            ))}
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-[#f4d0a3] bg-[#fff7eb] px-4 py-3 text-sm font-semibold text-[#8a5200]">
            {message}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">Inbox list</h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Counter notices, admin broadcasts and payment alerts.
              </p>
            </div>
            <FaBell className="text-[#f28c18]" />
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-6 text-center text-slate-500">Loading notifications...</div>
            ) : filteredNotifications.length ? (
              filteredNotifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => !notification.read && handleMarkRead(notification._id)}
                  className={`w-full rounded-[20px] border p-4 text-left transition ${
                    notification.read
                      ? "border-[#ead7bb] bg-[#fffaf4] hover:bg-[#fff8ef]"
                      : "border-[#f4d0a3] bg-[#fff7eb] shadow-[0_10px_24px_rgba(242,140,24,0.08)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold text-slate-950">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-700">{formatDateTime(notification.createdAt || notification.date)}</p>
                    </div>
                    {notification.read ? (
                      <FaCheckCircle className="mt-1 text-[#16a34a]" />
                    ) : (
                      <span className="rounded-full bg-[#f28c18] px-3 py-1 text-xs font-bold text-white">Unread</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{notification.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    {notification.category ? <span className="rounded-full bg-white px-3 py-1">{notification.category}</span> : null}
                    {notification.audienceRole ? <span className="rounded-full bg-white px-3 py-1">{notification.audienceRole}</span> : null}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-6 text-center text-slate-500">No notifications found.</div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[22px] border border-[#f0d3a2] bg-white/95 p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-950">Quick facts</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm text-slate-700">
                Cashier alerts include booking confirmations, donation notices and admin broadcasts.
              </div>
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm text-slate-700">
                Click an unread notification to mark it as read instantly.
              </div>
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-3 text-sm text-slate-700">
                Notification history is stored on the backend and shared with the admin side.
              </div>
            </div>
          </section>
        </aside>
      </div>
    </CashierPageShell>
  );
};

export default Notifications;
