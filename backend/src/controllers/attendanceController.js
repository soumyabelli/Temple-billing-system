const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Task = require("../models/Task");
const User = require("../models/User");

const ATTENDANCE_STATUSES = ["Present", "Absent", "Late", "Half Day", "Leave"];
const CHECK_IN_LATE_TIME = { hour: 9, minute: 30 };

const clean = (value) => String(value || "").trim();
const normalizeEmail = (value) => clean(value).toLowerCase();

const toDateKey = (date) => date.toISOString().slice(0, 10);

const parseDateKey = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatLongDateLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatTimeLabel = (date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatWorkingHours = (minutes) => {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  return `${hours}h ${remainder}m`;
};

const getMonthRange = (monthValue, referenceDate = new Date()) => {
  const monthKey = /^\d{4}-\d{2}$/.test(monthValue) ? monthValue : toDateKey(referenceDate).slice(0, 7);
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0);
  return {
    monthKey,
    year,
    monthIndex,
    startDate,
    endDate,
    monthLabel: startDate.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
  };
};

const findByIdIfValid = async (Model, id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Model.findById(id);
};

const resolveStaffContext = async ({ staffId, staffName, staffEmail }) => {
  const normalizedEmail = normalizeEmail(staffEmail);

  let user =
    (await findByIdIfValid(User, staffId)) ||
    (normalizedEmail ? await User.findOne({ email: normalizedEmail }) : null);

  let employee =
    (await findByIdIfValid(Employee, staffId)) ||
    (user?.email ? await Employee.findOne({ email: user.email }) : null) ||
    (normalizedEmail ? await Employee.findOne({ email: normalizedEmail }) : null);

  if (!user && employee?.email) {
    user = await User.findOne({ email: employee.email });
  }

  return {
    staffId: user?._id?.toString() || employee?._id?.toString() || clean(staffId),
    staffName: employee?.name || user?.name || clean(staffName),
    staffEmail: employee?.email || user?.email || normalizedEmail,
    employeeId: employee?._id?.toString() || "",
    shift: employee?.shift || "Morning",
    department: employee?.department || "",
    role: user?.role || employee?.role || "staff",
  };
};

const getStaffAttendanceTargets = async (staffId) => {
  const ids = new Set();
  const emails = new Set();

  const user = await findByIdIfValid(User, staffId);
  const employee = await findByIdIfValid(Employee, staffId);

  if (user?._id) ids.add(user._id.toString());
  if (employee?._id) ids.add(employee._id.toString());
  if (user?.email) emails.add(normalizeEmail(user.email));
  if (employee?.email) emails.add(normalizeEmail(employee.email));

  if (user?.email) {
    const linkedEmployee = await Employee.findOne({ email: user.email });
    if (linkedEmployee?._id) ids.add(linkedEmployee._id.toString());
    if (linkedEmployee?.email) emails.add(normalizeEmail(linkedEmployee.email));
  }

  if (employee?.email) {
    const linkedUser = await User.findOne({ email: employee.email });
    if (linkedUser?._id) ids.add(linkedUser._id.toString());
    if (linkedUser?.email) emails.add(normalizeEmail(linkedUser.email));
  }

  if (!ids.size && clean(staffId)) {
    ids.add(clean(staffId));
  }

  return {
    ids: [...ids].filter(Boolean),
    emails: [...emails].filter(Boolean),
  };
};

const buildAttendanceQuery = async (staffId, dateRange = {}) => {
  const targets = await getStaffAttendanceTargets(staffId);
  const filters = [];

  if (targets.ids.length) {
    filters.push({ staffId: { $in: targets.ids } });
    filters.push({ employeeId: { $in: targets.ids } });
  }

  if (targets.emails.length) {
    filters.push({ staffEmail: { $in: targets.emails } });
  }

  const query = filters.length ? { $or: filters } : { staffId: clean(staffId) };

  if (dateRange.dateKey) {
    query.dateKey = dateRange.dateKey;
  } else if (dateRange.startKey && dateRange.endKey) {
    query.dateKey = { $gte: dateRange.startKey, $lte: dateRange.endKey };
  }

  return query;
};

