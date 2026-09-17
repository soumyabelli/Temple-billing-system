const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Employee = require("../models/Employee");

const buildRoleNotificationQuery = async (role, userId, emailQuery) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const filters = [];

  // Role matching for general broadcasts (unassigned announcements)
  if (normalizedRole) {
    const roles = [normalizedRole, "all"];
    if (["admin", "priest", "cashier", "accountant", "staff"].includes(normalizedRole)) {
      roles.push("staff", "employee");
    }
    filters.push({
      audienceRole: { $in: roles },
      audienceEmail: { $in: [null, "", undefined] },
      audienceId: { $in: [null, "", undefined] }
    });
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

const getNotificationAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notif = await Notification.findById(id).select("attachment title").lean();
    if (!notif || !notif.attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const att = notif.attachment;
    if (att.startsWith("data:")) {
      const matches = att.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(buffer);
      }
    }

    if (att.startsWith("http://") || att.startsWith("https://")) {
      return res.redirect(att);
    }

    return res.status(404).json({ message: "Unsupported attachment format" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { role, userId } = req.params;
    const email = req.query?.email;
    const query = await buildRoleNotificationQuery(role, userId, email);

    const notifications = await Notification.find(query)
      .select({
        title: 1,
        message: 1,
        audienceId: 1,
        audienceEmail: 1,
        audienceRole: 1,
        category: 1,
        date: 1,
        viewed: 1,
        viewedAt: 1,
        read: 1,
        readAt: 1,
        createdAt: 1,
        updatedAt: 1,
        attachmentType: {
          $cond: [
            { $and: [{ $ne: ["$attachment", null] }, { $ne: ["$attachment", ""] }] },
            {
              $cond: [
                { $regexMatch: { input: { $ifNull: ["$attachment", ""] }, regex: "pdf" } },
                "pdf",
                "image"
              ]
            },
            null
          ]
        }
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formatted = notifications.map((n) => ({
      ...n,
      id: n._id,
      attachment: n.attachmentType
        ? n.attachmentType === "pdf"
          ? `http://localhost:5000/api/notifications/attachment/${n._id}?file=document.pdf`
          : `http://localhost:5000/api/notifications/attachment/${n._id}`
        : null
    }));

    res.status(200).json(formatted);
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
  getNotificationAttachment,
  markNotificationRead,
  markAllNotificationsRead
};
