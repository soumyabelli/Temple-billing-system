import { useEffect, useState } from "react";

import axios from "axios";

import "./LeaveRequest.css";

const staff = JSON.parse(localStorage.getItem("user"));

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

const LeaveHistory = () => {

  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {

    const res = await axios.get(
      `http://localhost:5000/api/leaves/${staff.id}`
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

    <div className="leave-history-container">

      <h1>Leave Requests</h1>

      {/* TOP CARDS */}

      <div className="leave-cards">

        <div className="leave-card">
          <h2>{leaves.length}</h2>
          <p>Total Leaves</p>
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