const buildLeaveQuery = async (staffId, startKey, endKey) => {
  const targets = await getStaffAttendanceTargets(staffId);
  const filters = [];

  if (targets.ids.length) {
    filters.push({ staffId: { $in: targets.ids } });
  }

  if (targets.emails.length) {
    filters.push({ staffEmail: { $in: targets.emails } });
  }

  const query = filters.length ? { $or: filters } : { staffId: clean(staffId) };
  query.status = "Approved";
  query.fromDate = { $lte: endKey };
  query.toDate = { $gte: startKey };
  return query;
};

const buildTaskQuery = async (staffId, dateKey) => {
  const targets = await getStaffAttendanceTargets(staffId);
  const filters = [];

  if (targets.ids.length) {
    filters.push({ staffId: { $in: targets.ids } });
    filters.push({ employeeId: { $in: targets.ids } });
  }

  if (targets.emails.length) {
    filters.push({ staffEmail: { $in: targets.emails } });
  }

  const query = filters.length ? { $or: filters } : { staffId: clean(staffId) };

  if (dateKey) {
    query.dueDate = dateKey;
  }

  return query;
};

const normalizeAttendanceStatus = (status) => {
  const value = clean(status);
  if (!value) return "Absent";
  if (value.toLowerCase() === "half day") return "Half Day";
  if (value.toLowerCase() === "late") return "Late";
  if (value.toLowerCase() === "leave") return "Leave";
  if (value.toLowerCase() === "present") return "Present";
  if (value.toLowerCase() === "absent") return "Absent";
  return ATTENDANCE_STATUSES.includes(value) ? value : "Absent";
};

const buildCalendar = ({ monthIndex, startDate, endDate, statusByDate, todayKey, selectedKey }) => {
  const firstVisibleDate = new Date(startDate);
  const startOffset = (firstVisibleDate.getDay() + 6) % 7;
  firstVisibleDate.setDate(firstVisibleDate.getDate() - startOffset);

  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(firstVisibleDate);
    cellDate.setDate(firstVisibleDate.getDate() + index);
    const cellDateKey = toDateKey(cellDate);
    cells.push({
      day: cellDate.getDate(),
      muted: cellDate.getMonth() !== monthIndex,
      current: cellDateKey === todayKey,
      selected: cellDateKey === selectedKey,
      status: statusByDate.get(cellDateKey) || undefined,
    });
  }

  return {
    monthLabel: startDate.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    }),
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    days: cells,
  };
};

const createRecordPayload = (attendance, fallbackShift) => {
  const date = parseDateKey(attendance.dateKey);
  return {
    id: attendance._id.toString(),
    dateKey: attendance.dateKey,
    date: date ? formatDateLabel(date) : attendance.dateKey,
    checkIn: attendance.checkIn || "--",
    checkOut: attendance.checkOut || "--",
    shift: attendance.shift || fallbackShift || "Morning",
    status: normalizeAttendanceStatus(attendance.status),
    workingHours: attendance.workingHours || "--",
  };
};

const createLeavePayload = (leave, fallbackShift) => {
  const date = parseDateKey(leave.fromDate);
  return {
    id: leave._id.toString(),
    dateKey: leave.fromDate,
    date: date ? formatDateLabel(date) : leave.fromDate,
    checkIn: "--",
    checkOut: "--",
    shift: fallbackShift || "Morning",
    status: "Leave",
    workingHours: "--",
  };
};

const createTaskPayload = (task) => ({
  id: task._id.toString(),
  staffId: task.staffId,
  employeeId: task.employeeId || "",
  staffEmail: task.staffEmail || "",
  staffName: task.staffName || "",
  duty: task.title || task.duty || "",
  area: task.area || task.description || "",
  dueDate: task.dueDate || task.time || "",
  time: task.time || task.dueDate || "",
  assignedBy: task.assignedBy || "",
  status: task.status || "Pending",
});

