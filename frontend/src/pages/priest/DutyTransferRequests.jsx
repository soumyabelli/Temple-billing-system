import { useState, useEffect } from "react";
import axios from "axios";
import { FaExchangeAlt, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api";

const DutyTransferRequests = ({ darkMode }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/priest/my-duties/transfers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching transfer requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, status) => {
    try {
      setActionLoading(id);
      await axios.post(
        `${API_BASE}/priest/my-duties/transfer/${id}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      alert(`Request ${status} successfully.`);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to respond to request.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Approved": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Rejected": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className={`p-6 rounded-2xl border transition-colors ${darkMode ? "bg-[#1f2937] border-slate-700 text-slate-100" : "bg-temple-100 border-[#ece8e1] text-[#1d1b19]"}`}>
        <h2 className="text-2xl font-extrabold flex items-center gap-2">
          <FaExchangeAlt className="text-orange-500" /> Duty Transfer Requests
        </h2>
        <p className={`text-sm mt-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          View and manage your duty reassignment requests.
        </p>
      </div>

      <div className={`rounded-2xl border overflow-hidden transition-colors ${darkMode ? "bg-[#1f2937] border-slate-700" : "bg-temple-100 border-[#ece8e1]"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b ${darkMode ? "bg-slate-800/50 border-slate-700 text-slate-300" : "bg-[#fdfaf5] border-[#ece8e1] text-slate-600"}`}>
                <th className="p-4 font-bold">Duty Details</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Other Priest</th>
                <th className="p-4 font-bold">Reason</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? "divide-slate-700 text-slate-300" : "divide-slate-100 text-slate-700"}`}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8">
                    <FaSpinner className="animate-spin text-orange-500 mx-auto text-2xl" />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-500">
                    No transfer requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className={`hover:bg-orange-50/30 transition-colors ${darkMode ? "hover:bg-slate-800/50" : ""}`}>
                    <td className="p-4">
                      <div className={`font-bold text-sm ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{req.dutyName}</div>
                      <div className="text-xs opacity-75">{req.date} at {req.time}</div>
                      <div className="text-xs text-orange-500 mt-0.5">({req.referenceType})</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${req.type === "Outgoing" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{req.type === "Outgoing" ? req.requestedPriest?.name : req.originalPriest?.name}</div>
                      <div className="text-xs opacity-75">{req.type === "Outgoing" ? "Requested to" : "Requested by"}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{req.reason}</div>
                      {req.remarks && <div className="text-xs opacity-70 mt-1 italic">"{req.remarks}"</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {req.type === "Incoming" && req.status === "Pending" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleRespond(req.id, "Approved")}
                            disabled={actionLoading === req.id}
                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/40 rounded transition-colors disabled:opacity-50"
                            title="Accept Transfer"
                          >
                            {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                          </button>
                          <button
                            onClick={() => handleRespond(req.id, "Rejected")}
                            disabled={actionLoading === req.id}
                            className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800/40 rounded transition-colors disabled:opacity-50"
                            title="Reject Transfer"
                          >
                            {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs opacity-50 font-semibold italic">
                          {req.status === "Pending" ? "Waiting for action" : "Resolved"}
                        </span>
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

export default DutyTransferRequests;
