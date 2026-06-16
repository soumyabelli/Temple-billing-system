const Leave = require("../models/Leave");
const { createNotification, createStaffNotification } = require("../utils/notificationService");
const Notification = require("../models/Notification");
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

exports.applyLeave = async (req, res) => {
  try {
    const { staffId, staffName, reason, fromDate, toDate, leaveType } = req.body;

    if (!staffId || !staffName || !reason || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "staffId, staffName, reason, fromDate and toDate are required",
      });
    }

    const leave = await Leave.create({
      staffId,
      staffName,
      reason,
      leaveType: leaveType || "General",
      fromDate,
      toDate,
      status: "Pending",
      adminReason: "",
      reviewedBy: "",
      reviewedAt: null,
    });

    await Notification.create({
      title: "Leave Request",
      message: `${leave.staffName} submitted a leave request`,
      audienceRole: "admin",
      category: "leave"
    });

    return res.json({
      success: true,
      leave,
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

    return res.json(summary);
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