const buildDashboardResponse = async (staffId, monthValue) => {
  const staff = await resolveStaffContext({ staffId });
  const { monthKey, year, monthIndex, startDate, endDate, monthLabel } = getMonthRange(monthValue);
  const currentMonthKey = toDateKey(new Date()).slice(0, 7);
  const analyticsEndDate = monthKey === currentMonthKey ? new Date() : endDate;
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(analyticsEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  const [attendanceDocs, leaveDocs] = await Promise.all([
    Attendance.find(await buildAttendanceQuery(staffId, { startKey, endKey })).sort({ dateKey: -1, createdAt: -1 }),
    Leave.find(await buildLeaveQuery(staffId, startKey, endKey)).sort({ fromDate: -1, createdAt: -1 }),
  ]);
  const todayTasks = await Task.find(await buildTaskQuery(staffId, todayKey)).sort({ dueDate: 1, time: 1, createdAt: -1 });

  const attendanceByDate = new Map();
  attendanceDocs.forEach((doc) => {
    attendanceByDate.set(doc.dateKey, doc);
  });

  const leaveByDate = new Map();
  leaveDocs.forEach((leave) => {
    const leaveStart = parseDateKey(leave.fromDate);
    const leaveEnd = parseDateKey(leave.toDate);
    if (!leaveStart || !leaveEnd) return;

    for (let cursor = new Date(leaveStart); cursor <= leaveEnd; cursor.setDate(cursor.getDate() + 1)) {
      const cursorKey = toDateKey(cursor);
      if (cursorKey < startKey || cursorKey > endKey) continue;
      if (!leaveByDate.has(cursorKey)) {
        leaveByDate.set(cursorKey, leave);
      }
    }
  });

  const statusByDate = new Map();
  const timeline = [];
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let leaveDays = 0;
  let lateDays = 0;

  for (let cursor = new Date(startDate); cursor <= analyticsEndDate; cursor.setDate(cursor.getDate() + 1)) {
    const currentKey = toDateKey(cursor);
    const attendance = attendanceByDate.get(currentKey);
    const leave = leaveByDate.get(currentKey);
    const hasPastDate = currentKey <= endKey;

    let status = null;
    let checkIn = "--";
    let checkOut = "--";
    let shift = staff.shift || "Morning";
    let workingHours = "--";

    if (leave) {
      status = "Leave";
      leaveDays += 1;
    } else if (attendance) {
      status = normalizeAttendanceStatus(attendance.status);
      checkIn = attendance.checkIn || "--";
      checkOut = attendance.checkOut || "--";
      shift = attendance.shift || shift;
      workingHours = attendance.workingHours || "--";

      if (status === "Late") {
        presentDays += 1;
        lateDays += 1;
      } else if (status === "Present") {
        presentDays += 1;
      } else if (status === "Half Day") {
        halfDays += 1;
      } else if (status === "Absent") {
        absentDays += 1;
      } else if (status === "Leave") {
        leaveDays += 1;
      }
    } else if (hasPastDate) {
      status = "Absent";
      absentDays += 1;
    }

    if (status) {
      statusByDate.set(currentKey, status);
    }

    if (status && (attendance || leave || status !== "Absent")) {
      timeline.push({
        dateKey: currentKey,
        date: formatDateLabel(cursor),
        checkIn,
        checkOut,
        shift,
        status,
        workingHours,
      });
    }
  }

  const workingDays = presentDays + absentDays + halfDays + leaveDays;
  const attendancePercent = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;
  const latestStatusEntry = [...timeline].sort((a, b) => b.dateKey.localeCompare(a.dateKey))[0];
  const recentRecordsMap = new Map();
  attendanceDocs.forEach((doc) => {
    recentRecordsMap.set(doc.dateKey, createRecordPayload(doc, staff.shift));
  });
  leaveDocs.forEach((leave) => {
    if (!recentRecordsMap.has(leave.fromDate)) {
      recentRecordsMap.set(leave.fromDate, createLeavePayload(leave, staff.shift));
    }
  });
  const recentRecords = [...recentRecordsMap.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  const todayAttendance = attendanceByDate.get(todayKey) || null;
  const todayLeave = leaveByDate.get(todayKey) || null;
  const todayTaskList = todayTasks.map((task) => createTaskPayload(task));
  const todayStatus = todayLeave && !todayAttendance
    ? "Leave"
    : todayAttendance
      ? normalizeAttendanceStatus(todayAttendance.status)
      : "Not Started";
  const canCheckIn = !todayLeave && (!todayAttendance || !todayAttendance.checkIn || todayAttendance.checkIn === "--");
  const canCheckOut = !todayLeave && Boolean(todayAttendance?.checkIn) && todayAttendance.checkOut === "--";
  const attendanceCompleted = Boolean(todayAttendance?.checkIn && todayAttendance?.checkOut && todayAttendance.checkOut !== "--");

  const selectedKey = latestStatusEntry?.dateKey || todayKey;
  const calendar = buildCalendar({
    monthIndex,
    startDate,
    endDate,
    statusByDate,
    todayKey,
    selectedKey,
  });

  return {
    success: true,
    month: monthKey,
    monthLabel,
    headerDate: formatLongDateLabel(today),
    staff: {
      id: staff.staffId,
      name: staff.staffName,
      email: staff.staffEmail,
      role: staff.role,
      shift: staff.shift,
      department: staff.department,
    },
    today: {
      dateKey: todayKey,
      dateLabel: formatLongDateLabel(today),
      status: todayStatus,
      shift: staff.shift,
      checkIn: todayAttendance?.checkIn || "--",
      checkOut: todayAttendance?.checkOut || "--",
      workingHours: todayAttendance?.workingHours || "--",
      duty: todayTaskList[0] || null,
      duties: todayTaskList.slice(0, 3),
      leaveReason: todayLeave?.reason || "",
      leaveType: todayLeave?.leaveType || "",
      isOnLeave: Boolean(todayLeave && !todayAttendance),
      canCheckIn,
      canCheckOut,
      completed: attendanceCompleted,
    },
    summary: {
      workingDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      lateDays,
      attendancePercent,
    },
    overview: [
      { label: "Working Days", value: String(workingDays) },
      { label: "Present", value: String(presentDays), tone: "success" },
      { label: "Absent", value: String(absentDays), tone: "danger" },
      { label: "Leave", value: String(leaveDays), tone: "info" },
      { label: "Half Days", value: String(halfDays), tone: "warning" },
      { label: "Attendance", value: `${attendancePercent}%`, tone: "accent" },
    ],
    records: recentRecords.slice(0, 8),
    timeline,
    calendar,
    quickActions: [
      {
        key: "mark-attendance",
        title: "Mark Attendance",
        description: "Check In / Check Out",
      },
      {
        key: "history",
        title: "Attendance History",
        description: "View full attendance report",
      },
      {
        key: "download",
        title: "Download Report",
        description: "Download monthly report",
      },
    ],
  };
};

const buildAdminAttendanceDashboard = async (monthValue) => {
  const { monthKey, monthIndex, startDate, endDate, monthLabel } = getMonthRange(monthValue);
  const currentMonthKey = toDateKey(new Date()).slice(0, 7);
  const analyticsEndDate = monthKey === currentMonthKey ? new Date() : endDate;
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(analyticsEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  const [employees, attendanceDocs, leaveDocs, dutyDocs] = await Promise.all([
    Employee.find({ role: { $ne: "admin" } }).sort({ name: 1 }),
    Attendance.find({ dateKey: { $gte: startKey, $lte: endKey } }).sort({ dateKey: -1, createdAt: -1 }),
    Leave.find({
      status: "Approved",
      fromDate: { $lte: endKey },
      toDate: { $gte: startKey },
    }).sort({ fromDate: -1, createdAt: -1 }),
    Task.find({ dueDate: todayKey }).sort({ createdAt: -1 }),
  ]);

  const employeeList = employees.map((employee) => ({
    id: employee._id.toString(),
    name: employee.name,
    email: employee.email,
    shift: employee.shift || "Morning",
    department: employee.department || "General",
    role: employee.role || "staff",
    status: employee.status || "Active",
  }));

  const employeeById = new Map();
  const employeeByEmail = new Map();
  employeeList.forEach((employee) => {
    employeeById.set(employee.id, employee);
    employeeByEmail.set(normalizeEmail(employee.email), employee);
  });

  const attendanceMap = new Map();
  attendanceDocs.forEach((attendance) => {
    const recordKey = `${attendance.staffId || attendance.employeeId || attendance.staffEmail || ""}:${attendance.dateKey}`;
    attendanceMap.set(recordKey, attendance);
  });

  const leaveMap = new Map();
  leaveDocs.forEach((leave) => {
    const fromDate = parseDateKey(leave.fromDate);
    const toDate = parseDateKey(leave.toDate);
    if (!fromDate || !toDate) return;

    for (let cursor = new Date(fromDate); cursor <= toDate; cursor.setDate(cursor.getDate() + 1)) {
      const cursorKey = toDateKey(cursor);
      const recordKey = `${leave.staffId}:${cursorKey}`;
      if (!leaveMap.has(recordKey)) {
        leaveMap.set(recordKey, leave);
      }
    }
  });

  const buildEmployeeLookup = (attendance) => {
    const byId = attendance.staffId ? employeeById.get(attendance.staffId) : null;
    const byEmail = attendance.staffEmail ? employeeByEmail.get(normalizeEmail(attendance.staffEmail)) : null;
    return byId || byEmail || null;
  };

  const timeline = [];
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let leaveDays = 0;
  let lateDays = 0;

  for (let cursor = new Date(startDate); cursor <= analyticsEndDate; cursor.setDate(cursor.getDate() + 1)) {
    const currentKey = toDateKey(cursor);
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;

    employeeList.forEach((employee) => {
      const attendance = attendanceMap.get(`${employee.id}:${currentKey}`);
      const leave = leaveMap.get(`${employee.id}:${currentKey}`);

      if (leave) {
        leaveCount += 1;
        leaveDays += 1;
        return;
      }

      if (attendance) {
        const status = normalizeAttendanceStatus(attendance.status);
        if (status === "Late") {
          presentCount += 1;
          presentDays += 1;
          lateCount += 1;
          lateDays += 1;
        } else if (status === "Present") {
          presentCount += 1;
          presentDays += 1;
        } else if (status === "Half Day") {
          halfDayCount += 1;
          halfDays += 1;
        } else if (status === "Absent") {
          absentCount += 1;
          absentDays += 1;
        } else if (status === "Leave") {
          leaveCount += 1;
          leaveDays += 1;
        }
        return;
      }

      if (currentKey <= endKey) {
        absentCount += 1;
        absentDays += 1;
      }
    });

    const activeEmployees = employeeList.length || 1;
    const attendancePercent = Math.round((presentCount / activeEmployees) * 100);
    timeline.push({
      dateKey: currentKey,
      date: formatDateLabel(cursor),
      present: presentCount,
      absent: absentCount,
      leave: leaveCount,
      late: lateCount,
      halfDays: halfDayCount,
      attendancePercent,
    });
  }

  const todayLeaveCount = employeeList.reduce((count, employee) => {
    return count + (leaveMap.get(`${employee.id}:${todayKey}`) ? 1 : 0);
  }, 0);
  const todayLateCount = employeeList.reduce((count, employee) => {
    const attendance = attendanceMap.get(`${employee.id}:${todayKey}`);
    const leave = leaveMap.get(`${employee.id}:${todayKey}`);
    if (leave || !attendance) return count;
    return normalizeAttendanceStatus(attendance.status) === "Late" ? count + 1 : count;
  }, 0);
  const todayPresentCount = employeeList.reduce((count, employee) => {
    const attendance = attendanceMap.get(`${employee.id}:${todayKey}`);
    const leave = leaveMap.get(`${employee.id}:${todayKey}`);
    if (leave || !attendance) return count;
    const status = normalizeAttendanceStatus(attendance.status);
    return status === "Present" || status === "Late" ? count + 1 : count;
  }, 0);
  const todayAbsentCount = employeeList.reduce((count, employee) => {
    const attendance = attendanceMap.get(`${employee.id}:${todayKey}`);
    const leave = leaveMap.get(`${employee.id}:${todayKey}`);
    if (leave) return count;
    if (!attendance) return count + 1;
    return normalizeAttendanceStatus(attendance.status) === "Absent" ? count + 1 : count;
  }, 0);
  const expectedEntries = employeeList.length * timeline.length;
  const attendancePercent = expectedEntries > 0 ? Math.round((presentDays / expectedEntries) * 100) : 0;

  const records = [
    ...attendanceDocs.map((attendance) => {
      const employee = buildEmployeeLookup(attendance);
      return {
        id: attendance._id.toString(),
        dateKey: attendance.dateKey,
        date: parseDateKey(attendance.dateKey) ? formatDateLabel(parseDateKey(attendance.dateKey)) : attendance.dateKey,
        employeeName: attendance.staffName || employee?.name || "Unknown",
        department: employee?.department || "General",
        shift: attendance.shift || employee?.shift || "Morning",
        checkIn: attendance.checkIn || "--",
        checkOut: attendance.checkOut || "--",
        workingHours: attendance.workingHours || "--",
        status: normalizeAttendanceStatus(attendance.status),
      };
    }),
    ...leaveDocs
      .filter((leave) => !attendanceDocs.some((attendance) => attendance.staffId === leave.staffId && attendance.dateKey >= leave.fromDate && attendance.dateKey <= leave.toDate))
      .map((leave) => ({
        id: leave._id.toString(),
        dateKey: leave.fromDate,
        date: parseDateKey(leave.fromDate) ? formatDateLabel(parseDateKey(leave.fromDate)) : leave.fromDate,
        employeeName: leave.staffName || "Unknown",
        department: "Leave",
        shift: "Morning",
        checkIn: "--",
        checkOut: "--",
        workingHours: "--",
        status: "Leave",
      })),
  ]
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, 20);

  const shiftSummary = employeeList.reduce((accumulator, employee) => {
    const label = employee.shift || "Morning";
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
  }, {});

  return {
    success: true,
    month: monthKey,
    monthLabel,
    headerDate: formatLongDateLabel(today),
    summary: {
      workingDays: timeline.length,
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      lateDays,
      attendancePercent,
      totalEmployees: employeeList.length,
      totalRecords: attendanceDocs.length,
    },
    overview: [
      { label: "Employees", value: String(employeeList.length), tone: "info" },
      { label: "Present", value: String(todayPresentCount), tone: "success" },
      { label: "Absent", value: String(todayAbsentCount), tone: "danger" },
      { label: "Leave", value: String(todayLeaveCount), tone: "warning" },
      { label: "Working Days", value: String(timeline.length) },
      { label: "Attendance", value: `${attendancePercent}%`, tone: "accent" },
    ],
    records,
    timeline,
    shiftSummary,
    todayDuty: dutyDocs.map((task) => createTaskPayload(task)),
    today: {
      dateKey: todayKey,
      dateLabel: formatLongDateLabel(today),
      presentCount: todayPresentCount,
      absentCount: todayAbsentCount,
      leaveCount: todayLeaveCount,
      lateCount: todayLateCount,
      dutyCount: dutyDocs.length,
      attendancePercent: employeeList.length > 0 ? Math.round((todayPresentCount / employeeList.length) * 100) : 0,
    },
  };
};

exports.getStaffAttendanceDashboard = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { month } = req.query;

    if (!clean(staffId)) {
      return res.status(400).json({
        success: false,
        message: "staffId is required",
      });
    }

    const payload = await buildDashboardResponse(staffId, month);

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStaffAttendanceRecords = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { month } = req.query;

    if (!clean(staffId)) {
      return res.status(400).json({
        success: false,
        message: "staffId is required",
      });
    }

    const payload = await buildDashboardResponse(staffId, month);

    return res.json({
      success: true,
      month: payload.month,
      monthLabel: payload.monthLabel,
      records: payload.records,
      summary: payload.summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStaffAttendanceSummary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { month } = req.query;

    if (!clean(staffId)) {
      return res.status(400).json({
        success: false,
        message: "staffId is required",
      });
    }

    const payload = await buildDashboardResponse(staffId, month);

    return res.json({
      success: true,
      month: payload.month,
      monthLabel: payload.monthLabel,
      summary: payload.summary,
      overview: payload.overview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAdminAttendanceDashboard = async (req, res) => {
  try {
    const { month } = req.query;
    const payload = await buildAdminAttendanceDashboard(month);

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { staffId, staffName, staffEmail, action } = req.body;
    const normalizedAction = clean(action).toLowerCase();

    if (!clean(staffId)) {
      return res.status(400).json({
        success: false,
        message: "staffId is required",
      });
    }

    if (!["check-in", "check-out"].includes(normalizedAction)) {
      return res.status(400).json({
        success: false,
        message: "action must be check-in or check-out",
      });
    }

    const staff = await resolveStaffContext({ staffId, staffName, staffEmail });
    const now = new Date();
    const dateKey = toDateKey(now);
    const todayLeave = await Leave.findOne(await buildLeaveQuery(staffId, dateKey, dateKey));

    if (todayLeave) {
      return res.status(409).json({
        success: false,
        message: "You are on approved leave today",
      });
    }

    const attendanceQuery = await buildAttendanceQuery(staffId, { dateKey });
    let attendance = await Attendance.findOne(attendanceQuery);

    if (normalizedAction === "check-in") {
      if (attendance?.checkIn && attendance.checkIn !== "--") {
        return res.status(409).json({
          success: false,
          message: "You have already checked in for today",
          attendance,
        });
      }

      const isLate =
        now.getHours() > CHECK_IN_LATE_TIME.hour ||
        (now.getHours() === CHECK_IN_LATE_TIME.hour && now.getMinutes() > CHECK_IN_LATE_TIME.minute);

      const payload = {
        staffId: staff.staffId,
        staffName: staff.staffName,
        employeeId: staff.employeeId || undefined,
        staffEmail: staff.staffEmail || undefined,
        dateKey,
        checkIn: formatTimeLabel(now),
        checkInAt: now,
        checkOut: "--",
        checkOutAt: null,
        shift: staff.shift || "Morning",
        status: isLate ? "Late" : "Present",
        workingMinutes: 0,
        workingHours: "--",
        source: "manual",
      };

      attendance = attendance
        ? await Attendance.findByIdAndUpdate(attendance._id, payload, { new: true, upsert: true })
        : await Attendance.create(payload);

      return res.status(201).json({
        success: true,
        message: "Attendance check-in saved",
        attendance,
      });
    }

    if (!attendance || !attendance.checkIn || attendance.checkIn === "--") {
      return res.status(400).json({
        success: false,
        message: "Check-in is required before check-out",
      });
    }

    if (attendance.checkOut && attendance.checkOut !== "--") {
      return res.status(409).json({
        success: false,
        message: "You have already checked out for today",
        attendance,
      });
    }

    const checkInAt = attendance.checkInAt ? new Date(attendance.checkInAt) : now;
    const workingMinutes = Math.max(0, Math.round((now.getTime() - checkInAt.getTime()) / 60000));

    attendance.checkOut = formatTimeLabel(now);
    attendance.checkOutAt = now;
    attendance.workingMinutes = workingMinutes;
    attendance.workingHours = formatWorkingHours(workingMinutes);

    if (attendance.status === "Absent") {
      attendance.status = "Present";
    }

    await attendance.save();

    return res.json({
      success: true,
      message: "Attendance check-out saved",
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
