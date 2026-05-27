import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiFileText,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import { MdTempleHindu } from "react-icons/md";
import { TbChecklist, TbHourglassLow, TbProgressCheck } from "react-icons/tb";
import { useAuth } from "../../context/AuthContext";
import "./StaffDashboard.css";

const API_BASE = "http://localhost:5000/api";
const POLL_INTERVAL_MS = 10000;
const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Festival Leave", "Emergency Leave", "General"];

const formatHeaderDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const statusClassMap = {
  Pending: "pending",
  "In Progress": "progress",
  Completed: "completed",
  Approved: "approved",
  Rejected: "rejected",
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const leaveDays = (fromDate, toDate) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to || to < from) {
    return 0;
  }
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.floor((to - from) / oneDayMs) + 1;
};

const leavePeriod = (fromDate, toDate) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to) {
    return `${fromDate || "-"} to ${toDate || "-"}`;
  }
  const fromLabel = from.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const toLabel = to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `${fromLabel} - ${toLabel}`;
};

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const staff = user || storedUser;

  const [activeSection, setActiveSection] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [error, setError] = useState("");
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "General",
    reason: "",
    fromDate: "",
    toDate: "",
  });

  const staffId = staff?.id || staff?._id || "";

  const fetchDashboardData = useCallback(async () => {
    if (!staffId) {
      setError("Staff user not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const [taskRes, leaveRes] = await Promise.all([
        axios.get(`${API_BASE}/staff/tasks/${staffId}`),
        axios.get(`${API_BASE}/leaves/${staffId}`),
      ]);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setLeaves(Array.isArray(leaveRes.data) ? leaveRes.data : []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  const taskSummary = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        acc.total += 1;
        if (task.status === "Completed") acc.completed += 1;
        if (task.status === "In Progress") acc.inProgress += 1;
        if (task.status === "Pending") acc.pending += 1;
        return acc;
      },
      { total: 0, completed: 0, inProgress: 0, pending: 0 }
    );
  }, [tasks]);

  const leaveSummary = useMemo(() => {
    return leaves.reduce(
      (acc, leave) => {
        acc.total += 1;
        if (leave.status === "Approved") acc.approved += 1;
        if (leave.status === "Rejected") acc.rejected += 1;
        if (leave.status === "Pending") acc.pending += 1;
        return acc;
      },
      { total: 0, approved: 0, rejected: 0, pending: 0 }
    );
  }, [leaves]);

  const latestLeaveDecision = useMemo(() => {
    return leaves.find((leave) => leave.status === "Approved" || leave.status === "Rejected");
  }, [leaves]);

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      setUpdatingTaskId(taskId);
      await axios.put(`${API_BASE}/staff/task-status/${taskId}`, { status });
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status } : task)));
    } catch (apiError) {
      alert(apiError.response?.data?.message || "Failed to update task status");
    } finally {
      setUpdatingTaskId("");
    }
  };

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();
    if (!leaveForm.reason.trim() || !leaveForm.fromDate || !leaveForm.toDate) {
      alert("Please fill all leave details");
      return;
    }
    if (leaveForm.fromDate > leaveForm.toDate) {
      alert("From date cannot be after To date");
      return;
    }

    try {
      setSubmittingLeave(true);
      await axios.post(`${API_BASE}/leaves/apply`, {
        ...leaveForm,
        staffId,
        staffName: staff?.name || "Staff",
      });
      setLeaveForm({
        leaveType: "General",
        reason: "",
        fromDate: "",
        toDate: "",
      });
      await fetchDashboardData();
      setActiveSection("leaveRequests");
      alert("Leave request sent to admin");
    } catch (apiError) {
      alert(apiError.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="staff-dashboard-page">
      <aside className="staff-sidebar">
        <div className="staff-brand">
          <div className="brand-icon">
            <MdTempleHindu />
          </div>
          <div>
            <h2>Sri Shanti</h2>
            <p>Mahadev Mandir</p>
          </div>
        </div>

        <nav className="staff-nav">
          <button
            type="button"
            className={activeSection === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveSection("dashboard")}
          >
            <FiHome /> Dashboard
          </button>
          <button
            type="button"
            className={activeSection === "leaveRequests" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveSection("leaveRequests")}
          >
            <FiFileText /> Leave Requests
          </button>
          <button
            type="button"
            className={activeSection === "applyLeave" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveSection("applyLeave")}
          >
            <FiCalendar /> Apply Leave
          </button>
          <button type="button" className="nav-item" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </nav>

      </aside>

      <main className="staff-main">
        <header className="staff-header">
          <div>
            <h1>Welcome back, {staff?.name || "Staff"}</h1>
            <p>Manage daily temple activities and assigned services.</p>
          </div>
          <div className="header-right">
            <span className="header-date">
              <FiCalendar /> {formatHeaderDate()}
            </span>
            <button type="button" className="notif-button" aria-label="Notifications">
              <FiBell />
              {taskSummary.pending > 0 ? <span>{taskSummary.pending}</span> : null}
            </button>
          </div>
        </header>

        {error ? <div className="staff-error">{error}</div> : null}

        {loading ? <div className="staff-loading">Loading dashboard...</div> : null}

        {!loading && activeSection === "dashboard" ? (
          <>
            <section className="top-cards">
              <article className="info-card">
                <div className="icon-bg orange">
                  <TbChecklist />
                </div>
                <div>
                  <h3>Today's Duties</h3>
                  <strong>{taskSummary.total.toString().padStart(2, "0")}</strong>
                  <p>Total Assigned Tasks</p>
                </div>
              </article>
              <article className="info-card">
                <div className="icon-bg green">
                  <FiCheckCircle />
                </div>
                <div>
                  <h3>Completed Tasks</h3>
                  <strong>{taskSummary.completed.toString().padStart(2, "0")}</strong>
                  <p>Marked Completed</p>
                </div>
              </article>
              <article className="info-card">
                <div className="icon-bg violet">
                  <TbProgressCheck />
                </div>
                <div>
                  <h3>In Progress</h3>
                  <strong>{taskSummary.inProgress.toString().padStart(2, "0")}</strong>
                  <p>Ongoing Services</p>
                </div>
              </article>
              <article className="info-card">
                <div className="icon-bg red">
                  <TbHourglassLow />
                </div>
                <div>
                  <h3>Pending Tasks</h3>
                  <strong>{taskSummary.pending.toString().padStart(2, "0")}</strong>
                  <p>Need Attention</p>
                </div>
              </article>
            </section>

            <section className="dashboard-grid">
              <div className="table-card">
                <div className="card-heading">
                  <h2>Today's Task Schedule</h2>
                </div>

                <div className="table-wrap">
                  <table className="task-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Area</th>
                        <th>Time</th>
                        <th>Assigned By</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-cell">
                            No task assigned
                          </td>
                        </tr>
                      ) : (
                        tasks.map((task) => (
                          <tr key={task._id}>
                            <td>{task.duty}</td>
                            <td>{task.area}</td>
                            <td>{task.time}</td>
                            <td>{task.assignedBy}</td>
                            <td>
                              <div className="status-control">
                                <span className={`status-chip ${statusClassMap[task.status] || ""}`}>
                                  {task.status}
                                </span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                                  disabled={updatingTaskId === task._id}
                                >
                                  {TASK_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="profile-card">
                <h2>Staff Profile</h2>
                <div className="profile-meta">
                  <div className="avatar">{(staff?.name || "S").charAt(0).toUpperCase()}</div>
                  <div>
                    <h3>{staff?.name || "Staff Member"}</h3>
                    <p className="role-badge">Temple Staff</p>
                  </div>
                </div>
                <ul>
                  <li>
                    <FiUser /> Employee ID: {staffId || "N/A"}
                  </li>
                  <li>
                    <FiMapPin /> Temple Area Service
                  </li>
                  <li>
                    <FiClock /> Shift: Morning / Evening
                  </li>
                </ul>
                <button type="button" onClick={() => setActiveSection("applyLeave")}>
                  Apply Leave
                </button>
              </div>
            </section>

            <section className="bottom-grid">
              <div className="leave-summary-card">
                <div className="card-heading">
                  <h2>Leave Requests</h2>
                  <button type="button" onClick={() => setActiveSection("leaveRequests")}>
                    View All
                  </button>
                </div>
                <div className="mini-stats">
                  <span>Total: {leaveSummary.total}</span>
                  <span>Approved: {leaveSummary.approved}</span>
                  <span>Rejected: {leaveSummary.rejected}</span>
                  <span>Pending: {leaveSummary.pending}</span>
                </div>
                <p className="latest-leave">
                  {latestLeaveDecision
                    ? `Latest decision: ${latestLeaveDecision.status}${latestLeaveDecision.adminReason ? ` (${latestLeaveDecision.adminReason})` : ""}`
                    : "No leave decision yet"}
                </p>
              </div>

              <div className="quick-actions-card">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                  <button type="button" onClick={() => setActiveSection("dashboard")}>
                    <FiClipboard />
                    <span>Task List</span>
                  </button>
                  <button type="button" onClick={() => setActiveSection("applyLeave")}>
                    <FiCalendar />
                    <span>Apply Leave</span>
                  </button>
                  <button type="button" onClick={() => setActiveSection("leaveRequests")}>
                    <FiFileText />
                    <span>Leave Status</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {!loading && activeSection === "leaveRequests" ? (
          <section className="leave-request-page">
            <div className="leave-head">
              <h2>My Leave Requests</h2>
              <button type="button" onClick={() => setActiveSection("applyLeave")}>
                Apply Leave
              </button>
            </div>

            <div className="leave-stat-grid">
              <article>
                <h3>{leaveSummary.total}</h3>
                <p>Total Applied</p>
              </article>
              <article className="approved-box">
                <h3>{leaveSummary.approved}</h3>
                <p>Approved</p>
              </article>
              <article className="rejected-box">
                <h3>{leaveSummary.rejected}</h3>
                <p>Rejected</p>
              </article>
              <article className="pending-box">
                <h3>{leaveSummary.pending}</h3>
                <p>Pending</p>
              </article>
            </div>

            <div className="table-card">
              <div className="table-wrap">
                <table className="task-table">
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
                    {leaves.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-cell">
                          No leave request submitted
                        </td>
                      </tr>
                    ) : (
                      leaves.map((leave) => (
                        <tr key={leave._id}>
                          <td>{leave.leaveType || "General"}</td>
                          <td>{leave.reason}</td>
                          <td>{leaveDays(leave.fromDate, leave.toDate)}</td>
                          <td>{leavePeriod(leave.fromDate, leave.toDate)}</td>
                          <td>
                            <span className={`status-chip ${statusClassMap[leave.status] || ""}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td>{leave.adminReason || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {!loading && activeSection === "applyLeave" ? (
          <section className="apply-leave-page">
            <h2>Apply Leave</h2>
            <p>Submit your leave request to admin.</p>

            <form onSubmit={handleLeaveSubmit} className="leave-form">
              <label htmlFor="leaveType">Leave Type</label>
              <select
                id="leaveType"
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm((prev) => ({ ...prev, leaveType: e.target.value }))}
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label htmlFor="reason">Reason</label>
              <input
                id="reason"
                type="text"
                placeholder="Enter leave reason"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
              />

              <div className="date-grid">
                <div>
                  <label htmlFor="fromDate">From Date</label>
                  <input
                    id="fromDate"
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, fromDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="toDate">To Date</label>
                  <input
                    id="toDate"
                    type="date"
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, toDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submittingLeave}>
                  {submittingLeave ? "Submitting..." : "Send Leave Request"}
                </button>
                <button type="button" className="secondary-btn" onClick={() => setActiveSection("dashboard")}>
                  Back to Dashboard
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default StaffDashboard;
