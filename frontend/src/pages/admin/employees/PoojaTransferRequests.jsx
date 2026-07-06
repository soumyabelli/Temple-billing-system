import { useState, useEffect } from "react";
import axios from "axios";
import { FaExchangeAlt, FaCheck, FaTimes, FaSpinner, FaUsers } from "react-icons/fa";
import AdminLayout from "../../../layouts/AdminLayout";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

const PoojaTransferRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [priests, setPriests] = useState([]);
  const [selectedPriest, setSelectedPriest] = useState({});

  useEffect(() => {
    fetchRequests();
    fetchPriests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/transfers/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching transfer requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriests = async () => {
    try {
      // Reusing the priest list endpoint created earlier
      const res = await axios.get(`${API_BASE}/priest/priests-list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPriests(res.data);
    } catch (error) {
      console.error("Error fetching priests:", error);
    }
  };

  const handleResolve = async (id, status, assignedPriestId = null) => {
    try {
      setActionLoading(id);
      const payload = { status };
      if (status === "Approved" && assignedPriestId) {
        payload.assignToPriestId = assignedPriestId;
      }

      await axios.put(`${API_BASE}/transfers/requests/${id}/resolve`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      alert(`Request ${status} successfully.`);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resolve request.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Approved": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaExchangeAlt className="text-orange-500" /> Pooja Transfer Requests
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and approve duty reassignment requests from priests.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#ece8e1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fdfaf5] text-slate-600 text-sm border-b border-[#ece8e1]">
                  <th className="p-4 font-bold">Duty Details</th>
                  <th className="p-4 font-bold">Requested By</th>
                  <th className="p-4 font-bold">Target Priest</th>
                  <th className="p-4 font-bold">Reason</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Admin Action</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={req.id} className="border-b last:border-0 border-[#ece8e1] hover:bg-orange-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-800">{req.dutyName}</div>
                        <div className="text-xs text-slate-500">{req.date} at {req.time}</div>
                        <div className="text-xs text-orange-500 mt-0.5">({req.referenceType})</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold">{req.originalPriest?.name || "Unknown"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold">{req.requestedPriest?.name || "Unknown"}</div>
                        {req.status === "Pending" && (
                          <div className="mt-2">
                            <select
                              className="text-xs border border-slate-300 rounded p-1"
                              value={selectedPriest[req.id] || req.requestedPriest?._id || ""}
                              onChange={(e) => setSelectedPriest({ ...selectedPriest, [req.id]: e.target.value })}
                            >
                              <option value={req.requestedPriest?._id}>Requested: {req.requestedPriest?.name}</option>
                              <optgroup label="Or Assign to Others:">
                                {priests.filter(p => p._id !== req.originalPriest?._id).map(p => (
                                  <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{req.reason}</div>
                        {req.remarks && <div className="text-xs text-slate-400 mt-1 italic">"{req.remarks}"</div>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {req.status === "Pending" ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleResolve(req.id, "Approved", selectedPriest[req.id] || req.requestedPriest?._id)}
                              disabled={actionLoading === req.id}
                              className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors disabled:opacity-50"
                              title="Approve & Assign"
                            >
                              {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            </button>
                            <button
                              onClick={() => handleResolve(req.id, "Rejected")}
                              disabled={actionLoading === req.id}
                              className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded transition-colors disabled:opacity-50"
                              title="Reject Transfer"
                            >
                              {actionLoading === req.id ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Resolved</span>
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
    </AdminLayout>
  );
};

export default PoojaTransferRequests;
