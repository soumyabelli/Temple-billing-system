import React, { useState, useMemo } from "react";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const AppIcon = ({ name, className = "h-5 w-5" }) => {
  const base = "fill-none stroke-current stroke-2";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M3 10.5L12 3l9 7.5"></path>
        <path d="M5.5 9.5V21h13V9.5"></path>
      </svg>
    );
  }
  if (name === "book" || name === "clipboard") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
        <path d="M8 4v16M11 8h5M11 12h5"></path>
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2"></rect>
        <path d="M7 3v4M17 3v4M3.5 9h17M8.5 13h3v3h-3z"></path>
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M12 20s-6.5-4.2-8.5-8.2a5 5 0 0 1 8.1-5.6l.4.4.4-.4a5 5 0 0 1 8.1 5.6C18.5 15.8 12 20 12 20z"></path>
      </svg>
    );
  }
  if (name === "box" || name === "bag") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2"></path>
      </svg>
    );
  }
  if (name === "temple") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <path d="M3 20h18M5 20v-6h14v6M7 14V9l5-4 5 4v5"></path>
      </svg>
    );
  }
  if (name === "gear") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
        <circle cx="12" cy="12" r="3.2"></circle>
        <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"></path>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${base}`}>
      <path d="M15 18h5l-1.3-1.3a1 1 0 0 1-.3-.7V11a6.4 6.4 0 1 0-12.8 0v5a1 1 0 0 1-.3.7L4 18h5"></path>
      <path d="M10 18a2 2 0 1 0 4 0"></path>
    </svg>
  );
};

