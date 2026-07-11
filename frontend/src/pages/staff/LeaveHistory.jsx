import { useEffect, useState } from "react";

import axios from "axios";

import "./LeaveRequest.css";
import { useNavigate } from "react-router-dom";

const staff = JSON.parse(localStorage.getItem("user") || "null");

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDays = (fromDate, toDate) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to || to < from) return 0;
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.floor((to - from) / oneDayMs) + 1;
};

const formatPeriod = (fromDate, toDate) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to) return `${fromDate || "-"} to ${toDate || "-"}`;
  const fromLabel = from.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const toLabel = to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `${fromLabel} - ${toLabel}`;
};

const LeaveHistory = ({ darkMode, onApply }) => {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    if (!staff?.id && !staff?._id) return;
    const staffId = staff?.id || staff?._id;
    const res = await axios.get(
      `http://localhost:5000/api/leaves/${staffId}`
    );

    setLeaves(res.data);
  };

  const approved = leaves.filter(
    (l) => l.status === "Approved"
  ).length;

  const rejected = leaves.filter(
    (l) => l.status === "Rejected"
  ).length;

  const pending = leaves.filter(
    (l) => l.status === "Pending"
  ).length;

  return (

    <div className={`leave-history-container ${darkMode ? "dark" : ""}`}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Leave Requests</h1>
        <button 
          onClick={() => {
            if (onApply) onApply();
            else navigate("/cashier/apply-leave");
          }}
          style={{
            background: "linear-gradient(120deg, #ff7e00, #ff9f2f)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px 24px",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "15px"
          }}
        >
          Apply Leave
        </button>
      </div>

      {/* TOP CARDS */}

      <div className="leave-cards">

        <div className="leave-card">
          <h2>{leaves.length}</h2>
          <p>Total Applied</p>
        </div>

        <div className="leave-card green">
          <h2>{approved}</h2>
          <p>Approved</p>
        </div>

        <div className="leave-card red">
          <h2>{rejected}</h2>
          <p>Rejected</p>
        </div>

        <div className="leave-card orange">
          <h2>{pending}</h2>
          <p>Pending</p>
        </div>

      </div>

      {/* TABLE */}

      <table className="leave-table">

        <thead>
          <tr>
            <th>Type</th>
            <th>Reason</th>
            <th>Days</th>
            <th>Period</th>
            <th>Status</th>
            <th>Admin Reason</th>
          </tr>
        </thead>

        <tbody>

          {leaves.map((leave) => (

            <tr key={leave._id}>

              <td>{leave.leaveType || "General"}</td>
              <td>{leave.reason}</td>

              <td>{getDays(leave.fromDate, leave.toDate)}</td>

              <td>{formatPeriod(leave.fromDate, leave.toDate)}</td>

              <td>
                <span className={leave.status}>
                  {leave.status}
                </span>
              </td>

              <td>{leave.adminReason || "-"}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default LeaveHistory;
