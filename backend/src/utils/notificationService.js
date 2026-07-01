const Notification = require("../models/Notification");
const Employee = require("../models/Employee");
const User = require("../models/User");

const { isDbConnected } = require("../config/db");
const fileNotificationStore = require("../store/fileNotificationStore");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const createNotification = async ({
  title,
  message,
  audienceId,
  audienceEmail,
  audienceRole,
  category,
}) => {
  if (!title || !message) return null;

  const data = {
    title: String(title).trim(),
    message: String(message).trim(),
    audienceId: audienceId ? String(audienceId).trim() : undefined,
    audienceEmail: audienceEmail ? normalizeEmail(audienceEmail) : undefined,
    audienceRole: audienceRole ? String(audienceRole).trim().toLowerCase() : undefined,
    category: category ? String(category).trim() : undefined,
    read: false,
  };

  if (isDbConnected()) {
    return Notification.create(data);
  }

  return fileNotificationStore.createNotification(data);
};

const createStaffNotification = (payload) =>
  createNotification({
    ...payload,
    audienceRole: payload.audienceRole,
  });

const createStaffBroadcastNotifications = async ({ title, message, category }) => {
  if (!title || !message) return [];

  const [users, employees] = await Promise.all([
    User.find({ role: "staff" }).select("_id email name"),
    Employee.find({ role: "staff" }).select("_id email name"),
  ]);

  const recipients = new Map();

  users.forEach((user) => {
    const key = normalizeEmail(user.email) || user._id.toString();
    recipients.set(key, {
      audienceId: user._id.toString(),
      audienceEmail: normalizeEmail(user.email),
    });
  });

  employees.forEach((employee) => {
    const key = normalizeEmail(employee.email) || employee._id.toString();
    if (!recipients.has(key)) {
      recipients.set(key, {
        audienceId: employee._id.toString(),
        audienceEmail: normalizeEmail(employee.email),
      });
    }
  });

  const docs = [...recipients.values()].map((recipient) => ({
    title: String(title).trim(),
    message: String(message).trim(),
    audienceId: recipient.audienceId,
    audienceEmail: recipient.audienceEmail || undefined,
    category: category ? String(category).trim() : undefined,
    read: false,
  }));

  if (!docs.length) {
    return Notification.create({
      title: String(title).trim(),
      message: String(message).trim(),
      audienceRole: "staff",
      category: category ? String(category).trim() : undefined,
      read: false,
    });
  }

  return Notification.insertMany(docs);
};

const createBroadcastNotifications = async ({ title, message, category, role }) => {
  if (!title || !message) return [];

  // target users by role or all users if no role provided
  const filter = role ? { role: String(role).trim().toLowerCase() } : {};
  const users = await User.find(filter).select("_id email name");

  const recipients = new Map();
  users.forEach((user) => {
    const key = normalizeEmail(user.email) || user._id.toString();
    recipients.set(key, {
      audienceId: user._id.toString(),
      audienceEmail: normalizeEmail(user.email),
    });
  });

  const docs = [...recipients.values()].map((recipient) => ({
    title: String(title).trim(),
    message: String(message).trim(),
    audienceId: recipient.audienceId,
    audienceEmail: recipient.audienceEmail || undefined,
    category: category ? String(category).trim() : undefined,
    read: false,
  }));

  if (!docs.length) {
    return Notification.create({
      title: String(title).trim(),
      message: String(message).trim(),
      audienceRole: role ? String(role).trim().toLowerCase() : undefined,
      category: category ? String(category).trim() : undefined,
      read: false,
    });
  }

  return Notification.insertMany(docs);
};

module.exports = {
  createNotification,
  createStaffNotification,
  createStaffBroadcastNotifications,
  createBroadcastNotifications,
};
