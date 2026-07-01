const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDir = path.join(__dirname, "..", "data");
const notificationsFilePath = path.join(dataDir, "notifications.json");

const ensureNotificationsFile = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(notificationsFilePath)) {
    await fs.promises.writeFile(notificationsFilePath, "[]", "utf-8");
  }
};

const readNotifications = async () => {
  await ensureNotificationsFile();
  const raw = await fs.promises.readFile(notificationsFilePath, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeNotifications = async (notifications) => {
  await ensureNotificationsFile();
  await fs.promises.writeFile(notificationsFilePath, JSON.stringify(notifications, null, 2), "utf-8");
};

const createNotification = async (notificationData) => {
  const notifications = await readNotifications();
  const notification = {
    _id: crypto.randomUUID(),
    viewed: false,
    viewedAt: null,
    read: false,
    readAt: null,
    ...notificationData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notifications.push(notification);
  await writeNotifications(notifications);
  return notification;
};

const findNotifications = async (filter = {}) => {
  let notifications = await readNotifications();

  if (filter.audienceEmail) {
    const email = filter.audienceEmail;
    if (typeof email === 'object' && email.$in) {
      notifications = notifications.filter(n => n.audienceEmail && email.$in.includes(n.audienceEmail.toLowerCase()));
    } else if (typeof email === 'string') {
      notifications = notifications.filter(n => n.audienceEmail && n.audienceEmail.toLowerCase() === email.toLowerCase());
    }
  }

  // Sort: newest first
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return notifications;
};

module.exports = {
  createNotification,
  findNotifications,
};
