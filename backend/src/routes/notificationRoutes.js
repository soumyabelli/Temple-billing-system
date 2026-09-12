const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

router.get("/:role/:userId", getNotifications);
router.put("/:role/:userId/read-all", markAllNotificationsRead);
router.put("/read-all", markAllNotificationsRead);
router.put("/read/:id", markNotificationRead);

module.exports = router;