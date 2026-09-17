const express = require("express");

const router = express.Router();

const {
  applyLeave,
  getAdminLeaveOverview,
  getLeaves,
  getLeaveStats,
  updateLeaveStatus,
  getAvailableSubstitutes,
  getIncomingTransfers,
  respondToDutyTransfer,
} = require("../controllers/leaveController");

router.post("/apply", applyLeave);

router.get("/admin/overview", getAdminLeaveOverview);

router.get("/stats/:staffId", getLeaveStats);

router.put("/status/:id", updateLeaveStatus);

// Duty transfer & substitute endpoints (must be defined before /:staffId)
router.get("/available-substitutes", getAvailableSubstitutes);
router.get("/transfers/incoming/:employeeId", getIncomingTransfers);
router.put("/transfers/:id/respond", respondToDutyTransfer);

router.get("/:staffId", getLeaves);

module.exports = router;
