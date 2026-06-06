import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getPrasadamOrders } from "../../services/devoteeService";

const API_BASE = "http://localhost:5000/api";

const inventoryItems = [
  { name: "Ghee Bottles", stock: 8, unitPrice: 280 },
  { name: "Camphor Packs", stock: 5, unitPrice: 120 },
  { name: "Agarbatti Boxes", stock: 11, unitPrice: 45 },
  { name: "Coconut Stock", stock: 7, unitPrice: 40 },
  { name: "Laddu Packets", stock: 14, unitPrice: 55 },
];

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

const statusClassMap = {
  Pending: "bg-[#fef3c7] text-[#92400e]",
  Approved: "bg-[#d1fae5] text-[#166534]",
  Rejected: "bg-[#fee2e2] text-[#b91c1c]",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const InventoryManagement = () => {
  const { user } = useAuth();
  const [prasadamOrders, setPrasadamOrders] = useState([]);
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [requestError, setRequestError] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [inventorySearch, setInventorySearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPrasadamOrders();
        setPrasadamOrders(res.orders || []);
      } catch (error) {
        console.warn("Unable to load prasadam data", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchInventoryRequests = async () => {
    setRequestsLoading(true);
    setRequestError("");
    try {
      const response = await axios.get(`${API_BASE}/staff/inventory-requests`);
      setInventoryRequests(Array.isArray(response.data?.requests) ? response.data.requests : []);
    } catch (error) {
      setRequestError(error.response?.data?.message || "Failed to load inventory requests.");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryRequests();
  }, []);

  const requestSummary = useMemo(
    () =>
      inventoryRequests.reduce(
        (summary, request) => {
          summary.total += 1;
          summary[request.status?.toLowerCase() || "pending"] += 1;
          return summary;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 }
      ),
    [inventoryRequests]
  );

  const filteredInventoryRequests = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    return inventoryRequests
      .filter((request) => {
        const statusMatch = inventoryFilter === "all" || request.status === inventoryFilter;
        const searchMatch =
          !query ||
          request.itemName.toLowerCase().includes(query) ||
          request.staffName.toLowerCase().includes(query);
        return statusMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [inventoryRequests, inventoryFilter, inventorySearch]);

  const lowStockItems = useMemo(
    () => inventoryItems.filter((item) => item.stock <= 8),
    []
  );

  const totalInventoryValue = useMemo(
    () => inventoryItems.reduce((sum, item) => sum + item.stock * item.unitPrice, 0),
    []
  );

  const totalPrasadamRevenue = useMemo(
    () => prasadamOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0),
    [prasadamOrders]
  );

  const recentOrders = useMemo(
    () => prasadamOrders
      .slice(0, 8)
      .map((order) => ({
        id: order._id,
        item: order.itemName,
        qty: order.quantity,
        price: order.totalPrice,
        status: order.status || "Pending",
        date: order.createdAt || order.updatedAt || "",
      })),
    [prasadamOrders]
  );

  const updateInventoryRequestStatus = async (requestId, status, adminReason = "") => {
    if (!requestId || !status) return;
    setActionLoadingId(requestId);
    setRequestError("");

    try {
      await axios.put(`${API_BASE}/staff/inventory-requests/${requestId}/status`, {
        status,
        adminReason,
        reviewedBy: user?.name || "Admin",
      });
      await fetchInventoryRequests();
    } catch (error) {
      setRequestError(error.response?.data?.message || "Failed to update inventory request status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleApprove = async (request) => {
    await updateInventoryRequestStatus(request._id, "Approved");
  };

  const handleReject = async (request) => {
    const reason = window.prompt("Reason for rejecting this request:", "Sufficient stock already available.");
    if (!reason || !reason.trim()) return;
    await updateInventoryRequestStatus(request._id, "Rejected", reason.trim());
  };

  const downloadRequestsReport = () => {
    const rows = [
      ["Item", "Requested By", "Quantity", "Unit", "Request Date", "Status", "Admin Reason"],
      ...inventoryRequests.map((request) => [
        request.itemName,
        request.staffName,
        request.quantity,
        request.unit || "",
        formatDateTime(request.createdAt),
        request.status,
        request.adminReason || "-",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-inventory-requests-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-5 space-y-6">
      <div className="rounded-2xl border border-[#ece8e1] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[42px] font-bold text-[#111827]">Inventory Management</h1>
            <p className="mt-2 text-[#525252]">Review staff inventory requests and manage approvals for temple supplies.</p>
          </div>
          <div className="rounded-3xl bg-[#eff6ff] px-5 py-3 text-sm font-semibold text-[#1d4ed8]">Staff requests and stock review</div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#e5e7eb] bg-[#f8fafc] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Total requests</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{requestSummary.total}</p>
            <p className="mt-2 text-sm text-[#475569]">All inventory requests submitted by staff.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Pending</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{requestSummary.pending}</p>
            <p className="mt-2 text-sm text-[#475569]">Requests waiting for your review.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Approved</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{requestSummary.approved}</p>
            <p className="mt-2 text-sm text-[#475569]">Requests that have been approved.</p>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Rejected</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{requestSummary.rejected}</p>
            <p className="mt-2 text-sm text-[#475569]">Requests rejected with reasons.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ece8e1] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Staff Inventory Requests</h2>
            <p className="mt-2 text-sm text-[#64748b]">Approve or reject new requests and keep inventory requests up to date.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchInventoryRequests}
              className="rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc]"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={downloadRequestsReport}
              disabled={inventoryRequests.length === 0}
              className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#93c5fd]"
            >
              Download Report
            </button>
          </div>
        </div>

        {requestError ? (
          <div className="mt-4 rounded-2xl border border-[#fee2e2] bg-[#fff1f2] p-4 text-sm text-[#b91c1c]">{requestError}</div>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-4">
            <label htmlFor="adminInventoryFilter" className="text-sm text-[#475569]">Filter Status</label>
            <select
              id="adminInventoryFilter"
              value={inventoryFilter}
              onChange={(e) => setInventoryFilter(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#cbd5e1] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-4">
            <label htmlFor="adminInventorySearch" className="text-sm text-[#475569]">Search Item / Staff</label>
            <input
              id="adminInventorySearch"
              type="text"
              placeholder="Search inventory requests"
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#cbd5e1] px-3 py-2 text-sm"
            />
          </div>
          <div className="rounded-3xl border border-[#e5e7eb] bg-white p-4 flex items-end justify-between">
            <button
              type="button"
              className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"
              onClick={fetchInventoryRequests}
            >
              Refresh Requests
            </button>
            <span className="text-sm text-[#64748b]">{filteredInventoryRequests.length} matching requests</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-[#334155]">
            <thead className="border-b border-[#e2e8f0] text-[#475569]">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Requested By</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Request Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Admin Reason</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requestsLoading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-sm text-[#64748b]">Loading inventory requests…</td>
                </tr>
              ) : filteredInventoryRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-sm text-[#64748b]">No inventory requests found.</td>
                </tr>
              ) : (
                filteredInventoryRequests.map((request) => (
                  <tr key={request._id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                    <td className="px-4 py-4 font-semibold text-[#0f172a]">{request.itemName}</td>
                    <td className="px-4 py-4">{request.staffName || "-"}</td>
                    <td className="px-4 py-4">{request.quantity}</td>
                    <td className="px-4 py-4">{request.unit || "-"}</td>
                    <td className="px-4 py-4">{formatDateTime(request.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassMap[request.status] || "bg-[#f3f4f6] text-[#334155]"}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{request.adminReason || "-"}</td>
                    <td className="px-4 py-4">
                      {request.status === "Pending" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full bg-[#10b981] px-3 py-2 text-xs font-semibold text-white hover:bg-[#059669] disabled:cursor-not-allowed disabled:bg-[#6ee7b7]"
                            onClick={() => handleApprove(request)}
                            disabled={actionLoadingId === request._id}
                          >
                            {actionLoadingId === request._id ? "Working…" : "Approve"}
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-[#ef4444] px-3 py-2 text-xs font-semibold text-white hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:bg-[#fca5a5]"
                            onClick={() => handleReject(request)}
                            disabled={actionLoadingId === request._id}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-[#475569]">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
