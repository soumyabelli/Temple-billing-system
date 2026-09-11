import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminPrasadamOrders } from "../../services/adminPrasadamOrdersService";

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => {
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

const STATUS_OPTIONS = ["Collected", "Not Collected"];

const statusClassMap = {
  Collected: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  "Not Collected": "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  Pending: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  Completed: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  Placed: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  Cancelled: "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
};

const displayStatus = (order) => {
  const s = order.orderStatusDisplay || order.status || "Not Collected";
  if (s === "Completed" || s === "Collected" || s === "Approved" || s === "Delivered") return "Collected";
  return "Not Collected";
};

const PrasadaBooked = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminPrasadamOrders({ limit: 500, page: 1 });
      setOrders(response.orders || []);
    } catch (loadError) {
      console.error("Failed to load prasada orders", loadError);
      setError("Unable to load prasada bookings. Please refresh.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const status = displayStatus(order);
      const statusMatch = !statusFilter || status === statusFilter;
      if (!statusMatch) return false;

      const modeMatch = !modeFilter || (order.bookingMode || "").toLowerCase() === modeFilter.toLowerCase();
      if (!modeMatch) return false;

      const isWithPooja = String(order.bookingSource || "").toLowerCase().includes("pooja");
      const sourceMatch =
        !sourceFilter ||
        (sourceFilter === "With Pooja" ? isWithPooja : !isWithPooja);
      if (!sourceMatch) return false;

      if (!query) return true;
      return (
        String(order.devoteeName || "").toLowerCase().includes(query) ||
        String(order.email || "").toLowerCase().includes(query) ||
        String(order.phone || "").includes(query) ||
        String(order.itemName || "").toLowerCase().includes(query) ||
        String(order.orderId || "").toLowerCase().includes(query) ||
        String(order.bookingSource || "").toLowerCase().includes(query) ||
        String(order.bookingMode || "").toLowerCase().includes(query) ||
        String(order.paymentMethod || "").toLowerCase().includes(query)
      );
    });
  }, [orders, search, statusFilter, modeFilter, sourceFilter]);

  const onlineCount = useMemo(() => orders.filter((o) => (o.bookingMode || "").toLowerCase() === "online").length, [orders]);
  const offlineCount = useMemo(() => orders.filter((o) => (o.bookingMode || "").toLowerCase() === "offline").length, [orders]);
  const notCollectedCount = useMemo(() => orders.filter((o) => displayStatus(o) === "Not Collected").length, [orders]);
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + Number(o.amount || 0), 0), [orders]);

  return (
    <div className="mt-5 space-y-6">
      {/* HEADER HERO BANNER */}
      <div className="rounded-2xl border border-[#ece8e1] dark:border-slate-700 bg-temple-100 dark:bg-[#0f172a] dark:text-slate-200 p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[42px] font-bold text-[#111827] dark:text-slate-200">Prasada Booked</h1>
            <p className="mt-2 text-[#525252] dark:text-slate-400">
              Live records of all prasada orders booked online through devotee portal or offline at counter, booked separately or along with pooja sevas.
            </p>
          </div>
          <div className="rounded-3xl bg-[#eff6ff] dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-5 py-3 text-sm font-bold text-[#1d4ed8] dark:text-blue-300">
            Prasada Ledger
          </div>
        </div>

        {/* SUMMARY STAT CARDS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#e5e7eb] dark:border-slate-700 bg-[#f8fafc] dark:bg-[#0f172a] p-6 shadow-xs">
            <p className="text-xs uppercase tracking-[0.24em] font-bold text-[#475569] dark:text-slate-400">Total Bookings</p>
            <p className="mt-3 text-[2rem] font-black text-[#0f172a] dark:text-slate-100">{orders.length}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">All combined & standalone orders</p>
          </div>
          <div className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-6 shadow-xs">
            <p className="text-xs uppercase tracking-[0.24em] font-bold text-blue-800 dark:text-blue-300">Online Bookings</p>
            <p className="mt-3 text-[2rem] font-black text-blue-900 dark:text-blue-200">{onlineCount}</p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-400 font-medium">Devotee portal & online payments</p>
          </div>
          <div className="rounded-3xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30 p-6 shadow-xs">
            <p className="text-xs uppercase tracking-[0.24em] font-bold text-purple-800 dark:text-purple-300">Offline Bookings</p>
            <p className="mt-3 text-[2rem] font-black text-purple-900 dark:text-purple-200">{offlineCount}</p>
            <p className="mt-1 text-xs text-purple-700 dark:text-purple-400 font-medium">Counter cash & cashier bookings</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 p-6 shadow-xs">
            <p className="text-xs uppercase tracking-[0.24em] font-bold text-emerald-800 dark:text-emerald-300">Total Revenue</p>
            <p className="mt-3 text-[2rem] font-black text-emerald-900 dark:text-emerald-200">{formatCurrency(totalRevenue)}</p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">{notCollectedCount} orders not collected</p>
          </div>
        </div>
      </div>

      {/* PRASADA BOOKINGS TABLE CARD */}
      <div className="rounded-2xl border border-[#ece8e1] dark:border-slate-700 bg-temple-100 dark:bg-[#0f172a] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#111827] dark:text-slate-200">Prasada Bookings</h2>
            <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-3 py-1 text-xs font-extrabold text-amber-800 dark:text-amber-300">
              {filteredOrders.length} records
            </span>
            {filteredOrders.length > 10 && (
              <button
                onClick={() => navigate("/admin/prasada/all")}
                className="rounded-full bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e40af] transition"
              >
                View All
              </button>
            )}
          </div>

          {/* FILTER CONTROLS */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search devotee, item, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-4 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-4 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="">All Modes (Online & Offline)</option>
              <option value="Online">Online Booking</option>
              <option value="Offline">Offline Booking</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-4 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="">All Types</option>
              <option value="With Pooja">Along with Pooja</option>
              <option value="Prasada Only">Prasada Only</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-4 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadOrders}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
          <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Devotee</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Item</th>
                <th className="px-4 py-3.5">Booking Mode</th>
                <th className="px-4 py-3.5">Booking Source</th>
                <th className="px-4 py-3.5">Qty</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Booked On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-slate-500">
                    Loading prasada bookings…
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-slate-500">
                    No prasada bookings found.
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 15).map((order) => {
                  const orderId = order.orderId || order._id || order.id;
                  const status = displayStatus(order);
                  const isOnline = (order.bookingMode || "").toLowerCase() === "online";
                  const isWithPooja = String(order.bookingSource || "").toLowerCase().includes("pooja");

                  return (
                    <tr
                      key={order._id || orderId}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-4 py-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {orderId}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {order.devoteeName || "-"}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{order.email || "-"}</div>
                        <div className="text-slate-400 mt-0.5">{order.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {order.itemName || "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
                            isOnline
                              ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                              : "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-blue-500" : "bg-purple-500"}`}></span>
                          {isOnline ? "Online Booking" : "Offline Booking"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${
                            isWithPooja
                              ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                              : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {order.bookingSource || "Prasada Only"}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-center">{order.quantity || 1}</td>
                      <td className="px-4 py-4 font-black text-amber-800 dark:text-amber-400">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {order.paymentMethod || "UPI"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClassMap[status] || "bg-slate-100 text-slate-800"}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 font-medium">
                        {formatDateTime(order.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrasadaBooked;
