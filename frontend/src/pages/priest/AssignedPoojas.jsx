import { useEffect, useState } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlay,
  FaInfoCircle,
  FaPhoneAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  getAssignedPoojas,
  startPooja,
  completePooja,
  putPoojaPending,
} from "../../services/priestService";

const AssignedPoojas = ({ darkMode }) => {
  const [poojas, setPoojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pending Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoojaId, setSelectedPoojaId] = useState(null);
  const [pendingReason, setPendingReason] = useState("");
  const [modalError, setModalError] = useState("");

  const fetchPoojas = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch data using search and filter parameters
      const data = await getAssignedPoojas(filterStatus, searchQuery);
      setPoojas(data || []);
    } catch (err) {
      console.error("Error fetching assigned poojas:", err);
      setError("Failed to fetch assigned poojas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch on mount and when filters/search changes
    const delayDebounceFn = setTimeout(() => {
      fetchPoojas();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filterStatus, searchQuery]);

  const handleStart = async (id) => {
    try {
      await startPooja(id);
      fetchPoojas();
    } catch (err) {
      console.error("Error starting pooja:", err);
      alert("Failed to start pooja. Please try again.");
    }
  };

  const handleComplete = async (id) => {
    try {
      await completePooja(id);
      fetchPoojas();
    } catch (err) {
      console.error("Error completing pooja:", err);
      alert("Failed to complete pooja. Please try again.");
    }
  };

  const openPendingModal = (id) => {
    setSelectedPoojaId(id);
    setPendingReason("");
    setModalError("");
    setIsModalOpen(true);
  };

  const handlePendingSubmit = async (e) => {
    e.preventDefault();
    if (!pendingReason.trim()) {
      setModalError("Reason is mandatory to mark as pending.");
      return;
    }

    try {
      await putPoojaPending(selectedPoojaId, pendingReason);
      setIsModalOpen(false);
      fetchPoojas();
    } catch (err) {
      console.error("Error setting pooja to pending:", err);
      setModalError("Failed to update status. Please try again.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "In Progress":
        return "text-amber-600 bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      case "Pending":
        return "text-rose-600 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "Upcoming":
      case "Assigned":
      case "Confirmed":
        return "text-blue-600 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
      default:
        return "text-slate-500 bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header Panel */}
      <div
        className={`p-6 rounded-2xl border transition-colors ${
          darkMode
            ? "bg-[#1f2937] border-slate-700 text-slate-100"
            : "bg-white border-[#ece8e1] text-[#1d1b19]"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <span className="text-orange-500">🙏</span> Assigned Poojas & Sevas
            </h2>
            <p
              className={`text-sm mt-1.5 ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Perform rituals, manage statuses, and record completion times for assigned bookings.
            </p>
          </div>

          {/* Search bar */}
          <div
            className={`relative px-4 py-2.5 border rounded-xl flex items-center gap-2 w-full md:max-w-xs transition-all ${
              darkMode
                ? "border-slate-700 bg-slate-800 text-slate-100"
                : "border-slate-200 bg-[#fcfbf9] text-slate-800"
            }`}
          >
            <FaSearch className="text-slate-450 shrink-0" />
            <input
              type="text"
              placeholder="Search by ID, name, pooja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-medium"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2.5 mt-6 border-t border-dashed border-slate-250 dark:border-slate-700 pt-5">
          {["All", "Upcoming", "In Progress", "Completed", "Pending"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  filterStatus === status
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : darkMode
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div
        className={`rounded-2xl border transition-colors overflow-hidden ${
          darkMode ? "bg-[#1f2937] border-slate-700" : "bg-white border-[#ece8e1]"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-500"} font-medium`}>
              Loading assigned poojas...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <p className="text-rose-500 font-semibold text-center">{error}</p>
            <button
              onClick={fetchPoojas}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : poojas.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-3">📿</div>
            <h3 className={`text-base font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
              No Poojas Assigned
            </h3>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"} mt-1 max-w-xs mx-auto`}>
              There are no poojas matching your current filter. Keep performing your daily duties!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr
                  className={`border-b text-xs font-extrabold uppercase tracking-wider ${
                    darkMode
                      ? "border-slate-700 bg-slate-800/50 text-slate-400"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <th className="py-4 px-5">Booking ID</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-4">Pooja Name</th>
                  <th className="py-4 px-4">Devotee</th>
                  <th className="py-4 px-4">Mobile Number</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {poojas.map((pooja) => (
                  <tr
                    key={pooja.id}
                    className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-850/40 ${
                      darkMode ? "text-slate-350" : "text-slate-700"
                    }`}
                  >
                    <td className="py-4 px-5 font-mono text-xs font-bold">
                      {pooja.bookingId?.toString().substring(18) || pooja.bookingId}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                          {formatDate(pooja.date)}
                        </span>
                        <span className="text-xs text-orange-500 font-semibold">{pooja.time}</span>
                      </div>
                    </td>
                    <td 
                      className="py-4 px-4 font-extrabold"
                      style={{ color: darkMode ? '#ffffff' : '#0f172a' }}
                    >
                      {pooja.pooja}
                    </td>
                    <td className="py-4 px-4 font-semibold">{pooja.devotee}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold">
                        <FaPhoneAlt size={10} className="text-slate-400" /> {pooja.mobile}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${getStatusBadgeClass(
                            pooja.status
                          )}`}
                        >
                          {pooja.status}
                        </span>
                        {pooja.status === "Pending" && pooja.pendingReason && (
                          <span
                            className="text-[11px] text-rose-500 italic max-w-[150px] truncate"
                            title={pooja.pendingReason}
                          >
                            Reason: {pooja.pendingReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        {pooja.status !== "Completed" ? (
                          <>
                            {pooja.status !== "In Progress" ? (
                              <button
                                onClick={() => handleStart(pooja.id)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                <FaPlay size={8} /> Start Pooja
                              </button>
                            ) : (
                              <button
                                onClick={() => handleComplete(pooja.id)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                <FaCheckCircle size={10} /> Complete
                              </button>
                            )}
                            <button
                              onClick={() => openPendingModal(pooja.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 hover:bg-rose-100 transition-colors border border-rose-100 dark:border-rose-900/30 flex items-center gap-1"
                            >
                              <FaHourglassHalf size={10} /> Put Pending
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-extrabold flex items-center gap-1">
                            <FaCheckCircle className="text-emerald-500" /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Reason Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-xl mx-4 transition-colors ${
              darkMode ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-[#ece8e1] text-[#1d1b19]"
            }`}
          >
            <div className="flex items-center gap-2.5 text-rose-500 mb-4">
              <FaInfoCircle size={20} />
              <h3 className="text-lg font-bold">Put Pooja on Hold</h3>
            </div>
            
            <form onSubmit={handlePendingSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Reason for delay/pending status <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Awaiting devotee presence, missing pooja materials..."
                  value={pendingReason}
                  onChange={(e) => {
                    setPendingReason(e.target.value);
                    if (e.target.value.trim()) setModalError("");
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm transition-all resize-none ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-rose-500"
                      : "bg-[#fcfbf9] border-slate-200 text-[#1d1b19] focus:border-rose-500"
                  }`}
                ></textarea>
                {modalError && (
                  <p className="text-rose-500 text-xs font-semibold mt-1">
                    {modalError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    darkMode
                      ? "bg-transparent border-slate-700 text-slate-350 hover:bg-slate-800"
                      : "bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
                >
                  Save Reason
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedPoojas;
