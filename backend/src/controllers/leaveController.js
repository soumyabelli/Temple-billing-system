const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");
const { createNotification, createStaffNotification } = require("../utils/notificationService");
const mongoose = require("mongoose");
const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"];

const parseISODate = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isEmployeeOnLeaveToday = (leave, today) => {
  if (leave.status !== "Approved") {
    return false;
  }

  const from = parseISODate(leave.fromDate);
  const to = parseISODate(leave.toDate);
  if (!from || !to) {
    return false;
  }

  return today >= from && today <= to;
};

const buildLeaveSummary = (leaves) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summary = {
    total: leaves.length,
    approved: 0,
    rejected: 0,
    pending: 0,
    employeesOnLeave: 0,
  };

  const onLeaveEmployeeIds = new Set();

  leaves.forEach((leave) => {
    if (leave.status === "Approved") {
      summary.approved += 1;
      if (isEmployeeOnLeaveToday(leave, today)) {
        onLeaveEmployeeIds.add(leave.staffId);
      }
      return;
    }
    if (leave.status === "Rejected") {
      summary.rejected += 1;
      return;
    }
    summary.pending += 1;
  });

  summary.employeesOnLeave = onLeaveEmployeeIds.size;
  return summary;
};

// Returns today's date as "YYYY-MM-DD" using the server's LOCAL timezone
// (never use toISOString() here — that would give UTC which may be yesterday in IST)
const getLocalTodayStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getEmployeeYearlyQuota = async (staffId) => {
  let employee = null;
  if (mongoose.Types.ObjectId.isValid(staffId)) {
    employee = await Employee.findById(staffId);
  }
  if (!employee) {
    employee = await Employee.findOne({ employeeId: staffId });
  }

  let casualQuota = 12;
  const emergencyQuota = 2;
  
  if (employee && employee.joiningDate) {
    const currentYear = new Date().getFullYear();
    const joinDate = new Date(employee.joiningDate);
    if (joinDate.getFullYear() === currentYear) {
      casualQuota = 12 - joinDate.getMonth();
    }
  }

  return {
    casualQuota,
    emergencyQuota,
    totalQuota: casualQuota + emergencyQuota,
  };
};

const getLeaveDaysCount = (fromDateStr, toDateStr, year, weeklyOff = null) => {
  const startOfYear = new Date(`${year}-01-01T00:00:00`);
  const endOfYear = new Date(`${year}-12-31T00:00:00`);
  const from = new Date(`${fromDateStr}T00:00:00`);
  const to = new Date(`${toDateStr}T00:00:00`);
  
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  
  const start = from < startOfYear ? startOfYear : from;
  const end = to > endOfYear ? endOfYear : to;
  
  if (start <= end) {
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (weeklyOff !== dayName) {
        count++;
      }
    }
    return count;
  }
  return 0;
};

