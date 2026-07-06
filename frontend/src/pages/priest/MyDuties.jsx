import { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardList, FaSpinner, FaCheck, FaExchangeAlt, FaTimes } from "react-icons/fa";
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
      alert("Duty started successfully.");
      fetchDuties();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start duty");
    }
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.requestedPriestId || !transferForm.reason) {
      return alert("Please fill all required fields.");
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
        alert(res.data.warning); // Show conflict/leave warning if any
      }
      alert("Transfer request submitted successfully.");
      setShowTransferModal(false);
      fetchDuties();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request transfer");
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
      alert("Duty completed successfully.");
      setShowCompleteModal(false);
      fetchDuties();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to complete duty");
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
      case "Assigned": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "In Progress": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Transfer Requested": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Transferred": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className={`p-6 rounded-2xl border transition-colors ${darkMode ? "bg-[#1f2937] border-slate-700 text-slate-100" : "bg-white border-[#ece8e1]"}`}>
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <FaClipboardList className="text-orange-500" /> My Duties
        </h2>
        <p className={`text-sm mt-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          View and manage all your assigned Poojas, Sevas, and Special Duties here.
        </p>
      </div>

      <div className={`rounded-2xl border transition-colors overflow-hidden ${darkMode ? "bg-[#1f2937] border-slate-700" : "bg-white border-[#ece8e1]"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${darkMode ? "bg-slate-800/50 text-slate-300" : "bg-[#fdfaf5] text-slate-600"} text-sm border-b ${darkMode ? "border-slate-700" : "border-[#ece8e1]"}`}>
                <th className="p-4 font-bold">Date & Time</th>
                <th className="p-4 font-bold">Duty / Pooja Name</th>
                <th className="p-4 font-bold">Devotee</th>
                <th className="p-4 font-bold">Area</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8">
                    <div className="flex justify-center items-center gap-2 text-orange-500">
                      <FaSpinner className="animate-spin" /> Loading duties...
                    </div>
                  </td>
                </tr>
              ) : duties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-500">No duties assigned.</td>
                </tr>
              ) : (
                duties.map((duty) => (
                  <tr key={duty.id} className={`border-b last:border-0 ${darkMode ? "border-slate-700 hover:bg-slate-800/30" : "border-[#ece8e1] hover:bg-orange-50/30"} transition-colors`}>
                    <td className="p-4">
                      <div className="text-sm font-semibold">{duty.date.split(",")[0]}</div>
                      <div className="text-xs text-slate-500">{duty.time}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm">{duty.poojaName}</div>
                      <div className="text-xs text-slate-400 capitalize">{duty.referenceType}</div>
                    </td>
                    <td className="p-4 text-sm">{duty.devotee}</td>
                    <td className="p-4 text-sm">{duty.area}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(duty.status)}`}>
                        {duty.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        {duty.status === "Assigned" && (
                          <>
                            <button
                              onClick={() => handleStartDuty(duty)}
                              className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded shadow hover:bg-green-600 transition-colors"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => openTransferModal(duty)}
                              className="px-3 py-1.5 border border-orange-500 text-orange-500 text-xs font-bold rounded shadow-sm hover:bg-orange-50 transition-colors dark:hover:bg-orange-950/30"
                            >
                              Transfer
                            </button>
                          </>
                        )}
                        {duty.status === "In Progress" && (
                          <button
                            onClick={() => openCompleteModal(duty)}
                            className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded shadow hover:bg-blue-600 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {["Completed", "Transfer Requested", "Transferred"].includes(duty.status) && (
                          <span className="text-xs text-slate-400 font-semibold italic">No actions available</span>
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

      {/* Transfer Duty Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${darkMode ? "bg-[#1f2937] text-slate-100" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FaExchangeAlt className="text-orange-500" /> Transfer Duty
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-rose-500">
                <FaTimes />
              </button>
            </div>
            <p className="text-sm mb-4 text-slate-500 dark:text-slate-400">
              Request to transfer <strong className="text-slate-800 dark:text-slate-200">{selectedDuty?.poojaName}</strong> to another priest. The transfer requires admin approval.
            </p>
            <form onSubmit={submitTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Select Priest *</label>
                <select
                  required
                  value={transferForm.requestedPriestId}
                  onChange={(e) => setTransferForm({ ...transferForm, requestedPriestId: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-sm ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200"}`}
                >
                  <option value="">-- Choose a Priest --</option>
                  {priests
                    .filter(p => p._id !== user.id) // Cannot transfer to self
                    .map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sick leave, emergency"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-sm ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Additional Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Any details the admin or other priest should know..."
                  value={transferForm.remarks}
                  onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-sm resize-none ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200"}`}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${darkMode ? "bg-[#1f2937] text-slate-100" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FaCheck className="text-green-500" /> Complete Duty
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-rose-500">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={submitComplete} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 45"
                  value={completeForm.duration}
                  onChange={(e) => setCompleteForm({ ...completeForm, duration: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-sm ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Completion Remarks</label>
                <textarea
                  rows="3"
                  placeholder="Any details about the completion..."
                  value={completeForm.remarks}
                  onChange={(e) => setCompleteForm({ ...completeForm, remarks: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-sm resize-none ${darkMode ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200"}`}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
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
