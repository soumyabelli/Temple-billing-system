const Employee = require("../models/Employee");
const User = require("../models/User");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const Task = require("../models/Task");
const Shift = require("../models/Shift");
const ShiftAssignment = require("../models/ShiftAssignment");
const { createStaffNotification } = require("../utils/notificationService");

const clean = (value) => String(value || "").trim();

const parseDateKey = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const parseTimeToMinutes = (time) => {
  const value = clean(time).toUpperCase();
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 0;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const normalizeRange = (startTime, endTime) => {
  const start = parseTimeToMinutes(startTime);
  let end = parseTimeToMinutes(endTime);
  if (end <= start) end += 24 * 60;
  return { start, end, durationMinutes: Math.max(0, end - start) };
};

const rangesOverlap = (rangeA, rangeB) => Math.max(rangeA.start, rangeB.start) < Math.min(rangeA.end, rangeB.end);

const findEmployeeTargets = async (employeeId) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) return { employee: null, user: null, ids: [], emails: [] };

  const ids = new Set([employee._id.toString()]);
  const emails = new Set([clean(employee.email).toLowerCase()].filter(Boolean));
  const user = employee.email ? await User.findOne({ email: employee.email }) : null;

  if (user?._id) ids.add(user._id.toString());
  if (user?.email) emails.add(clean(user.email).toLowerCase());

  return {
    employee,
    user,
    ids: [...ids],
    emails: [...emails],
  };
};

const getLeaveBlock = async (employeeTargets, dateKey) => {
  const query = {
    status: "Approved",
    fromDate: { $lte: dateKey },
    toDate: { $gte: dateKey },
    $or: [],
  };

  if (employeeTargets.ids.length) query.$or.push({ staffId: { $in: employeeTargets.ids } });
  if (employeeTargets.emails.length) query.$or.push({ staffEmail: { $in: employeeTargets.emails } });

  if (!query.$or.length) return null;
  return Leave.findOne(query);
};

const getAttendanceForAssignment = async (employeeTargets, dateKey) => {
  const query = { dateKey, $or: [] };
  if (employeeTargets.ids.length) {
    query.$or.push({ staffId: { $in: employeeTargets.ids } });
    query.$or.push({ employeeId: { $in: employeeTargets.ids } });
  }
  if (employeeTargets.emails.length) query.$or.push({ staffEmail: { $in: employeeTargets.emails } });
  if (!query.$or.length) return null;
  return Attendance.findOne(query);
};

