const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Employee = require("../models/Employee");

const buildRoleNotificationQuery = async (role, userId, emailQuery) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const filters = [];

  // Role matching
  if (normalizedRole) {
    const roles = [normalizedRole, "all"];
    if (["admin", "priest", "cashier", "accountant", "staff"].includes(normalizedRole)) {
      roles.push("staff", "employee");
    }
    filters.push({ audienceRole: { $in: roles } });
  }

  const targetIds = new Set();
  const targetEmails = new Set();

  if (
    userId &&
    userId !== "null" &&
    userId !== "undefined" &&
    userId !== "admin" &&
    userId !== "cashier" &&
    userId !== "accountant" &&
    userId !== "priest"
  ) {
    targetIds.add(userId);

    if (mongoose.isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId).select("email role").lean();
        if (user?.email) targetEmails.add(user.email.toLowerCase().trim());

        const employee = await Employee.findById(userId).select("email role").lean();
        if (employee?.email) targetEmails.add(employee.email.toLowerCase().trim());
      } catch (_) {}
    }
  }

  if (emailQuery && typeof emailQuery === "string") {
    targetEmails.add(emailQuery.toLowerCase().trim());
  }

  for (const email of targetEmails) {
    try {
      const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const u = await User.findOne({ email: new RegExp(`^${escaped}$`, "i") }).select("_id").lean();
      if (u?._id) targetIds.add(u._id.toString());
      const e = await Employee.findOne({ email: new RegExp(`^${escaped}$`, "i") }).select("_id").lean();
      if (e?._id) targetIds.add(e._id.toString());
    } catch (_) {}
  }

  if (targetIds.size > 0) {
    filters.push({ audienceId: { $in: Array.from(targetIds) } });
  }
  if (targetEmails.size > 0) {
    filters.push({ audienceEmail: { $in: Array.from(targetEmails) } });
  }

  return filters.length > 0 ? { $or: filters } : {};
};

const getNotifications = async (req, res) => {
  try {
    const { role, userId } = req.params;
    const email = req.query?.email;
    const query = await buildRoleNotificationQuery(role, userId, email);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .allowDiskUse(true)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
        viewed: true,
        readAt: new Date(),
        viewedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const { role, userId } = req.params;
    const email = req.query?.email || req.body?.email;
    const query = await buildRoleNotificationQuery(role, userId, email);

    const result = await Notification.updateMany(
      { ...query, read: false },
      {
        $set: {
          read: true,
          viewed: true,
          readAt: new Date(),
          viewedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
