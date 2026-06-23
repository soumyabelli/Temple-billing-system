import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaBoxOpen, FaSearch, FaPlus, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

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

const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400";
    case "Rejected":
      return "text-rose-600 bg-rose-50 border border-rose-100 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400";
    case "Pending":
      return "text-amber-600 bg-amber-50 border border-amber-100 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400";
    default:
      return "text-slate-500 bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400";
  }
};

const PriestInventory = ({ darkMode }) => {
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

  return (
    <div className="space-y-6 fade-in">
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center md:justify-between transition-colors ${darkMode ? "bg-[#1f2937] border-slate-700 text-slate-100" : "bg-white border-[#ece8e1] text-[#1d1b19]"}`}>
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <FaBoxOpen className="text-orange-500" /> Inventory Requests
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Request pooja materials and track request status.
          </p>
        </div>
        <button onClick={fetchData} className="mt-4 md:mt-0 px-4 py-2 rounded-xl text-sm font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: summary.total, icon: <FaBoxOpen />, color: "bg-purple-100 text-purple-600" },
          { label: "Pending", value: summary.pending, icon: <FaClock />, color: "bg-amber-100 text-amber-600" },
          { label: "Approved", value: summary.approved, icon: <FaCheckCircle />, color: "bg-emerald-100 text-emerald-600" },
          { label: "Rejected", value: summary.rejected, icon: <FaTimesCircle />, color: "bg-rose-100 text-rose-600" },
        ].map((s, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border flex items-center gap-4 ${darkMode ? "bg-[#1f2937] border-slate-700" : "bg-white border-[#ece8e1]"}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-extrabold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{s.value}</p>
              <p className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-[#1f2937] border-slate-700" : "bg-white border-[#ece8e1]"}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>
            <FaPlus className="text-orange-500" /> New Request
          </h3>

          {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-600 text-sm border border-rose-100">{error}</div>}
          {successMsg && <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-600 text-sm border border-emerald-100">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Item Name *</label>
              <select
                value={form.itemName}
                onChange={(e) => setForm((p) => ({ ...p, itemName: e.target.value, unit: catalog.find((i) => i.name === e.target.value)?.unit || "Pack" }))}
                className={`w-full p-2.5 rounded-xl border text-sm outline-none ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-white border-slate-200"}`}
              >
                <option value="">Select an Item</option>
                {catalog.map((item) => (
                  <option key={item._id} value={item.name}>{item.name} ({item.status})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Quantity *</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  placeholder="0"
                  className={`w-full p-2.5 rounded-xl border text-sm outline-none ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-white border-slate-200"}`}
                />
              </div>
              <div className="flex-1">
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Unit</label>
                <input
                  type="text"
                  value={form.unit}
                  disabled
                  className={`w-full p-2.5 rounded-xl border text-sm outline-none ${darkMode ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-slate-100 border-slate-200"}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Reason *</label>
              <textarea
                rows="2"
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Why is this needed?"
                className={`w-full p-2.5 rounded-xl border text-sm outline-none resize-none ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-white border-slate-200"}`}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:bg-orange-300"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className={`lg:col-span-2 rounded-2xl p-6 border ${darkMode ? "bg-[#1f2937] border-slate-700" : "bg-white border-[#ece8e1]"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className={`text-lg font-bold ${darkMode ? "text-slate-100" : "text-[#1d1b19]"}`}>My Requests</h3>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`p-2 rounded-xl border text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-white border-slate-200"}`}
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"}`}>
                <FaSearch className="text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs w-24 sm:w-auto"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className={`border-b ${darkMode ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Item</th>
                  <th className="pb-3 font-semibold">Quantity</th>
                  <th className="pb-3 font-semibold">Reason</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-slate-800" : "divide-slate-100"}`}>
                {loading ? (
                  <tr><td colSpan="6" className="py-6 text-center text-slate-500">Loading...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan="6" className="py-6 text-center text-slate-500">No requests found.</td></tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req._id} className={darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}>
                      <td className={`py-3 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{formatDateTime(req.createdAt)}</td>
                      <td className={`py-3 font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{req.itemName}</td>
                      <td className={`py-3 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{req.quantity} {req.unit}</td>
                      <td className={`py-3 ${darkMode ? "text-slate-300" : "text-slate-600"}`} style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={req.reason}>{req.reason}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className={`py-3 ${darkMode ? "text-slate-300" : "text-slate-600"}`} style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={req.adminReason || "-"}>{req.adminReason || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriestInventory;