exports.applyLeave = async (req, res) => {
  try {
    const {
      staffId,
      staffName,
      staffEmail,
      role = "staff",
      reason,
      fromDate,
      toDate,
      leaveType,
      transferDuty,
      substituteId,
    } = req.body;

    const normalizedRole = String(role || "staff").trim().toLowerCase();

    // ── Required field presence ──────────────────────────────────────────────
    const missing = [];
    if (!staffId)   missing.push("staffId");
    if (!staffName) missing.push("staffName");
    if (!leaveType || !String(leaveType).trim()) missing.push("leaveType");
    if (!fromDate)  missing.push("fromDate");
    if (!toDate)    missing.push("toDate");

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // ── Duty Transfer Mandatory Check ──────────────────────────────────────
    const isTransferMandatory = ["priest", "accountant", "cashier"].includes(normalizedRole);
    if (isTransferMandatory && (!substituteId || String(substituteId).trim() === "")) {
      return res.status(400).json({
        success: false,
        message: `Duty transfer is mandatory for ${role}. Please select an available substitute to take over your duties.`,
      });
    }

    // ── Resolve Substitute if Provided ──────────────────────────────────────
    let resolvedSubstitute = null;
    if (substituteId && String(substituteId).trim() !== "") {
      const User = require("../models/User");
      const Employee = require("../models/Employee");

      let subUser = null;
      let subEmp = null;
      if (mongoose.Types.ObjectId.isValid(substituteId)) {
        subUser = await User.findById(substituteId).select("name email role").lean();
        subEmp = await Employee.findById(substituteId).select("name email role employeeId").lean();
      }
      if (!subUser && !subEmp) {
        subEmp = await Employee.findOne({ employeeId: substituteId }).select("name email role employeeId").lean();
        if (subEmp?.email) {
          subUser = await User.findOne({ email: subEmp.email }).select("name email role").lean();
        }
      }

      const subName = subEmp?.name || subUser?.name || "Colleague";
      const subEmail = (subEmp?.email || subUser?.email || "").toLowerCase().trim();
      const subRole = subEmp?.role || subUser?.role || normalizedRole;

      resolvedSubstitute = {
        id: String(substituteId).trim(),
        name: subName,
        email: subEmail,
        role: subRole,
      };
    }

    // ── Reason validation ────────────────────────────────────────────────────
    const trimmedReason = String(reason || "").trim();
    if (!trimmedReason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required and cannot be empty or whitespace.",
      });
    }
    if (trimmedReason.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Reason must be at least 10 characters long.",
      });
    }

    // ── Date format validation ───────────────────────────────────────────────
    const fromParsed = parseISODate(fromDate);
    const toParsed   = parseISODate(toDate);

    if (!fromParsed) {
      return res.status(400).json({
        success: false,
        message: "From Date is not a valid date (expected YYYY-MM-DD).",
      });
    }
    if (!toParsed) {
      return res.status(400).json({
        success: false,
        message: "To Date is not a valid date (expected YYYY-MM-DD).",
      });
    }

    // ── Date range validation (local timezone) ───────────────────────────────
    const todayStr   = getLocalTodayStr();
    const todayStart = parseISODate(todayStr); // midnight today in server local time
    const now = new Date();

    if (fromParsed < todayStart) {
      return res.status(400).json({
        success: false,
        message: `From Date (${fromDate}) cannot be before today (${todayStr}).`,
      });
    }

    // ── Same day 10:00 AM cutoff check ──────────────────────────────────────
    if (fromDate === todayStr && now.getHours() >= 10) {
      return res.status(400).json({
        success: false,
        message: "Same-day leave application is not allowed after 10:00 AM. Please select a future date.",
      });
    }

    if (toParsed < fromParsed) {
      return res.status(400).json({
        success: false,
        message: `To Date (${toDate}) cannot be before From Date (${fromDate}).`,
      });
    }

    // ── Overlapping / Duplicate Leave Check ─────────────────────────────────
    const overlappingLeave = await Leave.findOne({
      staffId,
      status: { $ne: "Rejected" },
      fromDate: { $lte: toDate },
      toDate: { $gte: fromDate },
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: `You already have an active or pending leave request covering ${overlappingLeave.fromDate} to ${overlappingLeave.toDate}.`,
      });
    }

    // ── Quota Check ──────────────────────────────────────────────────────────
    const currentYear = new Date().getFullYear();
    let employee = null;
    if (mongoose.Types.ObjectId.isValid(staffId)) {
      employee = await Employee.findById(staffId);
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: staffId });
    }
    const weeklyOff = employee?.weeklyOff || null;
    const { totalQuota } = await getEmployeeYearlyQuota(staffId);
    
    const existingLeaves = await Leave.find({
      staffId,
      status: { $ne: "Rejected" },
      fromDate: { $lte: `${currentYear}-12-31` },
      toDate: { $gte: `${currentYear}-01-01` }
    });
    
    let usedDays = 0;
    existingLeaves.forEach(l => {
      usedDays += getLeaveDaysCount(l.fromDate, l.toDate, currentYear, weeklyOff);
    });
    
    const requestedDays = getLeaveDaysCount(fromDate, toDate, currentYear, weeklyOff);
    const quotaExceeded = (usedDays + requestedDays) > totalQuota;

    // ── Save ─────────────────────────────────────────────────────────────────
    const leave = await Leave.create({
      staffId,
      staffName,
      staffEmail: staffEmail || employee?.email || "",
      role: normalizedRole,
      reason: trimmedReason,
      leaveType: String(leaveType).trim() || "General",
      fromDate,
      toDate,
      status: "Pending",
      adminReason: "",
      reviewedBy: "",
      reviewedAt: null,
      transferDuty: Boolean(resolvedSubstitute),
      substituteId: resolvedSubstitute?.id || null,
      substituteName: resolvedSubstitute?.name || "",
      substituteRole: resolvedSubstitute?.role || "",
      substituteEmail: resolvedSubstitute?.email || "",
      transferStatus: resolvedSubstitute ? "Pending" : "None",
      transferRejectReason: "",
      transferResolvedAt: null,
    });

    // Notify Admin of Leave Request
    await Notification.create({
      title: resolvedSubstitute ? "Leave & Duty Transfer Request" : "Leave Request",
      message: resolvedSubstitute
        ? `${leave.staffName} (${normalizedRole}) applied for leave (${fromDate} to ${toDate}) with duty transfer to ${resolvedSubstitute.name}.`
        : `${leave.staffName} (${normalizedRole}) submitted a leave request (${fromDate} to ${toDate}).`,
      audienceRole: "admin",
      category: "leave",
    });

    // If substitute assigned, send notification to that specific substitute employee
    if (resolvedSubstitute) {
      await Notification.create({
        title: "Duty Transfer Request",
        message: `${leave.staffName} (${normalizedRole}) has requested you to take over duty from ${fromDate} to ${toDate} due to leave. Please review and accept or reject.`,
        audienceId: resolvedSubstitute.id,
        audienceEmail: resolvedSubstitute.email || undefined,
        category: "task",
      });
    }

    return res.json({
      success: true,
      leave,
      quotaExceeded,
      message: quotaExceeded 
        ? `Warning: You have exceeded your leave limit of ${totalQuota} days for the year. Salary will be deducted for extra leaves.` 
        : resolvedSubstitute
        ? "Leave and duty transfer request submitted successfully."
        : "Leave applied successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getLeaves = async (req, res) => {
  try {
    const { staffId } = req.params;
    const leaves = await Leave.find({ staffId }).sort({ createdAt: -1 });

    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLeaveStats = async (req, res) => {
  try {
    const { staffId } = req.params;
    const leaves = await Leave.find({ staffId });
    const summary = buildLeaveSummary(leaves);

    const currentYear = new Date().getFullYear();
    const quotaInfo = await getEmployeeYearlyQuota(staffId);
    
    let usedDays = 0;
    leaves.filter(l => l.status !== "Rejected").forEach(l => {
      usedDays += getLeaveDaysCount(l.fromDate, l.toDate, currentYear);
    });

    return res.json({
      ...summary,
      ...quotaInfo,
      usedDays,
      remainingDays: Math.max(0, quotaInfo.totalQuota - usedDays)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAdminLeaveOverview = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    const summary = buildLeaveSummary(leaves);

    return res.json({
      success: true,
      summary,
      leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReason, reviewedBy } = req.body;

    if (!LEAVE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave status",
      });
    }

    if (status === "Rejected" && !String(adminReason || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when rejecting leave",
      });
    }

    const updatePayload = {
      status,
      adminReason: String(adminReason || "").trim(),
      reviewedBy: String(reviewedBy || "").trim(),
      reviewedAt: status === "Pending" ? null : new Date(),
    };

    if (status === "Pending") {
      updatePayload.adminReason = "";
      updatePayload.reviewedBy = "";
    }

    const updatedLeave = await Leave.findByIdAndUpdate(id, updatePayload, { new: true });

    if (!updatedLeave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (status === "Approved") {
      await createNotification({
        title: "Leave Approved",
        message: `${updatedLeave.staffName} has approved leave from ${updatedLeave.fromDate} to ${updatedLeave.toDate}.`,
        audienceRole: "admin",
        category: "leave",
      });

      await createStaffNotification({
        title: "Leave Approved",
        message: "Your leave request has been approved.",
        audienceId: updatedLeave.staffId,
        category: "leave",
      });
    }

    if (status === "Rejected") {
      await createStaffNotification({
        title: "Leave Rejected",
        message: `Your leave request has been rejected. Reason: ${updatePayload.adminReason}`,
        audienceId: updatedLeave.staffId,
        category: "leave",
      });
    }

    return res.json({
      success: true,
      leave: updatedLeave,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAvailableSubstitutes = async (req, res) => {
  try {
    const { role = "staff", fromDate, toDate, excludeId, excludeEmail } = req.query;
    const normalizedRole = String(role).trim().toLowerCase();

    const User = require("../models/User");
    const Employee = require("../models/Employee");

    const [employees, users] = await Promise.all([
      Employee.find({
        role: new RegExp(`^${normalizedRole}$`, "i"),
        status: { $ne: "Inactive" },
        deletedAt: null,
      }).select("_id employeeId name email role status").lean(),
      User.find({
        role: new RegExp(`^${normalizedRole}$`, "i"),
        status: "Active",
        accountEnabled: { $ne: false },
      }).select("_id name email role status").lean(),
    ]);

    const candidateMap = new Map();

    const addCandidate = (item) => {
      const email = String(item.email || "").toLowerCase().trim();
      const id = item._id.toString();
      const employeeId = item.employeeId || id;
      const key = email || id;

      if (!candidateMap.has(key)) {
        candidateMap.set(key, {
          id: id,
          employeeId: employeeId,
          name: item.name,
          email: email,
          role: normalizedRole,
          available: true,
          reason: "Available",
        });
      }
    };

    employees.forEach((emp) => addCandidate(emp));
    users.forEach((usr) => addCandidate(usr));

    const excludeEmailNorm = String(excludeEmail || "").toLowerCase().trim();
    const excludeIdStr = String(excludeId || "").trim();

    let candidates = Array.from(candidateMap.values()).filter((c) => {
      if (excludeEmailNorm && c.email && c.email === excludeEmailNorm) return false;
      if (excludeIdStr && (c.id === excludeIdStr || c.employeeId === excludeIdStr)) return false;
      return true;
    });

    if (fromDate && toDate) {
      const overlappingLeaves = await Leave.find({
        status: "Approved",
        fromDate: { $lte: toDate },
        toDate: { $gte: fromDate },
      }).select("staffId staffEmail").lean();

      const onLeaveStaffIds = new Set(overlappingLeaves.map((l) => l.staffId).filter(Boolean));
      const onLeaveEmails = new Set(overlappingLeaves.map((l) => (l.staffEmail || "").toLowerCase().trim()).filter(Boolean));

      candidates = candidates.map((c) => {
        const isOnLeave =
          onLeaveStaffIds.has(c.id) ||
          onLeaveStaffIds.has(c.employeeId) ||
          (c.email && onLeaveEmails.has(c.email));
        return {
          ...c,
          available: !isOnLeave,
          reason: isOnLeave ? "On approved leave during these dates" : "Available",
        };
      });
    }

    return res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching available substitutes:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIncomingTransfers = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const email = String(req.query.email || "").toLowerCase().trim();

    const filters = [];
    if (employeeId && employeeId !== "null" && employeeId !== "undefined") {
      filters.push({ substituteId: employeeId });
    }
    if (email) {
      filters.push({ substituteEmail: email });
    }

    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      const Employee = require("../models/Employee");
      const emp = await Employee.findById(employeeId).lean();
      if (emp?.email) {
        filters.push({ substituteEmail: emp.email.toLowerCase().trim() });
      }
      if (emp?.employeeId) {
        filters.push({ substituteId: emp.employeeId });
      }
    }

    if (filters.length === 0) {
      return res.status(200).json([]);
    }

    const transfers = await Leave.find({
      transferDuty: true,
      $or: filters,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(transfers);
  } catch (error) {
    console.error("Error fetching incoming transfers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToDutyTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason = "" } = req.body;

    if (!["Accepted", "Rejected"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be Accepted or Rejected" });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    if (!leave.transferDuty) {
      return res.status(400).json({ success: false, message: "This leave does not have a duty transfer request" });
    }

    leave.transferStatus = action;
    leave.transferRejectReason = action === "Rejected" ? String(reason || "").trim() : "";
    leave.transferResolvedAt = new Date();
    await leave.save();

    if (action === "Accepted" && String(leave.role).toLowerCase() === "priest" && leave.substituteId) {
      try {
        const Booking = require("../models/Booking");
        const Task = require("../models/Task");

        const from = new Date(`${leave.fromDate}T00:00:00`);
        const to = new Date(`${leave.toDate}T23:59:59`);

        await Booking.updateMany(
          {
            assignedPriest: leave.staffId,
            datetime: { $gte: from, $lte: to },
            status: { $in: ["Booked", "Confirmed", "Assigned", "Upcoming"] },
          },
          {
            $set: {
              assignedPriest: leave.substituteId,
              priestName: leave.substituteName || "Substitute Priest",
            },
          }
        );

        await Task.updateMany(
          {
            staffId: leave.staffId,
            status: { $in: ["Pending", "Assigned", "Accepted"] },
          },
          {
            $set: {
              staffId: leave.substituteId,
              staffName: leave.substituteName || "Substitute Priest",
              staffEmail: leave.substituteEmail || "",
            },
          }
        );
      } catch (subErr) {
        console.warn("Could not auto-reassign priest bookings/tasks:", subErr.message);
      }
    }

    await Notification.create({
      title: `Duty Transfer ${action}`,
      message: `${leave.substituteName || "Your colleague"} has ${action.toLowerCase()} your duty transfer request for leave (${leave.fromDate} to ${leave.toDate}).${action === "Rejected" && reason ? ` Reason: ${reason}` : ""}`,
      audienceId: leave.staffId,
      audienceEmail: leave.staffEmail || undefined,
      category: "task",
    });

    return res.status(200).json({
      success: true,
      message: `Duty transfer request ${action.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    console.error("Error responding to duty transfer:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
