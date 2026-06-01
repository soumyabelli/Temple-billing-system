const express = require("express");

const router = express.Router();

const {
  assignTask,
  createInventoryRequestNotification,
  deleteTask,
  getAllTasks,
  getStaffNotifications,
  getStaffUnreadCount,
  getTasks,
  markStaffNotificationRead,
  markStaffNotificationsRead,
  markStaffNotificationsViewed,
  updateTaskStatus,
} = require("../controllers/staffController");



/* GET STAFF TASKS */

router.get(
  "/tasks",
  getAllTasks
);

router.get(
  "/tasks/:staffId",
  getTasks
);



/* UPDATE TASK STATUS */

router.put(
  "/task-status/:id",
  updateTaskStatus
);

router.delete(
  "/tasks/:id",
  deleteTask
);

router.get(
  "/notifications/:staffId",
  getStaffNotifications
);

router.get(
  "/notifications/:staffId/unread-count",
  getStaffUnreadCount
);

router.patch(
  "/notifications/:staffId/read-all",
  markStaffNotificationsRead
);

router.patch(
  "/notifications/:staffId/view-all",
  markStaffNotificationsViewed
);

router.patch(
  "/notifications/read/:id",
  markStaffNotificationRead
);

router.post(
  "/notifications/inventory-request-status",
  createInventoryRequestNotification
);



/* ASSIGN TASK BY ADMIN OR PRIEST */

router.post(
  "/assign-task",
  assignTask
);



module.exports = router;
