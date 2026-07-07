import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaBoxOpen, FaSearch, FaPlus, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt } from "react-icons/fa";
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
      return "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20";
    case "Rejected":
      return "text-rose-600 bg-rose-500/10 border border-rose-500/20";
    case "Pending":
      return "text-amber-600 bg-amber-500/10 border border-amber-500/20";
    default:
      return "text-slate-500 bg-slate-500/10 border border-slate-500/20";
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

  const glassClass = darkMode 
    ? "bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-slate-900/20" 
    : "bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50";

  const inputClass = darkMode
    ? "bg-slate-800/50 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-slate-500"
    : "bg-white/80 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-slate-400";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Section */}
      <div className={`p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center md:justify-between relative overflow-hidden ${glassClass}`}>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            <FaBoxOpen className="text-orange-500" /> Inventory Requests
          </h2>
          <p className={`text-sm mt-2 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Manage your pooja materials and track request status seamlessly.
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="relative z-10 mt-6 md:mt-0 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
        >
          <FaClock /> Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Requests", value: summary.total, icon: <FaBoxOpen />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { label: "Pending", value: summary.pending, icon: <FaClock />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Approved", value: summary.approved, icon: <FaCheckCircle />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Rejected", value: summary.rejected, icon: <FaTimesCircle />, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
        ].map((s, idx) => (
          <div key={idx} className={`p-6 rounded-[2rem] flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 ${glassClass} hover:shadow-lg`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${s.color} ${s.bg} border ${s.border} shadow-inner`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-3xl font-black ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{s.value}</p>
              <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className={`xl:col-span-1 rounded-[2rem] p-8 h-fit sticky top-6 ${glassClass}`}>
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
            <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <FaPlus className="text-sm" />
            </span>
            New Request
          </h3>

          {error && <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 text-rose-600 text-sm border border-rose-500/20 font-medium animate-in fade-in slide-in-from-top-2">{error}</div>}
          {successMsg && <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 text-sm border border-emerald-500/20 font-medium animate-in fade-in slide-in-from-top-2">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Item Name *</label>
              <select
                value={form.itemName}
                onChange={(e) => setForm((p) => ({ ...p, itemName: e.target.value, unit: catalog.find((i) => i.name === e.target.value)?.unit || "Pack" }))}
                className={`w-full p-3.5 rounded-2xl border text-sm outline-none appearance-none ${inputClass}`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${darkMode ? '%2394a3b8' : '%2364748b'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                <option value="">Select an Item</option>
                {catalog.map((item) => (
                  <option key={item._id} value={item.name}>{item.name} ({item.status})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Quantity *</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  placeholder="0.0"
                  className={`w-full p-3.5 rounded-2xl border text-sm outline-none ${inputClass}`}
                />
              </div>
              <div className="flex-1">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Unit</label>
                <input
                  type="text"
                  value={form.unit}
                  disabled
                  className={`w-full p-3.5 rounded-2xl border text-sm outline-none cursor-not-allowed ${darkMode ? "bg-slate-800/30 border-slate-700/50 text-slate-500" : "bg-slate-100/50 border-slate-200/50 text-slate-400"}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Reason *</label>
              <textarea
                rows="3"
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Why is this material needed?"
                className={`w-full p-3.5 rounded-2xl border text-sm outline-none resize-none ${inputClass}`}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {submitting ? "Submitting Request..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className={`xl:col-span-2 rounded-[2rem] p-8 flex flex-col ${glassClass}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h3 className={`text-xl font-bold flex items-center gap-3 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
              <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <FaCalendarAlt className="text-sm" />
              </span>
              My Requests
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-full sm:w-auto p-2.5 rounded-xl border text-sm outline-none appearance-none cursor-pointer font-medium ${inputClass}`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${darkMode ? '%2394a3b8' : '%2364748b'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em', paddingRight: '2.5rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className={`w-full sm:w-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border focus-within:ring-2 focus-within:ring-orange-500/50 transition-all ${inputClass.split('focus:')[0]}`}>
                <FaSearch className={darkMode ? "text-slate-500" : "text-slate-400"} />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full sm:w-48 placeholder-inherit"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className={`border-b ${darkMode ? "border-slate-700 bg-slate-800/50 text-slate-300" : "border-slate-200 bg-slate-50/50 text-slate-600"}`}>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Item</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Quantity</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Reason</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Remarks</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-slate-800/50" : "divide-slate-200/50"}`}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                        <FaClock className="animate-spin text-2xl text-orange-500" />
                        <span className="font-medium">Loading requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                          <FaBoxOpen className="text-2xl text-slate-400" />
                        </div>
                        <span className="font-medium text-lg">No requests found</span>
                        <span className="text-sm">Try adjusting your search or filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req._id} className={`group transition-colors ${darkMode ? "hover:bg-slate-800/40" : "hover:bg-orange-50/40"}`}>
                      <td className={`px-6 py-4 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {formatDateTime(req.createdAt)}
                      </td>
                      <td className={`px-6 py-4 font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {req.itemName}
                      </td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">
                          {req.quantity} {req.unit}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <div className="max-w-[180px] truncate" title={req.reason}>
                          {req.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex w-fit items-center gap-1.5 ${getStatusColor(req.status)}`}>
                          {req.status === 'Approved' && <FaCheckCircle className="text-[10px]" />}
                          {req.status === 'Pending' && <FaClock className="text-[10px]" />}
                          {req.status === 'Rejected' && <FaTimesCircle className="text-[10px]" />}
                          {req.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <div className="max-w-[150px] truncate" title={req.adminReason || "-"}>
                          {req.adminReason ? (
                            <span className="italic">{req.adminReason}</span>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
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
