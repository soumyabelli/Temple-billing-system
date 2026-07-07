import { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardList, FaSpinner, FaCheck, FaExchangeAlt, FaTimes, FaCalendarDay, FaUserClock, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

const MyDuties = ({ darkMode }) => {
  const { user } = useAuth();
  const [duties, setDuties] = useState([]);
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState(null);

  // Transfer Form state
  const [transferForm, setTransferForm] = useState({
    requestedPriestId: "",
    reason: "",
    remarks: "",
  });

  // Complete Form state
  const [completeForm, setCompleteForm] = useState({
    remarks: "",
    duration: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  const fetchDuties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/priest/my-duties`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDuties(res.data);
    } catch (error) {
      console.error("Error fetching duties:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/priest/priests-list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPriests(res.data);
    } catch (error) {
      console.error("Error fetching priests:", error);
    }
  };

  useEffect(() => {
    fetchDuties();
    fetchPriests();
  }, []);

  const handleStartDuty = async (duty) => {
    if (!window.confirm(`Are you sure you want to start ${duty.poojaName}?`)) return;
    try {
      await axios.put(`${API_BASE}/priest/my-duties/start`, {
        referenceType: duty.referenceType,
        referenceId: duty.id,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      showNotification("Duty started successfully!");
      fetchDuties();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to start duty", "error");
    }
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.requestedPriestId || !transferForm.reason) {
      return showNotification("Please fill all required fields.", "error");
    }
    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_BASE}/priest/my-duties/transfer`, {
        referenceType: selectedDuty.referenceType,
        referenceId: selectedDuty.id,
        ...transferForm
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.warning) {
        showNotification(res.data.warning, "warning"); 
      } else {
        showNotification("Transfer request submitted successfully.");
      }
      setShowTransferModal(false);
      fetchDuties();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to request transfer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await axios.put(`${API_BASE}/priest/my-duties/complete`, {
        referenceType: selectedDuty.referenceType,
        referenceId: selectedDuty.id,
        ...completeForm
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      showNotification("Duty completed successfully!");
      setShowCompleteModal(false);
      fetchDuties();
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to complete duty", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTransferModal = (duty) => {
    setSelectedDuty(duty);
    setTransferForm({ requestedPriestId: "", reason: "", remarks: "" });
    setShowTransferModal(true);
  };

  const openCompleteModal = (duty) => {
    setSelectedDuty(duty);
    setCompleteForm({ remarks: "", duration: "" });
    setShowCompleteModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Assigned": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "In Progress": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Completed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Transfer Requested": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Transferred": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const glassClass = darkMode 
    ? "bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-slate-900/20" 
    : "bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50";
    
  const inputClass = darkMode
    ? "bg-slate-800/50 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-slate-500"
    : "bg-white/80 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-slate-400";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300 backdrop-blur-xl border ${
          notification.type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' :
          notification.type === 'warning' ? 'bg-amber-500/90 border-amber-400 text-white' :
          'bg-emerald-500/90 border-emerald-400 text-white'
        }`}>
          {notification.type === 'error' ? <FaExclamationCircle className="text-xl" /> : <FaCheckCircle className="text-xl" />}
          <p className="font-bold">{notification.message}</p>
        </div>
      )}

      {/* Header Section */}
      <div className={`p-8 rounded-[2rem] relative overflow-hidden ${glassClass}`}>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                <FaClipboardList className="text-xl text-white" />
              </span>
              My Duties
            </h2>
            <p className={`text-sm mt-3 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"} max-w-xl`}>
              View and manage all your assigned Poojas, Sevas, and Special Duties in one centralized location. Start or complete your duties to keep everything on track.
            </p>
          </div>
          <button 
            onClick={fetchDuties} 
            className="px-6 py-3 rounded-2xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 w-fit"
          >
            <FaExchangeAlt className="rotate-90" /> Refresh List
          </button>
        </div>
      </div>

      {/* Duties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <FaSpinner className="animate-spin text-4xl text-orange-500" />
            <p className={`font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading your duties...</p>
          </div>
        ) : duties.length === 0 ? (
          <div className={`col-span-full py-20 flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed ${darkMode ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-slate-50/50"}`}>
            <div className="w-20 h-20 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center">
              <FaClipboardList className="text-3xl text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-500">No duties assigned</p>
            <p className="text-sm text-slate-400">You are all caught up for now!</p>
          </div>
        ) : (
          duties.map((duty) => (
            <div 
              key={duty.id} 
              className={`flex flex-col p-6 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                duty.status === "Assigned" ? (darkMode ? "bg-slate-800/80 border-slate-700/50 shadow-blue-900/10" : "bg-white border-blue-100 shadow-blue-100/50") :
                duty.status === "In Progress" ? (darkMode ? "bg-orange-950/20 border-orange-900/30 shadow-orange-900/10" : "bg-orange-50 border-orange-100 shadow-orange-100/50") :
                duty.status === "Completed" ? (darkMode ? "bg-emerald-950/10 border-emerald-900/30 shadow-emerald-900/10" : "bg-emerald-50/50 border-emerald-100 shadow-emerald-100/50") :
                (darkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50/80 border-slate-200")
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusBadge(duty.status)}`}>
                  {duty.status}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  {duty.referenceType}
                </span>
              </div>
              
              <h3 className={`text-xl font-black mb-1 line-clamp-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                {duty.poojaName}
              </h3>
              
              <div className="space-y-3 mt-5 flex-1">
                <div className={`flex items-center gap-3 text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <FaCalendarDay />
                  </div>
                  <div>
                    <div className="font-bold">{duty.date.split(",")[0]}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{duty.time}</div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <FaUserClock />
                  </div>
                  <div className="truncate">
                    {duty.devotee !== "N/A" ? duty.devotee : <span className="italic text-slate-400">No Devotee Specified</span>}
                  </div>
                </div>

                <div className={`flex items-center gap-3 text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="truncate">{duty.area}</div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-3">
                {duty.status === "Assigned" && (
                  <>
                    <button
                      onClick={() => handleStartDuty(duty)}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      Start Duty
                    </button>
                    <button
                      onClick={() => openTransferModal(duty)}
                      className="flex-1 py-3 border-2 border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/5 text-sm font-bold rounded-xl hover:bg-orange-500/10 transition-all active:scale-95"
                    >
                      Transfer
                    </button>
                  </>
                )}
                {duty.status === "In Progress" && (
                  <button
                    onClick={() => openCompleteModal(duty)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    Mark as Completed
                  </button>
                )}
                {["Completed", "Transfer Requested", "Transferred"].includes(duty.status) && (
                  <div className="w-full text-center py-2 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                    No Action Required
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transfer Duty Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowTransferModal(false)}></div>
          <div className={`relative w-full max-w-lg rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${glassClass} border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900`}>
            
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <span className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <FaExchangeAlt />
                </span>
                Transfer Duty
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6 relative z-10">
              Request to transfer <strong className="font-black">{selectedDuty?.poojaName}</strong> to another priest. The transfer requires admin approval.
            </div>
            
            <form onSubmit={submitTransfer} className="space-y-5 relative z-10">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Select Priest *</label>
                <select
                  required
                  value={transferForm.requestedPriestId}
                  onChange={(e) => setTransferForm({ ...transferForm, requestedPriestId: e.target.value })}
                  className={`w-full p-3.5 rounded-2xl border text-sm outline-none appearance-none ${inputClass}`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${darkMode ? '%2394a3b8' : '%2364748b'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  <option value="">-- Choose a Priest --</option>
                  {priests
                    .filter(p => p._id !== user.id)
                    .map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                    ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sick leave, emergency"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className={`w-full p-3.5 rounded-2xl border text-sm outline-none ${inputClass}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Additional Remarks</label>
                <textarea
                  rows="3"
                  placeholder="Any details the admin or other priest should know..."
                  value={transferForm.remarks}
                  onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                  className={`w-full p-3.5 rounded-2xl border text-sm resize-none outline-none ${inputClass}`}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Duty Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowCompleteModal(false)}></div>
          <div className={`relative w-full max-w-lg rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${glassClass} border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900`}>
            
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FaCheck />
                </span>
                Complete Duty
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={submitComplete} className="space-y-5 relative z-10">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Duration (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 45"
                  value={completeForm.duration}
                  onChange={(e) => setCompleteForm({ ...completeForm, duration: e.target.value })}
                  className={`w-full p-3.5 rounded-2xl border text-sm outline-none ${inputClass}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Completion Remarks</label>
                <textarea
                  rows="3"
                  placeholder="Any details about the completion..."
                  value={completeForm.remarks}
                  onChange={(e) => setCompleteForm({ ...completeForm, remarks: e.target.value })}
                  className={`w-full p-3.5 rounded-2xl border text-sm resize-none outline-none ${inputClass}`}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : "Mark Completed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDuties;
