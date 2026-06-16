const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markNotificationRead
} = require("../controllers/notificationController");

router.get(
  "/:role/:userId",
  getNotifications
);

router.put(
  "/read/:id",
  markNotificationRead
);

module.exports = router;