const buildPlannerWeek = (weekStartValue) => {
  const provided = weekStartValue ? parseDateKey(weekStartValue) : null;
  const today = provided || new Date();
  const dayIndex = today.getDay();
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const serializeShift = (shift) => ({
  id: shift._id.toString(),
  shiftName: shift.shiftName,
  startTime: shift.startTime,
  endTime: shift.endTime,
  category: shift.category,
  requiredStaff: shift.requiredStaff,
  active: shift.active,
  notes: shift.notes || "",
  createdAt: shift.createdAt,
  updatedAt: shift.updatedAt,
});

const serializeAssignment = (assignment, attendance = null, leave = null) => ({
  id: assignment._id.toString(),
  shiftId: assignment.shiftId,
  shiftName: assignment.shiftName,
  employeeId: assignment.employeeId,
  staffId: assignment.staffId,
  employeeName: assignment.employeeName,
  employeeEmail: assignment.employeeEmail,
  dateKey: assignment.dateKey,
  date: assignment.dateKey,
  startTime: assignment.startTime,
  endTime: assignment.endTime,
  category: assignment.category,
  requiredStaff: assignment.requiredStaff,
  attendanceStatus: attendance
    ? attendance.checkIn && attendance.checkIn !== "--"
      ? attendance.checkOut && attendance.checkOut !== "--"
        ? "Checked Out"
        : "Checked In"
      : attendance.status || "Absent"
    : leave
      ? "Employee unavailable"
      : assignment.attendanceStatus || "Pending",
  conflict: assignment.conflict,
  notes: assignment.notes,
  assignedBy: assignment.assignedBy,
  durationMinutes: assignment.durationMinutes,
  createdAt: assignment.createdAt,
});

const buildAlerts = (shifts, assignments, leaveMap) => {
  const alerts = [];

  const byEmployeeDate = new Map();
  assignments.forEach((assignment) => {
    const key = `${assignment.employeeId}:${assignment.dateKey}`;
    const list = byEmployeeDate.get(key) || [];
    list.push(assignment);
    byEmployeeDate.set(key, list);
  });

  assignments.forEach((assignment) => {
    const sameDay = byEmployeeDate.get(`${assignment.employeeId}:${assignment.dateKey}`) || [];
    if (sameDay.length > 1) {
      const overlaps = sameDay.some((other) => {
        if (other._id.toString() === assignment._id.toString()) return false;
        return rangesOverlap(
          normalizeRange(assignment.startTime, assignment.endTime),
          normalizeRange(other.startTime, other.endTime)
        );
      });
      if (overlaps) {
        alerts.push({
          tone: "danger",
          title: "Shift Conflict Detected",
          message: `${assignment.employeeName} is assigned more than once on ${assignment.dateKey}.`,
        });
      }
    }

    if (leaveMap.has(`${assignment.employeeId}:${assignment.dateKey}`)) {
      const leave = leaveMap.get(`${assignment.employeeId}:${assignment.dateKey}`);
      alerts.push({
        tone: "warning",
        title: "Employee unavailable",
        message: `${assignment.employeeName} has approved leave on ${assignment.dateKey}.`,
      });
    }
  });

  shifts.forEach((shift) => {
    const count = assignments.filter((assignment) => assignment.shiftId === shift._id.toString()).length;
    if (count < Number(shift.requiredStaff || 1)) {
      alerts.push({
        tone: "warning",
        title: "Understaffed",
        message: `${shift.shiftName} requires ${shift.requiredStaff} staff. Only ${count} assigned.`,
      });
    }
  });

  return alerts.slice(0, 6);
};

exports.getShiftDashboard = async (req, res) => {
  try {
    const weekStart = buildPlannerWeek(req.query.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const [shifts, assignments, employees] = await Promise.all([
      Shift.find().sort({ createdAt: -1 }),
      ShiftAssignment.find({ dateKey: { $gte: toDateKey(weekStart), $lte: toDateKey(weekEnd) } }).sort({ dateKey: 1, startTime: 1 }),
      Employee.find().sort({ name: 1 }),
    ]);

    const leaveMap = new Map();
    const assignmentSerials = [];

    for (const assignment of assignments) {
      const employeeTargets = await findEmployeeTargets(assignment.employeeId);
      const attendance = await getAttendanceForAssignment(employeeTargets, assignment.dateKey);
      const leave = await getLeaveBlock(employeeTargets, assignment.dateKey);
      if (leave) {
        leaveMap.set(`${assignment.employeeId}:${assignment.dateKey}`, leave);
      }
      assignmentSerials.push(serializeAssignment(assignment, attendance, leave));
    }

    const planner = [...Array(7)].map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateKey = toDateKey(date);
      const dayAssignments = assignmentSerials.filter((assignment) => assignment.dateKey === dateKey);
      return {
        dateKey,
        label: formatLabel(date),
        items: dayAssignments,
      };
    });

    const todayKey = toDateKey(new Date());
    const upcomingAssignments = assignmentSerials.filter((assignment) => assignment.dateKey >= todayKey).slice(0, 10);
    const completedShifts = assignmentSerials.filter((assignment) => assignment.attendanceStatus === "Checked Out").length;
    const missedShifts = assignmentSerials.filter((assignment) => assignment.dateKey < todayKey && assignment.attendanceStatus === "Absent").length;
    const overtimeHours = assignmentSerials.reduce((total, assignment) => {
      const scheduled = assignment.durationMinutes || 0;
      const attendanceMinutes = assignment.attendanceStatus === "Checked Out" ? scheduled + 30 : 0;
      return total + Math.max(0, attendanceMinutes - scheduled) / 60;
    }, 0);

    return res.json({
      success: true,
      shifts: shifts.map(serializeShift),
      assignments: assignmentSerials,
      planner,
      upcomingAssignments,
      alerts: buildAlerts(shifts, assignments, leaveMap),
      stats: {
        totalShifts: shifts.length,
        completedShifts,
        missedShifts,
        overtimeHours: Number(overtimeHours.toFixed(1)),
        manpowerAvailable: employees.filter((employee) => employee.status === "Active").length,
      },
      weekStart: toDateKey(weekStart),
      weekEnd: toDateKey(weekEnd),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ createdAt: -1 });
    return res.json({ success: true, shifts: shifts.map(serializeShift) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createShift = async (req, res) => {
  try {
    const shiftName = clean(req.body.shiftName);
    const startTime = clean(req.body.startTime);
    const endTime = clean(req.body.endTime);
    const requiredStaff = Number(req.body.requiredStaff) || 1;

    if (!shiftName || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "shiftName, startTime and endTime are required" });
    }

    const shift = await Shift.create({
      shiftName,
      startTime,
      endTime,
      category: clean(req.body.category) || "General",
      requiredStaff,
      active: req.body.active !== false,
      notes: clean(req.body.notes),
    });

    return res.status(201).json({ success: true, shift: serializeShift(shift) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    ["shiftName", "startTime", "endTime", "category", "notes"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        shift[field] = clean(req.body[field]);
      }
    });

    if (Object.prototype.hasOwnProperty.call(req.body, "requiredStaff")) {
      shift.requiredStaff = Number(req.body.requiredStaff) || 1;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "active")) {
      shift.active = Boolean(req.body.active);
    }

    await shift.save();
    return res.json({ success: true, shift: serializeShift(shift) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    await ShiftAssignment.deleteMany({ shiftId: shift._id.toString() });
    return res.json({ success: true, message: "Shift deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.body.shiftId);
    const employeeTargets = await findEmployeeTargets(req.body.employeeId);
    const dateKey = clean(req.body.date);

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }
    if (!employeeTargets.employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    if (!dateKey) {
      return res.status(400).json({ success: false, message: "date is required" });
    }

    const leave = await getLeaveBlock(employeeTargets, dateKey);
    if (leave) {
      return res.status(409).json({ success: false, message: "Employee unavailable" });
    }

    const { start, end, durationMinutes } = normalizeRange(shift.startTime, shift.endTime);
    const conflictingAssignments = await ShiftAssignment.find({
      employeeId: employeeTargets.employee._id.toString(),
      dateKey,
    });

    const hasConflict = conflictingAssignments.some((assignment) =>
      rangesOverlap(normalizeRange(assignment.startTime, assignment.endTime), { start, end })
    );

    if (hasConflict) {
      return res.status(409).json({ success: false, message: "Shift conflict detected" });
    }

    const assignment = await ShiftAssignment.create({
      shiftId: shift._id.toString(),
      shiftName: shift.shiftName,
      employeeId: employeeTargets.employee._id.toString(),
      staffId: employeeTargets.user?._id?.toString() || employeeTargets.employee._id.toString(),
      employeeName: employeeTargets.employee.name,
      employeeEmail: employeeTargets.employee.email,
      dateKey,
      startTime: shift.startTime,
      endTime: shift.endTime,
      category: shift.category,
      requiredStaff: shift.requiredStaff,
      attendanceStatus: "Pending",
      conflict: false,
      notes: clean(req.body.notes),
      assignedBy: clean(req.body.assignedBy) || "Admin",
      durationMinutes,
    });

    await Task.create({
      staffId: employeeTargets.user?._id?.toString() || employeeTargets.employee._id.toString(),
      staffName: employeeTargets.employee.name,
      employeeId: employeeTargets.employee._id.toString(),
      staffEmail: employeeTargets.employee.email,
      title: shift.shiftName,
      description: `${shift.startTime} - ${shift.endTime}${clean(req.body.notes) ? ` • ${clean(req.body.notes)}` : ""}`,
      dueDate: dateKey,
      duty: shift.shiftName,
      area: shift.category,
      time: shift.startTime,
      assignedBy: clean(req.body.assignedBy) || "Admin",
      status: "Pending",
    });

    await createStaffNotification({
      title: "New Duty Assigned",
      message: `${shift.shiftName} on ${dateKey} at ${shift.startTime}.`,
      audienceId: employeeTargets.user?._id?.toString() || employeeTargets.employee._id.toString(),
      audienceEmail: employeeTargets.employee.email,
      category: "task",
    });

    return res.status(201).json({ success: true, assignment: serializeAssignment(assignment) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await ShiftAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Delete matching staff tasks to keep staff dashboard synchronized
    await Task.deleteMany({
      employeeId: assignment.employeeId,
      dueDate: assignment.dateKey,
      duty: assignment.shiftName,
    });

    return res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

