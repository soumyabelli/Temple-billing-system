import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  FaCalendarCheck,
  FaClock,
  FaFileDownload,
  FaTimesCircle,
  FaUserClock,
} from "react-icons/fa";
import {
  FiBell,
  FiBox,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiFilter,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { MdTempleHindu } from "react-icons/md";
import { TbChecklist } from "react-icons/tb";

import { useAuth } from "../../context/AuthContext";
import { getStaffAttendanceDashboard, markAttendance } from "../../services/attendanceService";
import "./StaffDashboard.css";
import "./Attendance.css";

const fallbackSummary = [
  {
    title: "Present Days",
    value: 24,
    note: "This Month",
    icon: FaCalendarCheck,
    tone: "success",
  },
  {
    title: "Absent Days",
    value: 2,
    note: "This Month",
    icon: FaTimesCircle,
    tone: "danger",
  },
  {
    title: "Half Days",
    value: 1,
    note: "This Month",
    icon: FaClock,
    tone: "warning",
  },
  {
    title: "Leave Days",
    value: 3,
    note: "This Month",
    icon: FaUserClock,
    tone: "info",
  },
];

const fallbackRecords = [
  { dateKey: "2026-05-26", date: "26 May 2026", checkIn: "06:12 AM", checkOut: "02:05 PM", shift: "Morning", status: "Present", workingHours: "7h 53m" },
  { dateKey: "2026-05-24", date: "24 May 2026", checkIn: "06:08 AM", checkOut: "02:00 PM", shift: "Morning", status: "Present", workingHours: "7h 52m" },
  { dateKey: "2026-05-23", date: "23 May 2026", checkIn: "06:15 AM", checkOut: "02:10 PM", shift: "Morning", status: "Present", workingHours: "7h 55m" },
  { dateKey: "2026-05-22", date: "22 May 2026", checkIn: "--", checkOut: "--", shift: "Morning", status: "Leave", workingHours: "--" },
  { dateKey: "2026-05-21", date: "21 May 2026", checkIn: "06:40 AM", checkOut: "02:00 PM", shift: "Morning", status: "Late", workingHours: "7h 20m" },
  { dateKey: "2026-05-20", date: "20 May 2026", checkIn: "06:10 AM", checkOut: "02:02 PM", shift: "Morning", status: "Present", workingHours: "7h 52m" },
  { dateKey: "2026-05-19", date: "19 May 2026", checkIn: "--", checkOut: "--", shift: "Morning", status: "Absent", workingHours: "--" },
  { dateKey: "2026-05-18", date: "18 May 2026", checkIn: "06:05 AM", checkOut: "02:00 PM", shift: "Morning", status: "Present", workingHours: "7h 55m" },
];

const fallbackOverview = [
  { label: "Working Days", value: "30" },
  { label: "Present", value: "24", tone: "success" },
  { label: "Absent", value: "2", tone: "danger" },
  { label: "Leave", value: "3", tone: "info" },
  { label: "Half Days", value: "1", tone: "warning" },
  { label: "Attendance", value: "80%", tone: "accent" },
];

const fallbackQuickActions = [
  {
    key: "mark-attendance",
    title: "Mark Attendance",
    description: "Check In / Check Out",
    icon: FaCalendarCheck,
    tone: "success",
  },
  {
    key: "history",
    title: "Attendance History",
    description: "View full attendance report",
    icon: FiFileText,
    tone: "warning",
  },
  {
    key: "download",
    title: "Download Report",
    description: "Download monthly report",
    icon: FaFileDownload,
    tone: "info",
  },
];

const fallbackCalendar = {
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  days: [
    { day: 28, muted: true },
    { day: 29, muted: true },
    { day: 30, muted: true },
    { day: 1 },
    { day: 2 },
    { day: 3, status: "present" },
    { day: 4, status: "present" },
    { day: 5 },
    { day: 6 },
    { day: 7 },
    { day: 8 },
    { day: 9, status: "present" },
    { day: 10, status: "present" },
    { day: 11 },
    { day: 12 },
    { day: 13 },
    { day: 14 },
    { day: 15 },
    { day: 16, status: "present" },
    { day: 17, status: "present" },
    { day: 18, status: "present" },
    { day: 19, status: "absent" },
    { day: 20, status: "present" },
    { day: 21, status: "late" },
    { day: 22, selected: true, status: "leave" },
    { day: 23, status: "present" },
    { day: 24, status: "present" },
    { day: 25, status: "present" },
    { day: 26, current: true },
    { day: 27 },
    { day: 28 },
    { day: 29 },
    { day: 30 },
    { day: 31 },
    { day: 1, muted: true },
  ],
};

const navSections = [
  { label: "Overview", icon: FiHome, path: "/staff" },
  { label: "My Duties", icon: TbChecklist, path: "/staff?section=duties" },
  { label: "Attendance", icon: FaCalendarCheck, path: "/staff/attendance", active: true },
  { label: "Leave Requests", icon: FiFileText, path: "/staff?section=leaveRequests" },
  { label: "Inventory Requests", icon: FiBox, path: "/staff?section=inventory" },
  { label: "Apply Leave", icon: FiCalendar, path: "/staff?section=applyLeave" },
  { label: "Notifications", icon: FiBell, path: "/staff?section=notifications" },
  { label: "Profile", icon: FiSettings, path: "/staff?section=profile" },
];

const statusLabelClass = {
  Present: "present",
  Late: "late",
  Leave: "leave",
  Absent: "absent",
  "Half Day": "half-day",
  Pending: "pending",
};

const summaryIconMap = {
  "Present Days": FaCalendarCheck,
  Present: FaCalendarCheck,
  "Absent Days": FaTimesCircle,
  Absent: FaTimesCircle,
  "Half Days": FaClock,
  "Leave Days": FaUserClock,
  Leave: FaUserClock,
};

const quickActionIconMap = {
  "mark-attendance": FaCalendarCheck,
  history: FiFileText,
  download: FaFileDownload,
};

const quickActionToneMap = {
  "mark-attendance": "success",
  history: "warning",
  download: "info",
};

const formatReportDate = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatReportTime = (value) => {
  if (!value || value === "--") return "--";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const createAttendanceReportPdf = ({
  templeName,
  staffName,
  roleLabel,
  monthLabel,
  headerDate,
  summaryCards,
  summary,
  records,
}) => {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const drawHeader = () => {
    pdf.setFillColor(255, 122, 0);
    pdf.rect(0, 0, pageWidth, 28, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Staff Attendance Report", margin, 12);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(templeName, margin, 19);
    pdf.text(`${monthLabel || "Current Month"}`, pageWidth - margin, 12, { align: "right" });
    pdf.text(`Generated ${headerDate || "-"}`, pageWidth - margin, 19, { align: "right" });
    pdf.setTextColor(31, 29, 25);
  };

  const drawSectionTitle = (text, y) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(31, 29, 25);
    pdf.text(text, margin, y);
    return y + 5;
  };

  const drawInfoRow = (label, value, x, y, width) => {
    pdf.setFillColor(250, 247, 241);
    pdf.setDrawColor(237, 229, 219);
    pdf.roundedRect(x, y, width, 18, 2, 2, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(120, 104, 86);
    pdf.text(label, x + 3, y + 6);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(31, 29, 25);
    const textValue = String(value ?? "-");
    const lines = pdf.splitTextToSize(textValue, width - 6);
    pdf.text(lines.slice(0, 2), x + 3, y + 12);
  };

  const addPageFooter = () => {
    const pageCount = pdf.getNumberOfPages();
    for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
      pdf.setPage(pageIndex);
      pdf.setDrawColor(235, 226, 213);
      pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(112, 103, 94);
      pdf.text(`Temple Staff Management Portal`, margin, pageHeight - 8);
      pdf.text(`Page ${pageIndex} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }
  };

  let y = 36;
  drawHeader();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(staffName || "Temple Staff", margin, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(92, 88, 83);
  pdf.text(roleLabel || "Temple Staff", margin, y + 6);
  pdf.text(`Attendance month: ${monthLabel || "-"}`, pageWidth - margin, y + 2, { align: "right" });
  pdf.text(`Status snapshot: ${summary?.attendancePercent ?? 0}% attendance`, pageWidth - margin, y + 8, {
    align: "right",
  });

  y += 18;
  pdf.setTextColor(31, 29, 25);
  y = drawSectionTitle("Monthly Summary", y);

  const metricLabels = [
    ["Working Days", summary?.workingDays ?? 0],
    ["Present Days", summary?.presentDays ?? 0],
    ["Absent Days", summary?.absentDays ?? 0],
    ["Leave Days", summary?.leaveDays ?? 0],
    ["Half Days", summary?.halfDays ?? 0],
    ["Attendance %", `${summary?.attendancePercent ?? 0}%`],
  ];

  const metricWidth = (contentWidth - 10) / 3;
  metricLabels.forEach((item, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const boxX = margin + column * (metricWidth + 5);
    const boxY = y + row * 21;
    drawInfoRow(item[0], item[1], boxX, boxY, metricWidth);
  });

  y += 42;
  y = drawSectionTitle("Recent Attendance Records", y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(92, 88, 83);
  pdf.text(`Showing ${records.length} record(s) from the selected month`, margin, y);
  y += 6;

  const tableHeaders = ["Date", "Check In", "Check Out", "Shift", "Status", "Hours"];
  const tableWidths = [31, 24, 24, 25, 23, 26];
  const tableX = margin;
  const headerHeight = 8;
  const rowHeight = 8;

  const drawTableHeader = (startY) => {
    pdf.setFillColor(255, 240, 223);
    pdf.setDrawColor(241, 206, 156);
    let cursorX = tableX;
    tableHeaders.forEach((header, index) => {
      pdf.rect(cursorX, startY, tableWidths[index], headerHeight, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(110, 69, 7);
      pdf.text(header, cursorX + 2, startY + 5.5);
      cursorX += tableWidths[index];
    });
    return startY + headerHeight;
  };

  const drawTableRow = (record, startY) => {
    let cursorX = tableX;
    const rowValues = [
      formatReportDate(record.date || record.dateKey),
      record.checkIn || "--",
      record.checkOut || "--",
      record.shift || "--",
      record.status || "--",
      record.workingHours || record.hours || "--",
    ];

    rowValues.forEach((value, index) => {
      pdf.setDrawColor(232, 225, 214);
      pdf.rect(cursorX, startY, tableWidths[index], rowHeight, "S");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.2);
      pdf.setTextColor(31, 29, 25);
      const lines = pdf.splitTextToSize(String(value), tableWidths[index] - 4);
      pdf.text(lines.slice(0, 2), cursorX + 2, startY + 5.2);
      cursorX += tableWidths[index];
    });

    return startY + rowHeight;
  };

  y = drawTableHeader(y);
  records.forEach((record) => {
    if (y + rowHeight > pageHeight - 22) {
      pdf.addPage();
      drawHeader();
      y = 36;
      y = drawSectionTitle("Recent Attendance Records (continued)", y);
      y = drawTableHeader(y + 1);
    }
    y = drawTableRow(record, y);
  });

  y += 8;
  if (y + 30 > pageHeight - 14) {
    pdf.addPage();
    drawHeader();
    y = 36;
  }

  y = drawSectionTitle("Report Notes", y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(92, 88, 83);
  const notes = [
    `This report summarizes the attendance data currently available for ${staffName || "the staff member"}.`,
    "Check-in/check-out times and working hours are generated from attendance entries stored in the system.",
    "Use this PDF as a printable attendance record for sharing or archiving.",
  ];
  notes.forEach((note, index) => {
    const lines = pdf.splitTextToSize(note, contentWidth);
    pdf.text(lines, margin, y + index * 6);
  });

  addPageFooter();
  return pdf;
};

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const shiftMonthKey = (monthKey, delta) => {
  const [yearPart, monthPart] = monthKey.split("-");
  const baseDate = new Date(Number(yearPart), Number(monthPart) - 1, 1);
  baseDate.setMonth(baseDate.getMonth() + delta);
  return getMonthKey(baseDate);
};

const getTodayKey = () => getMonthKey(new Date()) + `-${String(new Date().getDate()).padStart(2, "0")}`;

const Attendance = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [monthKey, setMonthKey] = useState(getMonthKey(new Date()));
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const displayName = dashboard?.staff?.name || user?.name || "Ramesh Kumar";
  const roleLabel = dashboard?.staff?.role
    ? `${dashboard.staff.role.charAt(0).toUpperCase()}${dashboard.staff.role.slice(1)}`
    : user?.designation || "Temple Staff";

  const initials = useMemo(() => {
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }, [displayName]);

  const staffId = user?.id || user?._id || "";
  const staffEmail = user?.email || "";
  const todayKey = getTodayKey();
  const currentAttendance = useMemo(
    () => (dashboard?.records || []).find((record) => record.dateKey === todayKey) || null,
    [dashboard, todayKey]
  );
  const attendanceCompleted = Boolean(currentAttendance?.checkIn && currentAttendance?.checkOut && currentAttendance.checkOut !== "--");
  const canCheckIn = !currentAttendance || !currentAttendance.checkIn || currentAttendance.checkIn === "--";
  const canCheckOut = Boolean(currentAttendance?.checkIn) && currentAttendance?.checkOut === "--";

  const loadAttendance = async () => {
    if (!staffId) {
      setError("Staff user not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await getStaffAttendanceDashboard(staffId, monthKey);
      setDashboard(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load attendance data");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId, monthKey]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleMarkAttendance = async () => {
    if (!staffId) return;

    const action = canCheckOut ? "check-out" : "check-in";

    try {
      setSavingAction(true);
      await markAttendance({
        staffId,
        staffName: displayName,
        staffEmail,
        action,
      });
      setAttendanceDialogOpen(false);
      await loadAttendance();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update attendance");
    } finally {
      setSavingAction(false);
    }
  };

  const handleQuickAction = async (actionKey) => {
    if (actionKey === "mark-attendance") {
      setAttendanceDialogOpen(true);
      return;
    }

    if (actionKey === "history") {
      document.getElementById("attendance-records")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (actionKey === "download") {
      try {
        setSavingAction(true);
        const pdf = createAttendanceReportPdf({
          templeName: "Sri Shanti Mahadev Mandir",
          staffName: displayName,
          roleLabel,
          monthLabel,
          headerDate,
          summaryCards,
          summary: dashboard?.summary || {
            workingDays: 30,
            presentDays: 24,
            absentDays: 2,
            leaveDays: 3,
            halfDays: 1,
            attendancePercent: 80,
          },
          records,
        });
        const fileName = `attendance-report-${monthLabel.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase() || "report"}.pdf`;
        pdf.save(fileName);
      } catch (reportError) {
        setError(reportError?.message || "Failed to generate attendance report");
      } finally {
        setSavingAction(false);
      }
    }
  };

  const summaryCards = dashboard?.overview?.length ? dashboard.overview : fallbackOverview;
  const records = dashboard?.records?.length ? dashboard.records : fallbackRecords;
  const calendar = dashboard?.calendar?.days?.length ? dashboard.calendar : fallbackCalendar;
  const quickActions = dashboard?.quickActions?.length ? dashboard.quickActions : fallbackQuickActions;
  const headerDate = dashboard?.headerDate || "Monday, 26 May 2026";
  const monthLabel = dashboard?.monthLabel || monthKey;
  const todaySnapshot = dashboard?.today || {};
  const attendanceDialogStatus = todaySnapshot.isOnLeave
    ? "Leave"
    : currentAttendance
      ? attendanceCompleted
        ? "Completed"
        : canCheckOut
          ? "Checked in"
          : "Not started"
      : "Not started";
  const todayShiftLabel = todaySnapshot.shiftName || todaySnapshot.shift || dashboard?.staff?.shift || user?.shift || "Morning";
  const todayShiftTiming =
    todaySnapshot.shiftStartTime && todaySnapshot.shiftEndTime
      ? `${todaySnapshot.shiftStartTime} - ${todaySnapshot.shiftEndTime}`
      : dashboard?.staff?.shiftStartTime && dashboard?.staff?.shiftEndTime
        ? `${dashboard.staff.shiftStartTime} - ${dashboard.staff.shiftEndTime}`
        : "Timing not set";
  const todayDutyLabel =
    todaySnapshot.duty?.dutyName ||
    todaySnapshot.duty?.duty ||
    todaySnapshot.duty?.title ||
    todaySnapshot.defaultDuty ||
    "No duty assigned";
  const todayDutyArea =
    todaySnapshot.duty?.dutyArea ||
    todaySnapshot.duty?.area ||
    todaySnapshot.duty?.description ||
    todaySnapshot.dutyLocation ||
    "Awaiting assignment";

  return (
    <div className="attendance-main staff-attendance-page">

        {error ? <div className="staff-error">{error}</div> : null}
        {loading ? <div className="staff-loading">Loading attendance data...</div> : null}

        {!loading ? (
          <>
            <section className="attendance-summary-grid">
              {summaryCards.map((stat) => {
                const Icon = stat.icon || summaryIconMap[stat.title || stat.label];
                return (
                  <article key={stat.title || stat.label} className="attendance-stat-card">
                    <div className={`attendance-stat-icon ${stat.tone || ""}`.trim()}>
                      {Icon ? <Icon /> : null}
                    </div>
                    <div className="attendance-stat-copy">
                      <h2>{stat.title || stat.label}</h2>
                      <strong>{stat.value}</strong>
                      <p>{stat.note || ""}</p>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="attendance-today-card">
              <div className="attendance-today-item">
                <span>Current Shift</span>
                <strong>{todayShiftLabel}</strong>
                <p>{todayShiftTiming}</p>
              </div>
              <div className="attendance-today-item">
                <span>Today&apos;s Duty</span>
                <strong>{todayDutyLabel}</strong>
                <p>{todayDutyArea}</p>
              </div>
              <div className="attendance-today-item">
                <span>Today Status</span>
                <strong>{attendanceDialogStatus}</strong>
                <p>
                  {todaySnapshot.isOnLeave
                    ? `${todaySnapshot.leaveType || "Approved leave"}${todaySnapshot.leaveReason ? `: ${todaySnapshot.leaveReason}` : ""}`
                    : todaySnapshot.completed
                      ? "Attendance completed"
                      : "Use Mark Attendance to check in or check out"}
                </p>
              </div>
            </section>

            <section className="attendance-workspace">
              <div className="attendance-main-column">
                <section className="attendance-card-panel" id="attendance-records">
                  <div className="card-heading attendance-card-heading">
                    <div>
                      <h2>My Attendance Records</h2>
                    </div>
                    <div className="attendance-card-controls">
                      <button type="button" className="attendance-control" onClick={() => setMonthKey((current) => shiftMonthKey(current, -1))}>
                        <FiChevronLeft />
                      </button>
                      <button type="button" className="attendance-control">
                        <FiCalendar />
                        {monthLabel}
                        <FiChevronDown />
                      </button>
                      <button type="button" className="attendance-control" onClick={() => setMonthKey((current) => shiftMonthKey(current, 1))}>
                        <FiChevronRight />
                      </button>
                      <button type="button" className="attendance-control">
                        <FiFilter />
                        Filter
                      </button>
                    </div>
                  </div>

                  <div className="table-wrap attendance-table-wrap">
                    <table className="attendance-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Shift</th>
                          <th>Status</th>
                          <th>Working Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.length === 0 ? (
                          <tr>
                            <td className="empty-cell" colSpan="6">
                              No attendance records found
                            </td>
                          </tr>
                        ) : (
                          records.map((record) => (
                            <tr key={record.id || record.dateKey}>
                              <td>{record.date}</td>
                              <td>{record.checkIn}</td>
                              <td>{record.checkOut}</td>
                              <td>{record.shift}</td>
                              <td>
                                <span className={`attendance-status-pill ${statusLabelClass[record.status] || ""}`}>
                                  {record.status}
                                </span>
                              </td>
                              <td>{record.workingHours}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button type="button" className="attendance-history-link" onClick={() => document.getElementById("attendance-records")?.scrollIntoView({ behavior: "smooth" })}>
                    View Full History
                  </button>
                </section>

                <section className="attendance-overview-card">
                  <div className="card-heading">
                    <h2>Monthly Overview ({monthLabel})</h2>
                  </div>

                  <div className="attendance-overview-grid">
                    {summaryCards.map((stat) => (
                      <article key={stat.title || stat.label} className={`attendance-overview-item ${stat.tone ? `tone-${stat.tone}` : ""}`}>
                        <span>{stat.label || stat.title}</span>
                        <strong>{stat.value}</strong>
                      </article>
                    ))}
                  </div>

                  <div className="attendance-progress">
                    <div className="attendance-progress__track">
                      <span style={{ width: `${dashboard?.summary?.attendancePercent || 80}%` }} />
                    </div>
                    <div className="attendance-progress__meta">
                      <span>
                        {dashboard?.summary?.presentDays || 24} / {dashboard?.summary?.workingDays || 30} Days
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="attendance-side-column">
                <section className="attendance-calendar-card">
                  <div className="card-heading">
                    <h2>Attendance Calendar</h2>
                  </div>

                  <div className="attendance-calendar-nav">
                    <button type="button" aria-label="Previous month" onClick={() => setMonthKey((current) => shiftMonthKey(current, -1))}>
                      <FiChevronLeft />
                    </button>
                    <strong>{calendar.monthLabel || monthLabel}</strong>
                    <button type="button" aria-label="Next month" onClick={() => setMonthKey((current) => shiftMonthKey(current, 1))}>
                      <FiChevronRight />
                    </button>
                  </div>

                  <div className="attendance-calendar-grid">
                    <div className="attendance-weekdays">
                      {calendar.weekdays.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>

                    <div className="attendance-days">
                      {calendar.days.map((cell, index) => {
                        const dayClassName = [
                          "attendance-day",
                          cell.muted ? "muted" : "",
                          cell.current ? "current" : "",
                          cell.selected ? "selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <div
                            key={`${cell.day}-${index}`}
                            className={dayClassName}
                            data-status={cell.status ? String(cell.status).toLowerCase() : undefined}
                          >
                            {cell.day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="attendance-calendar-legend">
                    <span>
                      <i className="legend-dot present" />
                      Present
                    </span>
                    <span>
                      <i className="legend-dot late" />
                      Late
                    </span>
                    <span>
                      <i className="legend-dot leave" />
                      Leave
                    </span>
                    <span>
                      <i className="legend-dot absent" />
                      Absent
                    </span>
                  </div>
                </section>

                <section className="attendance-actions-card">
                  <div className="card-heading">
                    <h2>Quick Actions</h2>
                  </div>

                  <div className="attendance-action-list">
                    {quickActions.map((action) => {
                      const Icon = action.icon || quickActionIconMap[action.key || action.title];
                      const tone = action.tone || quickActionToneMap[action.key || action.title];
                      return (
                        <button
                          key={action.key}
                          type="button"
                          className="attendance-action-item"
                          onClick={() => handleQuickAction(action.key)}
                          disabled={savingAction}
                        >
                          <span className={`attendance-action-icon ${tone || ""}`.trim()}>
                            {Icon ? <Icon /> : null}
                          </span>
                          <span className="attendance-action-copy">
                            <strong>{action.title}</strong>
                            <span>{action.description}</span>
                          </span>
                          <FiChevronRight className="attendance-action-chevron" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </section>

            <footer className="attendance-footer">(c) 2026 Sri Shanti Mahadev Mandir. All rights reserved.</footer>
          </>
        ) : null}

        {attendanceDialogOpen ? (
          <div className="attendance-modal-backdrop" role="presentation" onClick={() => setAttendanceDialogOpen(false)}>
            <div className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="attendance-mark-title" onClick={(event) => event.stopPropagation()}>
                <div className="attendance-modal__header">
                  <div>
                    <p className="attendance-modal__eyebrow">Mark Attendance</p>
                    <h2 id="attendance-mark-title">Quick attendance entry</h2>
                  </div>
                <button type="button" className="attendance-modal__close" onClick={() => setAttendanceDialogOpen(false)} aria-label="Close mark attendance panel">
                  ×
                </button>
              </div>

              <div className="attendance-modal__summary">
                <div>
                  <span>Today</span>
                  <strong>{headerDate}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{attendanceDialogStatus}</strong>
                </div>
                <div>
                  <span>Shift</span>
                  <strong>{todayShiftLabel}</strong>
                  <p>{todayShiftTiming}</p>
                </div>
                <div>
                  <span>Duty</span>
                  <strong>{todayDutyLabel}</strong>
                  <p>{todayDutyArea}</p>
                </div>
              </div>

              {todaySnapshot.isOnLeave ? (
                <div className="attendance-modal__leave">
                  <strong>Approved leave</strong>
                  <span>
                    {todaySnapshot.leaveType || "Leave"} {todaySnapshot.leaveReason ? `• ${todaySnapshot.leaveReason}` : ""}
                  </span>
                </div>
              ) : null}

              <div className="attendance-modal__actions">
                <button
                  type="button"
                  className="attendance-modal__button primary"
                  onClick={handleMarkAttendance}
                  disabled={savingAction || todaySnapshot.isOnLeave || (!canCheckIn && !canCheckOut)}
                >
                  {savingAction ? "Saving..." : todaySnapshot.isOnLeave ? "On Leave" : canCheckOut ? "Check Out" : "Check In"}
                </button>
                <button
                  type="button"
                  className="attendance-modal__button secondary"
                  onClick={() => setAttendanceDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>

              <p className="attendance-modal__note">
                {todaySnapshot.isOnLeave
                  ? "Attendance is blocked because approved leave exists for today."
                  : attendanceCompleted
                  ? "Attendance is already completed for today."
                  : canCheckOut
                    ? "You can check out now."
                    : "Use this panel to mark your daily attendance."}
              </p>
            </div>
          </div>
        ) : null}
    </div>
  );
};

export default Attendance;
