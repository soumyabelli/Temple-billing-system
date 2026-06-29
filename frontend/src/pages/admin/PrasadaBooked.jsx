import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteAdminPrasadamOrder, getAdminPrasadamOrders, updateAdminPrasadamOrderStatus } from "../../services/adminPrasadamOrdersService";

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

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Processing", "Ready for Pickup", "Completed", "Cancelled"];

const statusClassMap = {
  Pending: "bg-[#fef3c7] text-[#92400e]",
  Approved: "bg-[#dbeafe] text-[#1d4ed8]",
  Rejected: "bg-[#fee2e2] text-[#b91c1c]",
  Processing: "bg-[#e0e7ff] text-[#3730a3]",
  "Ready for Pickup": "bg-[#d1fae5] text-[#166534]",
  Completed: "bg-[#d1fae5] text-[#166534]",
  Cancelled: "bg-[#fee2e2] text-[#b91c1c]",
  Placed: "bg-[#fef3c7] text-[#92400e]",
  Preparing: "bg-[#e0e7ff] text-[#3730a3]",
  Ready: "bg-[#d1fae5] text-[#166534]",
  Delivered: "bg-[#d1fae5] text-[#166534]",
};

const displayStatus = (order) => order.orderStatusDisplay || order.status || "Pending";

const PrasadaBooked = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminPrasadamOrders({ limit: 200, page: 1 });
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
      const statusMatch = !statusFilter || status === statusFilter || (statusFilter === "Pending" && status === "Placed");
      if (!statusMatch) return false;
      if (!query) return true;
      return (
        String(order.devoteeName || "").toLowerCase().includes(query) ||
        String(order.email || "").toLowerCase().includes(query) ||
        String(order.phone || "").includes(query) ||
        String(order.itemName || "").toLowerCase().includes(query)
      );
    });
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await updateAdminPrasadamOrderStatus({ id: orderId, status });
      await loadOrders();
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm("Delete this order permanently? This should only be used to remove test data.");
    if (!confirmed) return;
    setDeletingId(orderId);
    setError("");
    try {
      await deleteAdminPrasadamOrder(orderId);
      await loadOrders();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Failed to delete order.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="mt-5 space-y-6">
      <div className="rounded-2xl border border-[#ece8e1] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[42px] font-bold text-[#111827]">Prasada Booked</h1>
            <p className="mt-2 text-[#525252]">Devotee prasada orders appear here when booked from the devotee portal.</p>
          </div>
          <div className="rounded-3xl bg-[#eff6ff] px-5 py-3 text-sm font-semibold text-[#1d4ed8]">Prasada</div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#e5e7eb] bg-[#f8fafc] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Total Orders</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{orders.length}</p>
          </div>
          <div className="rounded-3xl border border-[#fef3c7] bg-[#fffbeb] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#92400e]">Pending</p>
            <p className="mt-4 text-[2rem] font-bold text-[#92400e]">
              {orders.filter((o) => ["Pending", "Placed"].includes(displayStatus(o))).length}
            </p>
          </div>
          <div className="rounded-3xl border border-[#d1fae5] bg-[#ecfdf5] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#166534]">Revenue</p>
            <p className="mt-4 text-[2rem] font-bold text-[#166534]">
              {formatCurrency(orders.reduce((sum, o) => sum + Number(o.amount || 0), 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-[#111827]">All Prasada Bookings</h2>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search devotee or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border border-[#cbd5e1] px-4 py-2 text-sm outline-none focus:border-[#2563eb]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-[#cbd5e1] px-4 py-2 text-sm outline-none focus:border-[#2563eb]"
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
              className="rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-[#1f2937] hover:bg-[#f8fafc]"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#fee2e2] bg-[#fff1f2] p-4 text-sm text-[#b91c1c]">{error}</div>
        ) : null}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-[#334155]">
            <thead className="border-b border-[#e2e8f0] text-[#475569]">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Devotee</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Booked On</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-[#64748b]">
                    Loading prasada bookings…
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-[#64748b]">
                    No prasada bookings found yet.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderId = order._id || order.id;
                  const status = displayStatus(order);
                  return (
                    <tr key={orderId} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                      <td className="px-4 py-4 font-mono font-semibold text-[#6366f1]">
                        PR-{String(orderId).slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#0f172a]">{order.devoteeName || "-"}</td>
                      <td className="px-4 py-4">
                        <div>{order.email || "-"}</div>
                        <div className="text-xs text-[#64748b]">{order.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-4">{order.itemName || "-"}</td>
                      <td className="px-4 py-4">{order.quantity || 1}</td>
                      <td className="px-4 py-4 font-bold text-[#0f172a]">{formatCurrency(order.amount)}</td>
                      <td className="px-4 py-4">{order.paymentMethod || "UPI"}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassMap[status] || "bg-[#f3f4f6] text-[#334155]"}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4">{formatDateTime(order.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={STATUS_OPTIONS.includes(status) ? status : "Pending"}
                            disabled={updatingId === orderId || deletingId === orderId}
                            onChange={(e) => handleStatusChange(orderId, e.target.value)}
                            className="rounded-lg border border-[#cbd5e1] px-2 py-1 text-xs outline-none focus:border-[#2563eb]"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={deletingId === orderId || updatingId === orderId}
                            onClick={() => handleDelete(orderId)}
                            className="rounded-lg border border-[#fecaca] bg-[#fff1f2] px-2 py-1 text-xs font-semibold text-[#b91c1c] hover:bg-[#ffe4e6] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === orderId ? "Deleting..." : "Delete"}
                          </button>
                        </div>
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
