import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiFileText,
  FiHome,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiSave,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { FaCalendarCheck } from "react-icons/fa";
import { MdTempleHindu } from "react-icons/md";
import { TbChecklist, TbHourglassLow, TbProgressCheck } from "react-icons/tb";
import { useAuth } from "../../context/AuthContext";
import {
  changeEmployeePassword,
  getEmployeeProfile,
  updateEmployeeProfile,
} from "../../services/employeeService";
import Notifications from "./Notifications";
import "./StaffDashboard.css";

const API_BASE = "http://localhost:5000/api";
const POLL_INTERVAL_MS = 10000;
const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Festival Leave", "Emergency Leave", "General"];
const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const SHIFT_OPTIONS = ["Morning", "Day", "Afternoon", "Evening", "Night"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Temporary"];

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

const formatTaskDate = (value) => {
  if (!value) return "-";
  const normalizedValue = String(value);
  const date = new Date(normalizedValue.includes("T") ? normalizedValue : `${normalizedValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return normalizedValue;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const parseTaskTime = (value) => {
  if (!value) return 0;
  const timeValue = String(value).trim();
  if (/\d+:\d+\s*(AM|PM)/i.test(timeValue)) {
    const [timePart, meridiem] = timeValue.split(/\s+/);
    const [hours, minutes] = timePart.split(":").map(Number);
    const normalizedHours = hours % 12 + (meridiem.toUpperCase() === "PM" ? 12 : 0);
    return normalizedHours * 60 + (minutes || 0);
  }
  if (/\d+:\d+/.test(timeValue)) {
    const [hours, minutes] = timeValue.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
  return 0;
};

const sortTasksByDateTime = (a, b) => {
  const dateA = a.dueDate ? new Date(a.dueDate) : null;
  const dateB = b.dueDate ? new Date(b.dueDate) : null;
  if (dateA && dateB) {
    const dayDiff = dateA.getTime() - dateB.getTime();
    if (dayDiff !== 0) return dayDiff;
  }
  const timeA = parseTaskTime(a.time);
  const timeB = parseTaskTime(b.time);
  return timeA - timeB;
};

const toProfileForm = (profile = {}) => ({
  name: profile.name || "",
  email: profile.email || "",
  role: profile.role || "staff",
  gender: profile.gender || "Male",
  dob: profile.dob || "",
  bloodGroup: profile.bloodGroup || "O+",
  aadhaar: profile.aadhaar || "",
  phone: profile.phone || "",
  emergencyContact: profile.emergencyContact || "",
  address: profile.address || "",
  shift: profile.shift || "Morning",
  department: profile.department || "",
  salary: profile.salary || "",
  joiningDate: profile.joiningDate || "",
  employmentType: profile.employmentType || "Full-time",
  permissions: profile.permissions || "",
  status: profile.status || "Active",
});

const StaffDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const staff = user || storedUser;

  const [activeSection, setActiveSection] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailStatus, setDetailStatus] = useState("Pending");
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "General",
    reason: "",
    fromDate: "",
    toDate: "",
  });
  const [profileForm, setProfileForm] = useState(toProfileForm());
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const staffId = staff?.id || staff?._id || "";
  const displayName = profileForm.name || staff?.name || "Staff";
  const sectionFromQuery = new URLSearchParams(location.search).get("section");

  const fetchUnreadCount = useCallback(async () => {
    if (!staffId) return;
    try {
      const response = await axios.get(`${API_BASE}/staff/notifications/${staffId}/unread-count`);
      setNotificationUnreadCount(Number(response.data?.unreadCount || 0));
    } catch (apiError) {
      console.warn("Failed to load staff notification count", apiError);
    }
  }, [staffId]);

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

  const fetchProfileData = useCallback(async () => {
    if (!staffId) return;
    try {
      setProfileLoading(true);
      setProfileMessage("");
      const response = await getEmployeeProfile(staffId);
      setProfileForm(toProfileForm(response.profile));
    } catch (apiError) {
      setProfileMessage(apiError.response?.data?.message || "Failed to load profile details");
    } finally {
      setProfileLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const validSections = new Set(["dashboard", "duties", "leaveRequests", "applyLeave", "notifications", "profile"]);
    if (sectionFromQuery && validSections.has(sectionFromQuery)) {
      setActiveSection(sectionFromQuery);
    } else if (location.pathname === "/staff" && !sectionFromQuery) {
      setActiveSection("dashboard");
    }
  }, [location.pathname, sectionFromQuery]);

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

  const latestDuties = useMemo(() => {
    return tasks.slice().sort(sortTasksByDateTime).slice(0, 5);
  }, [tasks]);

  const filteredDuties = useMemo(() => {
    return tasks
      .slice()
      .sort(sortTasksByDateTime)
      .filter((task) => {
        const matchesStatus = filteredStatus === "all" || task.status === filteredStatus;
        const matchesSearch = searchQuery
          ? `${task.title || task.duty || ""} ${task.area || task.description || ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true;
        return matchesStatus && matchesSearch;
      });
  }, [tasks, filteredStatus, searchQuery]);

  const timelineItems = useMemo(() => filteredDuties, [filteredDuties]);

  useEffect(() => {
    if (activeSection === "duties" && tasks.length > 0) {
      setSelectedTask((current) => {
        const updated = current ? tasks.find((task) => task._id === current._id) : null;
        return updated || tasks[0] || null;
      });
    }
  }, [activeSection, tasks]);

  useEffect(() => {
    if (selectedTask) {
      setDetailStatus(selectedTask.status || "Pending");
    }
  }, [selectedTask]);

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
      setSelectedTask((prev) => (prev && prev._id === taskId ? { ...prev, status } : prev));
      if (selectedTask && selectedTask._id === taskId) {
        setDetailStatus(status);
      }
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
        staffName: displayName,
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

  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileMessage("Name and email are required");
      return;
    }

    try {
      setProfileSaving(true);
      setProfileMessage("");
      const response = await updateEmployeeProfile(staffId, profileForm);
      setProfileForm(toProfileForm(response.profile));
      if (response.authUser) {
        const token = localStorage.getItem("token");
        if (token) {
          localStorage.setItem("user", JSON.stringify(response.authUser));
        }
      }
      setProfileMessage("Profile updated successfully");
    } catch (apiError) {
      setProfileMessage(apiError.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Please fill all password fields");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordMessage("");
      await changeEmployeePassword(staffId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage("Password changed successfully");
    } catch (apiError) {
      setPasswordMessage(apiError.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
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
            <FiHome /> Overview
          </button>
          <button
            type="button"
            className={activeSection === "duties" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveSection("duties")}
          >
            <TbChecklist /> My Duties
          </button>
          <button
            type="button"
            className={activeSection === "attendance" ? "nav-item active" : "nav-item"}
            onClick={() => navigate("/staff/attendance")}
          >
            <FaCalendarCheck /> Attendance
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
          <button
            type="button"
            className={activeSection === "notifications" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveSection("notifications")}
          >
            <FiBell /> Notifications
            {notificationUnreadCount > 0 ? <span className="nav-count">{notificationUnreadCount}</span> : null}
          </button>
          <button
            type="button"
            className={activeSection === "profile" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActiveSection("profile");
              fetchProfileData();
            }}
          >
            <FiSettings /> Profile
          </button>
          <button type="button" className="nav-item" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </nav>

      </aside>

      <main className="staff-main">
        <header className="staff-header">
          <div>
            <h1>Welcome back, {displayName}</h1>
            <p>Manage daily temple activities and assigned services.</p>
          </div>
          <div className="header-right">
            <span className="header-date">
              <FiCalendar /> {formatHeaderDate()}
            </span>
            <button
              type="button"
              className="notif-button"
              aria-label="Notifications"
              onClick={() => setActiveSection("notifications")}
            >
              <FiBell />
              {notificationUnreadCount > 0 ? <span>{notificationUnreadCount}</span> : null}
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
              <div className="recent-duties-card">
                <div className="card-heading">
                  <div>
                    <h2>Recent Duties</h2>
                    <p>Latest assigned duties for today.</p>
                  </div>
                  <button type="button" className="secondary-btn" onClick={() => setActiveSection("duties")}>View All Duties →</button>
                </div>

                <div className="duties-list">
                  {latestDuties.length === 0 ? (
                    <div className="empty-cell">No duties assigned yet.</div>
                  ) : (
                    latestDuties.map((task) => (
                      <div key={task._id} className="duty-item">
                        <div>
                          <p className="duty-title">{task.title || task.duty || "Untitled Duty"}</p>
                          <p className="duty-meta">{task.area || task.description || "General duty"}</p>
                        </div>
                        <div className="duty-right">
                          <span className="duty-time">{task.time || "-"}</span>
                          <span className={`status-chip ${statusClassMap[task.status] || ""}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h2>Staff Profile</h2>
                <div className="profile-meta">
                  <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3>{displayName}</h3>
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
                <button type="button" onClick={() => setActiveSection("profile")}>Open Profile Settings</button>
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

        {!loading && activeSection === "duties" ? (
          <section className="duties-page">
            <div className="duties-head">
              <div>
                <h2>My Duties</h2>
                <p>Full duty management for today's staff assignments.</p>
              </div>
              <div className="duties-head-actions">
                <button type="button" className="secondary-btn" onClick={() => setActiveSection("dashboard")}>
                  Back to Overview
                </button>
                <button type="button" onClick={() => setSelectedTask(tasks[0] || null)}>
                  Select First Duty
                </button>
              </div>
            </div>

            <div className="duties-filters">
              <div>
                <label htmlFor="searchQuery">Search duties</label>
                <input
                  id="searchQuery"
                  type="text"
                  placeholder="Search duty name or area"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="statusFilter">Status</label>
                <select
                  id="statusFilter"
                  value={filteredStatus}
                  onChange={(e) => setFilteredStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="export-btn" onClick={() => {
                const rows = [
                  ["Duty Name", "Area", "Time", "Assigned By", "Status", "Description"],
                  ...filteredDuties.map((task) => [
                    task.title || task.duty || "",
                    task.area || task.description || "",
                    task.time || "",
                    task.assignedBy || "",
                    task.status || "",
                    task.description || task.area || "",
                  ]),
                ];
                const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "daily-duties.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}>
                Export
              </button>
            </div>

            <div className="duties-grid">
              <div>
                <div className="card-heading">
                  <h2>All Duties Assigned for Today</h2>
                  <p>{filteredDuties.length} duties found</p>
                </div>
                <div className="table-wrap duties-table">
                  <table className="task-table">
                    <thead>
                      <tr>
                        <th>Duty</th>
                        <th>Area</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Assigned By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDuties.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-cell">
                            No duties match the filter.
                          </td>
                        </tr>
                      ) : (
                        filteredDuties.map((task) => (
                          <tr
                            key={task._id}
                            className={selectedTask?._id === task._id ? "selected-row" : ""}
                            onClick={() => setSelectedTask(task)}
                          >
                            <td>{task.title || task.duty}</td>
                            <td>{task.area || task.description}</td>
                            <td>{task.time || "-"}</td>
                            <td>
                              <span className={`status-chip ${statusClassMap[task.status] || ""}`}>
                                {task.status}
                              </span>
                            </td>
                            <td>{task.assignedBy}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="timeline-card">
                  <div className="card-heading">
                    <h2>Duty Timeline</h2>
                  </div>
                  <div className="timeline-list">
                    {timelineItems.length === 0 ? (
                      <div className="empty-cell">No duties to show</div>
                    ) : (
                      timelineItems.map((task) => (
                        <div key={task._id} className="timeline-item">
                          <div>
                            <p className="duty-time">{task.time || "-"}</p>
                            <p className="duty-title">{task.title || task.duty}</p>
                          </div>
                          <span className={`status-chip ${statusClassMap[task.status] || ""}`}>{task.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <aside className="details-panel">
                <div className="card-heading">
                  <h2>Duty Information</h2>
                </div>
                {selectedTask ? (
                  <div className="details-content">
                    <div className="detail-row">
                      <span>Duty Name</span>
                      <strong>{selectedTask.title || selectedTask.duty}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Area</span>
                      <strong>{selectedTask.area || selectedTask.description || "General duty"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Assigned By</span>
                      <strong>{selectedTask.assignedBy || "Admin"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Time</span>
                      <strong>{selectedTask.time || "-"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Description</span>
                      <p>{selectedTask.description || selectedTask.area || "No additional details."}</p>
                    </div>
                    <div className="detail-row status-update-row">
                      <label htmlFor="detailStatus">Status</label>
                      <select
                        id="detailStatus"
                        value={detailStatus}
                        onChange={(e) => setDetailStatus(e.target.value)}
                        disabled={updatingTaskId === selectedTask._id}
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="status-update-button"
                      onClick={() => handleTaskStatusChange(selectedTask._id, detailStatus)}
                      disabled={updatingTaskId === selectedTask._id}
                    >
                      Update Status
                    </button>
                  </div>
                ) : (
                  <div className="empty-cell">Select a duty to view details.</div>
                )}
              </aside>
            </div>
          </section>
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

        {!loading && activeSection === "profile" ? (
          <section className="profile-settings-page">
            <div className="leave-head">
              <h2>Profile Settings</h2>
              <button type="button" onClick={fetchProfileData} disabled={profileLoading}>
                {profileLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="profile-settings-grid">
              <div className="table-card">
                <h3 className="section-title">My Details</h3>
                <p className="section-subtitle">Update your employee details added by admin.</p>
                <form onSubmit={handleProfileSave} className="leave-form">
                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-name">Full Name</label>
                      <input
                        id="profile-name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => handleProfileInputChange("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-email">Email</label>
                      <input
                        id="profile-email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileInputChange("email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-role">Role</label>
                      <input id="profile-role" type="text" value={profileForm.role} disabled />
                    </div>
                    <div>
                      <label htmlFor="profile-status">Status</label>
                      <input
                        id="profile-status"
                        type="text"
                        value={profileForm.status}
                        onChange={(e) => handleProfileInputChange("status", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-gender">Gender</label>
                      <select
                        id="profile-gender"
                        value={profileForm.gender}
                        onChange={(e) => handleProfileInputChange("gender", e.target.value)}
                      >
                        {GENDER_OPTIONS.map((gender) => (
                          <option key={gender} value={gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="profile-blood">Blood Group</label>
                      <select
                        id="profile-blood"
                        value={profileForm.bloodGroup}
                        onChange={(e) => handleProfileInputChange("bloodGroup", e.target.value)}
                      >
                        {BLOOD_GROUPS.map((bloodGroup) => (
                          <option key={bloodGroup} value={bloodGroup}>
                            {bloodGroup}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-dob">Date of Birth</label>
                      <input
                        id="profile-dob"
                        type="date"
                        value={profileForm.dob}
                        onChange={(e) => handleProfileInputChange("dob", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-joining">Joining Date</label>
                      <input
                        id="profile-joining"
                        type="date"
                        value={profileForm.joiningDate}
                        onChange={(e) => handleProfileInputChange("joiningDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-aadhaar">Aadhaar</label>
                      <input
                        id="profile-aadhaar"
                        type="text"
                        value={profileForm.aadhaar}
                        onChange={(e) => handleProfileInputChange("aadhaar", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-phone">Phone</label>
                      <input
                        id="profile-phone"
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => handleProfileInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-emergency">Emergency Contact</label>
                      <input
                        id="profile-emergency"
                        type="text"
                        value={profileForm.emergencyContact}
                        onChange={(e) => handleProfileInputChange("emergencyContact", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-shift">Shift</label>
                      <select
                        id="profile-shift"
                        value={profileForm.shift}
                        onChange={(e) => handleProfileInputChange("shift", e.target.value)}
                      >
                        {SHIFT_OPTIONS.map((shift) => (
                          <option key={shift} value={shift}>
                            {shift}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-department">Department</label>
                      <input
                        id="profile-department"
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => handleProfileInputChange("department", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-employment">Employment Type</label>
                      <select
                        id="profile-employment"
                        value={profileForm.employmentType}
                        onChange={(e) => handleProfileInputChange("employmentType", e.target.value)}
                      >
                        {EMPLOYMENT_TYPES.map((employmentType) => (
                          <option key={employmentType} value={employmentType}>
                            {employmentType}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="date-grid">
                    <div>
                      <label htmlFor="profile-salary">Salary</label>
                      <input
                        id="profile-salary"
                        type="text"
                        value={profileForm.salary}
                        onChange={(e) => handleProfileInputChange("salary", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-permissions">Permissions</label>
                      <input
                        id="profile-permissions"
                        type="text"
                        value={profileForm.permissions}
                        onChange={(e) => handleProfileInputChange("permissions", e.target.value)}
                      />
                    </div>
                  </div>

                  <label htmlFor="profile-address">Address</label>
                  <textarea
                    id="profile-address"
                    rows="3"
                    value={profileForm.address}
                    onChange={(e) => handleProfileInputChange("address", e.target.value)}
                  />

                  {profileMessage ? <p className="profile-note">{profileMessage}</p> : null}

                  <div className="form-actions">
                    <button type="submit" disabled={profileSaving}>
                      <FiSave />
                      {profileSaving ? "Saving..." : "Save Profile"}
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => setActiveSection("dashboard")}>
                      Back to Dashboard
                    </button>
                  </div>
                </form>
              </div>

              <div className="table-card">
                <h3 className="section-title">Change Password</h3>
                <p className="section-subtitle">Use your current password to create a new secure password.</p>
                <form onSubmit={handlePasswordSave} className="leave-form">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />

                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />

                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />

                  {passwordMessage ? <p className="profile-note">{passwordMessage}</p> : null}

                  <div className="form-actions">
                    <button type="submit" disabled={passwordSaving}>
                      <FiLock />
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        ) : null}

        {!loading && activeSection === "notifications" ? (
          <Notifications staffId={staffId} onUnreadCountChange={setNotificationUnreadCount} />
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
