import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getPrasadamOrders } from "../../services/devoteeService";

const API_BASE = "http://localhost:5000/api";

const INVENTORY_UNITS = ["Kg", "Liter", "Pack", "Pieces", "Box"];
const INVENTORY_CATEGORIES = ["Pooja", "Abhisheka", "Prasadam", "Annadanam", "Maintenance", "Electrical", "Office", "Festival"];

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

const EMPTY_ITEM_FORM = { name: "", unit: "Pack", currentStock: "", minimumStock: "", category: "", description: "" };

// ─────────────────────────────────────────────
// Low Stock Alert Banner
// ─────────────────────────────────────────────
const LowStockBanner = ({ items }) => {
  const lowItems = items.filter((i) => i.currentStock <= i.minimumStock);
  if (lowItems.length === 0) return null;
  return (
    <div style={{ background: "#fff7ed", border: "1px solid #fb923c", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px" }}>
      <p style={{ fontWeight: 700, color: "#c2410c", marginBottom: "8px", fontSize: "14px" }}>
        ⚠️ Low Stock Alert — {lowItems.length} item{lowItems.length > 1 ? "s" : ""} below minimum level
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {lowItems.map((item) => (
          <span
            key={item?._id || index}
            style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 600 }}
          >
            🔴 {item?.name}: {item?.currentStock}/{item?.minimumStock} {item?.unit}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Add / Edit Item Modal
// ─────────────────────────────────────────────
const ItemFormModal = ({ editItem, onClose, onSave }) => {
  const [form, setForm] = useState(
    editItem
      ? { name: editItem.name, unit: editItem.unit, currentStock: editItem.currentStock, minimumStock: editItem.minimumStock, category: editItem.category || "", description: editItem.description || "" }
      : EMPTY_ITEM_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    if (!form.unit) { setError("Unit is required."); return; }
    if (form.currentStock === "" || Number(form.currentStock) < 0) { setError("Current stock must be 0 or more."); return; }
    if (form.minimumStock === "" || Number(form.minimumStock) < 0) { setError("Minimum stock must be 0 or more."); return; }

    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, currentStock: Number(form.currentStock), minimumStock: Number(form.minimumStock) });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "480px", maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>
          {editItem ? "Edit Inventory Item" : "Add New Inventory Item"}
        </h3>
        {error ? <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px" }}>{error}</div> : null}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Item Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Camphor"
              style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "9px 12px", fontSize: "14px" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Unit *</label>
              <select
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "9px 12px", fontSize: "14px" }}
              >
                {INVENTORY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "9px 12px", fontSize: "14px" }}
              >
                <option value="">Select Category</option>
                {INVENTORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="e.g. Pure camphor for pooja"
              style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "9px 12px", fontSize: "14px", resize: "none" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Current Stock *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.currentStock}
                onChange={(e) => setForm((p) => ({ ...p, currentStock: e.target.value }))}
                placeholder="0"
                style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "9px 12px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Minimum Stock *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.minimumStock}
                onChange={(e) => setForm((p) => ({ ...p, minimumStock: e.target.value }))}
                placeholder="0"
                style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "9px 12px", fontSize: "14px" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: "30px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: "10px 24px", borderRadius: "30px", background: "#2563eb", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              {saving ? "Saving..." : editItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Restock Item Modal
// ─────────────────────────────────────────────
const RestockModal = ({ item, onClose, onRestock }) => {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || (!item._id && !item.id)) return;
    setLoading(true);
    await onRestock(item._id || item.id, Number(quantity));
    setLoading(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "440px", maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Restock Item</h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
          Add stock to: <strong>{item?.name}</strong> (Current: {item?.currentStock} {item?.unit})
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Quantity to Add *</label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", marginBottom: "16px" }}
          />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: "30px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !quantity || Number(quantity) <= 0}
              style={{ padding: "10px 24px", borderRadius: "30px", background: "#2563eb", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              {loading ? "Restocking..." : "Restock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Reject Reason Modal
// ─────────────────────────────────────────────
const RejectReasonModal = ({ request, onClose, onReject }) => {
  const [reason, setReason] = useState("Sufficient stock already available.");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!request || (!request._id && !request.id)) return;
    setLoading(true);
    await onReject(request._id || request.id, reason.trim());
    setLoading(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "440px", maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Reject Request</h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
          Rejecting: <strong>{request.itemName}</strong> ({request.quantity} {request.unit}) requested by <strong>{request.userName || request.staffName} ({request.role || "Staff"})</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>Reason for Rejection *</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", marginBottom: "16px" }}
          />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: "30px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              style={{ padding: "10px 24px", borderRadius: "30px", background: "#ef4444", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              {loading ? "Rejecting..." : "Reject Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const InventoryManagement = () => {
  const { user } = useAuth();

  // Tabs: "items" | "requests"
  const [activeTab, setActiveTab] = useState("items");

  // Inventory Items state
  const [inventoryItems, setInventoryItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemSearch, setItemSearch] = useState("");
  const [deletingItemId, setDeletingItemId] = useState("");

  // Inventory Requests state
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [requestError, setRequestError] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [inventorySearch, setInventorySearch] = useState("");
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [restockingItem, setRestockingItem] = useState(null);

  // ── Fetch inventory items ──
  const fetchInventoryItems = async () => {
    setItemsLoading(true);
    setItemsError("");
    try {
      const res = await axios.get(`${API_BASE}/admin/inventory-items`);
      setInventoryItems(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch (err) {
      setItemsError(err.response?.data?.message || "Failed to load inventory items.");
    } finally {
      setItemsLoading(false);
    }
  };

  // ── Fetch inventory requests ──
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
    fetchInventoryItems();
    fetchInventoryRequests();
  }, []);

  // ── Computed summaries ──
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
          (request.userName || request.staffName || "").toLowerCase().includes(query);
        return statusMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [inventoryRequests, inventoryFilter, inventorySearch]);

  const filteredItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return inventoryItems;
    return inventoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.category || "").toLowerCase().includes(query)
    );
  }, [inventoryItems, itemSearch]);

  // ── Item CRUD ──
  const handleEdit = (item) => {
    if (!item) return;
    setEditingItem(item);
  };

  const handleRestockModalOpen = (item) => {
    if (!item) return;
    setRestockingItem(item);
  };

  const handleDelete = async (item) => {
    if (!item) return;
    const itemId = item._id || item.id;
    if (!itemId) return;
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;
    setDeletingItemId(itemId);
    try {
      await axios.delete(`${API_BASE}/admin/inventory-items/${itemId}`);
      await fetchInventoryItems();
    } catch (err) {
      setItemsError(err.response?.data?.message || "Failed to delete item.");
    } finally {
      setDeletingItemId("");
    }
  };

  const handleSaveItem = async (formData) => {
    if (editingItem) {
      const itemId = editingItem._id || editingItem.id;
      if (!itemId) return;
      await axios.put(`${API_BASE}/admin/inventory-items/${itemId}`, formData);
    } else {
      await axios.post(`${API_BASE}/admin/inventory-items`, formData);
    }
    await fetchInventoryItems();
    setEditingItem(null);
  };

  const handleRestockSubmit = async (itemId, quantityAdded) => {
    if (!itemId) return;
    try {
      await axios.post(`${API_BASE}/admin/inventory/restock/${itemId}`, { quantityAdded });
      await fetchInventoryItems();
    } catch (err) {
      setItemsError(err.response?.data?.message || "Failed to restock item.");
    }
  };

  // ── Request Actions ──
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
      await Promise.all([fetchInventoryRequests(), fetchInventoryItems()]);
    } catch (error) {
      setRequestError(error.response?.data?.message || "Failed to update inventory request status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleApprove = (request) => {
    if (window.confirm(`Approve request for ${request.quantity} ${request.unit} of ${request.itemName} by ${request.userName || request.staffName}?\n\nThis will deduct the quantity from current stock.`)) {
      updateInventoryRequestStatus(request._id, "Approved");
    }
  };

  const handleReject = (request) => {
    setRejectingRequest(request);
  };

  const handleRejectConfirm = async (requestId, reason) => {
    await updateInventoryRequestStatus(requestId, "Rejected", reason);
    setRejectingRequest(null);
  };

  const downloadRequestsReport = () => {
    const rows = [
      ["Request ID", "Item", "Requested By", "Quantity", "Unit", "Reason", "Date", "Status", "Admin Reason"],
      ...inventoryRequests.map((request) => [
        `INV-${request._id?.slice(-4).toUpperCase()}`,
        request.itemName,
        `${request.userName || request.staffName} (${request.role || "Staff"})`,
        request.quantity,
        request.unit || "",
        request.reason || "",
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

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="mt-5 space-y-6">
      {/* Modals */}
      {(showItemModal || editingItem) && (
        <ItemFormModal
          editItem={editingItem}
          onClose={() => { setShowItemModal(false); setEditingItem(null); }}
          onSave={handleSaveItem}
        />
      )}
      {rejectingRequest && (
        <RejectReasonModal
          request={rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          onReject={handleRejectConfirm}
        />
      )}
      {restockingItem && (
        <RestockModal
          item={restockingItem}
          onClose={() => setRestockingItem(null)}
          onRestock={handleRestockSubmit}
        />
      )}

      {/* Header */}
      <div className="rounded-2xl border border-[#ece8e1] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[42px] font-bold text-[#111827]">Inventory Management</h1>
            <p className="mt-2 text-[#525252]">Manage temple inventory stock and review staff requests.</p>
          </div>
          <div className="rounded-3xl bg-[#eff6ff] px-5 py-3 text-sm font-semibold text-[#1d4ed8]">Prasadam & Inventory</div>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#e5e7eb] bg-[#f8fafc] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Total Requests</p>
            <p className="mt-4 text-[2rem] font-bold text-[#0f172a]">{requestSummary.total}</p>
            <p className="mt-2 text-sm text-[#475569]">All staff inventory requests.</p>
          </div>
          <div className="rounded-3xl border border-[#fef3c7] bg-[#fffbeb] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#92400e]">Pending</p>
            <p className="mt-4 text-[2rem] font-bold text-[#92400e]">{requestSummary.pending}</p>
            <p className="mt-2 text-sm text-[#92400e]">Waiting for your review.</p>
          </div>
          <div className="rounded-3xl border border-[#d1fae5] bg-[#ecfdf5] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#166534]">Approved</p>
            <p className="mt-4 text-[2rem] font-bold text-[#166534]">{requestSummary.approved}</p>
            <p className="mt-2 text-sm text-[#166534]">Stock issued to staff.</p>
          </div>
          <div className="rounded-3xl border border-[#fee2e2] bg-[#fff1f2] p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[#b91c1c]">Rejected</p>
            <p className="mt-4 text-[2rem] font-bold text-[#b91c1c]">{requestSummary.rejected}</p>
            <p className="mt-2 text-sm text-[#b91c1c]">Requests with reasons.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-[#ece8e1] bg-white shadow-sm">
        <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex" }}>
          <button
            type="button"
            onClick={() => setActiveTab("items")}
            style={{
              padding: "14px 24px",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderBottom: activeTab === "items" ? "3px solid #2563eb" : "3px solid transparent",
              color: activeTab === "items" ? "#2563eb" : "#64748b",
            }}
          >
            📦 Inventory Items
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            style={{
              padding: "14px 24px",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderBottom: activeTab === "requests" ? "3px solid #2563eb" : "3px solid transparent",
              color: activeTab === "requests" ? "#2563eb" : "#64748b",
              position: "relative",
            }}
          >
            📋 Staff Requests
            {requestSummary.pending > 0 && (
              <span style={{
                background: "#ef4444", color: "#fff", borderRadius: "20px", fontSize: "11px",
                fontWeight: 700, padding: "1px 7px", marginLeft: "8px",
              }}>
                {requestSummary.pending}
              </span>
            )}
          </button>
        </div>

        {/* ─────── INVENTORY ITEMS TAB ─────── */}
        {activeTab === "items" && (
          <div className="p-6">
            <LowStockBanner items={inventoryItems} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Inventory Items</h2>
                <p className="mt-1 text-sm text-[#64748b]">Add, edit, or remove temple inventory items. Stock levels update automatically when requests are approved.</p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  style={{ border: "1px solid #cbd5e1", borderRadius: "30px", padding: "8px 16px", fontSize: "13px", outline: "none" }}
                />
                <button
                  type="button"
                  onClick={fetchInventoryItems}
                  className="rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f8fafc]"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingItem(null); setShowItemModal(true); }}
                  className="rounded-full bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {itemsError ? (
              <div className="mt-4 rounded-2xl border border-[#fee2e2] bg-[#fff1f2] p-4 text-sm text-[#b91c1c]">{itemsError}</div>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[#334155]">
                <thead className="border-b border-[#e2e8f0] text-[#475569]">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3">Min. Stock</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsLoading ? (
                    <tr><td colSpan="7" className="px-4 py-6 text-center text-sm text-[#64748b]">Loading inventory items…</td></tr>
                  ) : filteredItems.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-6 text-center text-sm text-[#64748b]">No inventory items found. Click "+ Add Item" to get started.</td></tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isLow = item?.currentStock <= item?.minimumStock;
                      const itemId = item?._id || item?.id;
                      return (
                        <tr key={itemId || index} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                          <td className="px-4 py-4 font-semibold text-[#0f172a]">{item?.name}</td>
                          <td className="px-4 py-4 text-[#64748b]" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item?.description}>{item?.description || "-"}</td>
                          <td className="px-4 py-4 text-[#64748b]">{item?.category || "-"}</td>
                          <td className="px-4 py-4">
                            <span style={{ fontWeight: 700, color: isLow ? "#b91c1c" : "#166534" }}>
                              {item?.currentStock}
                            </span>
                          </td>
                          <td className="px-4 py-4">{item?.minimumStock}</td>
                          <td className="px-4 py-4">{item?.unit}</td>
                          <td className="px-4 py-4">
                            <span
                              style={{
                                borderRadius: "20px",
                                padding: "4px 12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                background: isLow ? "#fee2e2" : "#d1fae5",
                                color: isLow ? "#b91c1c" : "#166534",
                              }}
                            >
                              {isLow ? "🔴 Low Stock" : "🟢 Available"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                onClick={() => handleRestockModalOpen(item)}
                                style={{ background: "#d1fae5", color: "#059669", border: "none", borderRadius: "20px", padding: "5px 14px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                              >
                                Restock
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "20px", padding: "5px 14px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                disabled={deletingItemId === itemId}
                                style={{ background: "#fff1f2", color: "#b91c1c", border: "none", borderRadius: "20px", padding: "5px 14px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                              >
                                {deletingItemId === itemId ? "..." : "Delete"}
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
        )}

        {/* ─────── STAFF REQUESTS TAB ─────── */}
        {activeTab === "requests" && (
          <div className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Staff Inventory Requests</h2>
                <p className="mt-2 text-sm text-[#64748b]">Approve or reject requests. Approving will automatically deduct from current stock.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => Promise.all([fetchInventoryRequests(), fetchInventoryItems()])}
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

            {/* Filters */}
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
                <span className="text-sm text-[#64748b]">{filteredInventoryRequests.length} matching requests</span>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[#334155]">
                <thead className="border-b border-[#e2e8f0] text-[#475569]">
                  <tr>
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Requested By</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Admin Reason</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsLoading ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-6 text-center text-sm text-[#64748b]">Loading inventory requests…</td>
                    </tr>
                  ) : filteredInventoryRequests.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-6 text-center text-sm text-[#64748b]">No inventory requests found.</td>
                    </tr>
                  ) : (
                    filteredInventoryRequests.map((request, index) => {
                      const reqId = request?._id || request?.id;
                      return (
                        <tr key={reqId || index} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                          <td className="px-4 py-4" style={{ fontFamily: "monospace", fontWeight: 700, color: "#6366f1" }}>
                            INV-{reqId?.slice(-4).toUpperCase() || "UNKN"}
                          </td>
                          <td className="px-4 py-4 font-semibold text-[#0f172a]">{request.itemName}</td>
                          <td className="px-4 py-4">{request.userName || request.staffName || "-"}</td>
                          <td className="px-4 py-4">{request.role || "Staff"}</td>
                          <td className="px-4 py-4">{request.quantity} {request.unit || ""}</td>
                          <td className="px-4 py-4" style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={request.reason}>
                            {request.reason || "-"}
                          </td>
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
                                  disabled={actionLoadingId === reqId}
                                >
                                  {actionLoadingId === reqId ? "Working…" : "✓ Approve"}
                                </button>
                                <button
                                  type="button"
                                  className="rounded-full bg-[#ef4444] px-3 py-2 text-xs font-semibold text-white hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:bg-[#fca5a5]"
                                  onClick={() => handleReject(request)}
                                  disabled={actionLoadingId === reqId}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-[#475569]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
