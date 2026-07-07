import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiBox, FiClock, FiCheckCircle, FiLock, FiSave, FiBell } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "../staff/StaffDashboard.css";

const API_BASE = "http://localhost:5000/api";

const statusClassMap = {
  Pending: "pending",
  "In Progress": "progress",
  Completed: "completed",
  Approved: "approved",
  Rejected: "rejected",
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

const PriestInventory = () => {
  const { user } = useAuth();
  const priestId = user?.id || user?._id || "";
  const priestName = user?.name || "Priest";

  const [catalog, setCatalog] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [form, setForm] = useState({ itemName: "", quantity: "", unit: "Pack", reason: "" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!priestId) return;
    setLoading(true);
    try {
      const [catRes, reqRes] = await Promise.all([
        axios.get(`${API_BASE}/priest/inventory/catalog`),
        axios.get(`${API_BASE}/priest/inventory-requests/${priestId}`)
      ]);
      setCatalog(catRes.data?.items || []);
      setRequests(reqRes.data?.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [priestId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        const matchesStatus = filter === "all" || req.status === filter;
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || req.itemName.toLowerCase().includes(query);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests, filter, search]);

  const summary = useMemo(() => {
    return requests.reduce(
      (acc, r) => {
        acc.total++;
        if (r.status === "Pending") acc.pending++;
        if (r.status === "Approved") acc.approved++;
        if (r.status === "Rejected") acc.rejected++;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [requests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.quantity || !form.reason) {
      setError("Please fill all required fields.");
      return;
    }
    const parsedQty = parseFloat(form.quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");
      await axios.post(`${API_BASE}/priest/inventory-requests`, {
        userId: priestId,
        userName: priestName,
        role: "Priest",
        itemName: form.itemName,
        quantity: parsedQty,
        unit: form.unit,
        reason: form.reason,
      });
      setForm({ itemName: "", quantity: "", unit: "Pack", reason: "" });
      await fetchData();
      setSuccessMsg("Request submitted successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadInventoryReport = () => {
    const rows = [
      ["Item Name", "Quantity", "Unit", "Request Date", "Status", "Admin Remarks"],
      ...requests.map((request) => [
        request.itemName,
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
    link.download = "inventory-requests-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="staff-dashboard-page" style={{ minHeight: "auto", background: "none", padding: 0 }}>
      <section className="inventory-page">
        <div className="leave-head">
          <div>
            <h2>Inventory Requests</h2>
            <p>Submit inventory needs and track your request statuses.</p>
          </div>
          <div className="inventory-actions">
            <button type="button" onClick={fetchData} disabled={loading}>
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button type="button" onClick={downloadInventoryReport} disabled={requests.length === 0}>
              <FiSave /> Download Report
            </button>
          </div>
        </div>

        {error ? <div className="staff-error">{error}</div> : null}
        {successMsg ? (
          <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "12px", padding: "12px 16px", color: "#065f46", fontWeight: 600, marginBottom: "16px" }}>
            {successMsg}
          </div>
        ) : null}

        <div className="inventory-top-cards">
          <article className="info-card">
            <div className="icon-bg orange"><FiBox /></div>
            <div>
              <h3>Total Requests</h3>
              <strong>{summary.total}</strong>
              <p>All requests submitted</p>
            </div>
          </article>
          <article className="info-card">
            <div className="icon-bg blue"><FiClock /></div>
            <div>
              <h3>Pending</h3>
              <strong>{summary.pending}</strong>
              <p>Awaiting approval</p>
            </div>
          </article>
          <article className="info-card">
            <div className="icon-bg green"><FiCheckCircle /></div>
            <div>
              <h3>Approved</h3>
              <strong>{summary.approved}</strong>
              <p>Ready for processing</p>
            </div>
          </article>
          <article className="info-card">
            <div className="icon-bg red"><FiLock /></div>
            <div>
              <h3>Rejected</h3>
              <strong>{summary.rejected}</strong>
              <p>Not approved</p>
            </div>
          </article>
        </div>

        <div className="inventory-grid">
          {/* New Request Form */}
          <div className="inventory-form-card">
            <div className="card-heading">
              <h2>New Inventory Request</h2>
            </div>
            <form className="leave-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="inv-itemName">Item Name <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  id="inv-itemName"
                  value={form.itemName}
                  onChange={(e) => {
                    const selected = catalog.find(i => i.name === e.target.value);
                    setForm(p => ({ ...p, itemName: e.target.value, unit: selected ? selected.unit : "Pack" }));
                    setError("");
                  }}
                >
                  <option value="">Select Item</option>
                  {catalog.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.stock} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label htmlFor="inv-quantity">Quantity <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    id="inv-quantity"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Enter quantity"
                    value={form.quantity}
                    onChange={(e) => { setForm(p => ({ ...p, quantity: e.target.value })); setError(""); }}
                  />
                </div>
                <div>
                  <label htmlFor="inv-unit">Unit <span style={{ color: "#ef4444" }}>*</span></label>
                  <select
                    id="inv-unit"
                    value={form.unit}
                    onChange={(e) => { setForm(p => ({ ...p, unit: e.target.value })); setError(""); }}
                  >
                    <option value="">Select Unit</option>
                    {["Kg", "Liter", "Pack", "Pieces"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="inv-reason">Reason <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea
                  id="inv-reason"
                  rows="4"
                  placeholder="e.g. Required for tomorrow's Satyanarayana Pooja"
                  value={form.reason}
                  onChange={(e) => { setForm(p => ({ ...p, reason: e.target.value })); setError(""); }}
                />
              </div>
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>

          {/* Live Inventory Status — read-only */}
          <div className="inventory-status-card">
            <div className="card-heading">
              <h2>📦 Live Inventory Status</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Read-only — managed by admin</p>
            </div>
            <div className="inventory-status-list">
              {loading ? (
                <div className="empty-cell">Loading inventory...</div>
              ) : catalog.length === 0 ? (
                <div className="empty-cell">No inventory data available</div>
              ) : (
                catalog.map((item) => (
                  <div key={item.name} className="inventory-status-item">
                    <div>
                      <h3>{item.name}</h3>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                        Stock: <strong>{item.stock} {item.unit}</strong> | Min: {item.minimumStock} {item.unit}
                      </p>
                    </div>
                    <span className={item.status === "Available" ? "status-chip approved" : "status-chip rejected"}>
                      {item.status === "Low Stock" ? "🔴 Low Stock" : "🟢 Available"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Request History */}
        <div className="inventory-history-grid">
          <div className="table-card">
            <div className="card-heading inventory-history-header">
              <div>
                <h2>Request History</h2>
                <p>All your inventory requests with status updates.</p>
              </div>
              <div className="inventory-history-filters">
                <div>
                  <label htmlFor="inventoryFilter">Status</label>
                  <select
                    id="inventoryFilter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="inventorySearch">Search Item</label>
                  <input
                    id="inventorySearch"
                    type="text"
                    placeholder="Search item name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="table-wrap">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Admin Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        No inventory requests match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request._id}>
                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#6366f1" }}>
                          INV-{request._id ? request._id.slice(-4).toUpperCase() : "----"}
                        </td>
                        <td>{request.itemName}</td>
                        <td>{`${request.quantity} ${request.unit || ""}`.trim()}</td>
                        <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={request.reason}>
                          {request.reason || "-"}
                        </td>
                        <td>{formatDateTime(request.createdAt)}</td>
                        <td>
                          <span className={`status-chip ${statusClassMap[request.status] || ""}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>{request.adminReason || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button
                type="button"
                onClick={() => {
                  setForm({ itemName: "", quantity: "", unit: "Pack", reason: "" });
                  setError("");
                  setSuccessMsg("");
                  document.getElementById("inv-itemName")?.focus();
                }}
              >
                <FiBox />
                <span>New Request</span>
              </button>
              <button type="button" onClick={fetchData}>
                <FiClock />
                <span>Refresh All</span>
              </button>
              <button
                type="button"
                onClick={downloadInventoryReport}
                disabled={requests.length === 0}
              >
                <FiSave />
                <span>Download CSV</span>
              </button>
              <button type="button" onClick={() => {
                // Not implemented or navigate elsewhere
              }}>
                <FiBell />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PriestInventory;