const EmailNotificationsView = ({
  title = "Notifications & Email Inbox",
  subtitle = "",
  notifications = [],
  loading = false,
  error = "",
  userEmail: explicitUserEmail,
  onMarkRead,
  onMarkAllRead,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [notificationTab, setNotificationTab] = useState("all");
  const [notificationCategory, setNotificationCategory] = useState("all");
  const [notificationSearch, setNotificationSearch] = useState("");
  const [selectedNotificationDetail, setSelectedNotificationDetail] = useState(null);

  const activeEmail =
    explicitUserEmail ||
    user?.email ||
    JSON.parse(localStorage.getItem("user") || "null")?.email ||
    "temple-staff@mandir.com";

  const getNotificationCategory = (itemTitle, itemCategory) => {
    const cat = String(itemCategory || "").toLowerCase().trim();
    if (cat === "event" || cat === "events" || cat === "festival" || cat === "festivals") return "events";
    if (cat === "booking" || cat === "bookings" || cat === "pooja") return "bookings";
    if (cat === "donation" || cat === "donations" || cat === "payment") return "donations";
    if (cat === "support" || cat === "support requests" || cat === "feedback" || cat === "query" || cat === "queries") return "support";
    if (cat === "duty" || cat === "duties" || cat === "task" || cat === "tasks" || cat === "shift" || cat === "leave") return "tasks";
    if (cat === "inventory" || cat === "stock" || cat === "item" || cat === "purchase") return "inventory";

    const t = String(itemTitle || "").toLowerCase();
    if (t.includes("event") || t.includes("festival") || t.includes("utsav") || t.includes("invitation") || t.includes("gowri") || t.includes("ganesha") || t.includes("chathurthi")) return "events";
    if (t.includes("booking") || t.includes("pooja")) return "bookings";
    if (t.includes("donation") || t.includes("receipt") || t.includes("paid") || t.includes("payment")) return "donations";
    if (t.includes("feedback") || t.includes("reply") || t.includes("support") || t.includes("query")) return "support";
    if (t.includes("duty") || t.includes("task") || t.includes("shift") || t.includes("leave") || t.includes("schedule")) return "tasks";
    if (t.includes("inventory") || t.includes("stock") || t.includes("ghee") || t.includes("prasadam") || t.includes("request")) return "inventory";
    return "announcements";
  };

  const getNotificationStyle = (itemTitle, itemCategory) => {
    const cat = getNotificationCategory(itemTitle, itemCategory);
    if (cat === "bookings") {
      return {
        icon: "calendar",
        badge: "Booking",
        color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
        badgeColor: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
      };
    }
    if (cat === "donations") {
      return {
        icon: "heart",
        badge: "Donation",
        color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
        badgeColor: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      };
    }
    if (cat === "events") {
      return {
        icon: "temple",
        badge: "Festival / Event",
        color: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50",
        badgeColor: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
      };
    }
    if (cat === "tasks") {
      return {
        icon: "clipboard",
        badge: "Duty / Task",
        color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50",
        badgeColor: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
      };
    }
    if (cat === "inventory") {
      return {
        icon: "box",
        badge: "Inventory",
        color: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50",
        badgeColor: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
      };
    }
    if (cat === "support") {
      return {
        icon: "gear",
        badge: "Support",
        color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
        badgeColor: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      };
    }
    return {
      icon: "bell",
      badge: "Notice",
      color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
      badgeColor: "bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200",
    };
  };

  const normalizedList = useMemo(() => {
    return (notifications || []).map((n) => {
      const isRead = Boolean(n.read || n.isRead || n.viewed);
      const rawDate = n.date || n.createdAt || n.dateObj || Date.now();
      const formattedDate = new Date(rawDate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        ...n,
        _id: n._id || n.id,
        id: n._id || n.id,
        title: n.displayTitle || n.title || "Temple Notification",
        message: n.displayMessage || n.message || "",
        category: n.category || n.type || "announcements",
        date: formattedDate,
        rawTime: new Date(rawDate).getTime(),
        read: isRead,
        attachment: n.attachment || null,
      };
    });
  }, [notifications]);

  const unreadCount = useMemo(() => normalizedList.filter((n) => !n.read).length, [normalizedList]);

  // Dynamically build category pills based on list
  const categoryTabs = useMemo(() => {
    const presentCats = new Set();
    normalizedList.forEach((item) => {
      presentCats.add(getNotificationCategory(item.title, item.category));
    });

    const allPills = [
      { id: "all", label: "All Categories" },
      { id: "events", label: "Festivals & Events" },
      { id: "tasks", label: "Duties & Tasks" },
      { id: "inventory", label: "Inventory" },
      { id: "bookings", label: "Bookings" },
      { id: "donations", label: "Donations" },
      { id: "support", label: "Support & Queries" },
      { id: "announcements", label: "Notices" },
    ];

    // Always include 'all', and include other categories if they exist or common ones
    return allPills.filter(
      (p) => p.id === "all" || presentCats.has(p.id) || ["events", "tasks", "inventory", "announcements"].includes(p.id)
    );
  }, [normalizedList]);

  const filteredList = useMemo(() => {
    return normalizedList
      .filter((item) => {
        if (notificationTab === "unread" && item.read) return false;
        if (notificationCategory !== "all") {
          const cat = getNotificationCategory(item.title, item.category);
          if (cat !== notificationCategory) return false;
        }
        if (notificationSearch.trim()) {
          const q = notificationSearch.toLowerCase();
          const matchTitle = (item.title || "").toLowerCase().includes(q);
          const matchMessage = (item.message || "").toLowerCase().includes(q);
          if (!matchTitle && !matchMessage) return false;
        }
        return true;
      })
      .sort((a, b) => b.rawTime - a.rawTime);
  }, [normalizedList, notificationTab, notificationCategory, notificationSearch]);

  const handleItemClick = (item) => {
    setSelectedNotificationDetail(item);
    if (!item.read && item._id && onMarkRead) {
      onMarkRead(item._id);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <div className="rounded-[26px] border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/90 p-6 shadow-sm backdrop-blur-md">
        {/* Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-700 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                <FaBell className="text-xl" />
              </div>
              <div>
                <h2 className="text-[2rem] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {title}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {subtitle ? (
                    subtitle
                  ) : (
                    <>
                      All notifications are also automatically dispatched to{" "}
                      <strong className="text-slate-700 dark:text-slate-300">{activeEmail}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700/70 shadow-xs"
              >
                ↻ Refresh
              </button>
            )}
            {unreadCount > 0 && onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-sm font-bold text-amber-800 dark:text-amber-300 transition hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-xs"
              >
                ✓ Mark all as read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm font-medium text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Inbox Controls & Filters */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* View Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNotificationTab("all")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                notificationTab === "all"
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Messages ({normalizedList.length})
            </button>
            <button
              type="button"
              onClick={() => setNotificationTab("unread")}
              className={`relative rounded-xl px-4 py-2 text-sm font-bold transition ${
                notificationTab === "unread"
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={notificationSearch}
                onChange={(e) => setNotificationSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {notificationSearch && (
                <button
                  type="button"
                  onClick={() => setNotificationSearch("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {categoryTabs.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setNotificationCategory(cat.id)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                notificationCategory === cat.id
                  ? "bg-slate-800 dark:bg-slate-700 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notification Items List */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-r-transparent mb-2" />
              <p className="text-sm font-semibold">Loading notifications...</p>
            </div>
          ) : filteredList.length > 0 ? (
            filteredList.map((item) => {
              const style = getNotificationStyle(item.title, item.category);
              return (
                <div
                  key={`${item.title}-${item.date}-${item._id || Math.random()}`}
                  onClick={() => handleItemClick(item)}
                  className={`group relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                    !item.read
                      ? "border-amber-400/80 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-md ring-1 ring-amber-400/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-xs ${style.color}`}>
                    <AppIcon name={style.icon} className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${style.badgeColor}`}>
                          {style.badge}
                        </span>
                        {item.audienceRole && (
                          <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-300">
                            {item.audienceRole}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.date || "Recent"}
                      </span>
                    </div>

                    <h3
                      className={`mt-1.5 text-base font-bold transition group-hover:text-amber-600 dark:group-hover:text-amber-400 ${
                        !item.read ? "text-slate-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.message && (
                      <p
                        className={`mt-1.5 text-sm leading-relaxed line-clamp-2 ${
                          !item.read ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {item.message}
                      </p>
                    )}

                    {item.attachment && (
                      <div className="mt-3">
                        {item.attachment.startsWith("data:image/") ||
                        (!item.attachment.startsWith("data:application/pdf") &&
                          !item.attachment.toLowerCase().endsWith(".pdf")) ? (
                          <img
                            src={item.attachment}
                            alt="Attachment Banner"
                            className="max-h-56 w-auto rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs"
                          />
                        ) : (
                          <a
                            href={item.attachment}
                            download={`Document-${(item.title || "Notice").replace(/\s+/g, "_")}.pdf`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
                          >
                            📄 Download Attached Document
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {!item.read && (
                    <span
                      className="flex-shrink-0 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/25 animate-pulse"
                      title="Unread"
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="rounded-2xl bg-amber-100 dark:bg-slate-800 p-4 text-amber-600 dark:text-amber-400 mb-3 shadow-xs">
                <AppIcon name="bell" className="h-8 w-8" />
              </div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">No notifications found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {notificationTab === "unread"
                  ? "You have read all notifications."
                  : "No notification matches the selected filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      {selectedNotificationDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                  ✉️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Email Notification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dispatched from Sri Shanti Mahadev Mandir
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotificationDetail(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Email Envelope Header */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 text-xs space-y-1.5 font-medium">
              <div className="flex gap-2">
                <span className="text-slate-400 w-16">From:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  Sri Shanti Mahadev Mandir &lt;ganga.mca2002@gmail.com&gt;
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-16">To:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {selectedNotificationDetail.audienceEmail || activeEmail}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-16">Date:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedNotificationDetail.date || "Just now"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-16">Subject:</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">
                  {selectedNotificationDetail.title}
                </span>
              </div>
            </div>

            {/* Email Body */}
            <div className="rounded-2xl border border-amber-200/60 dark:border-slate-700 bg-amber-50/20 dark:bg-slate-900/40 p-5">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {selectedNotificationDetail.title}
              </h4>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {selectedNotificationDetail.message}
              </p>

              {selectedNotificationDetail.attachment && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  {selectedNotificationDetail.attachment.startsWith("data:image/") ||
                  (!selectedNotificationDetail.attachment.startsWith("data:application/pdf") &&
                    !selectedNotificationDetail.attachment.toLowerCase().endsWith(".pdf")) ? (
                    <img
                      src={selectedNotificationDetail.attachment}
                      alt="Attachment Preview"
                      className="max-h-80 w-auto rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                    />
                  ) : (
                    <a
                      href={selectedNotificationDetail.attachment}
                      download={`Document-${(selectedNotificationDetail.title || "Notice").replace(/\s+/g, "_")}.pdf`}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700"
                    >
                      📄 Download Attached Document
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedNotificationDetail(null)}
                className="rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-2 text-sm font-bold text-white dark:text-slate-900 hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailNotificationsView;
