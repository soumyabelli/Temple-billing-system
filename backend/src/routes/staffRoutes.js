const express = require("express");

const router = express.Router();

const {
  assignTask,
  createInventoryRequest,
  createInventoryRequestNotification,
  deleteTask,
  getInventoryCatalog,
  getInventoryRequests,
  getInventorySummary,
  getAllTasks,
  getStaffNotifications,
  getStaffUnreadCount,
  getTasks,
  markStaffNotificationRead,
  markStaffNotificationsRead,
  markStaffNotificationsViewed,
  updateInventoryRequestStatus,
  updateTaskStatus,
} = require("../controllers/staffController");
const {
  createInventoryRequest: createInventoryRequestRecord,
  getInventoryCatalog: getInventoryCatalogData,
  getInventoryRequests: getInventoryRequestsData,
  getInventorySummary: getInventorySummaryData,
  updateInventoryRequestStatus: updateInventoryRequestStatusData,
} = require("../controllers/inventoryRequestController");



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

router.get(
  "/inventory/catalog",
  getInventoryCatalogData
);

router.post(
  "/inventory-requests",
  createInventoryRequestRecord
);

router.get(
  "/inventory-requests",
  getInventoryRequestsData
);

router.get(
  "/inventory-requests/:staffId",
  getInventoryRequestsData
);

router.get(
  "/inventory-requests/:staffId/summary",
  getInventorySummaryData
);

router.put(
  "/inventory-requests/:id/status",
  updateInventoryRequestStatusData
);



/* ASSIGN TASK BY ADMIN OR PRIEST */

router.post(
  "/assign-task",
  assignTask
);



module.exports = router;
