const express = require("express");

const router = express.Router();

const {
  applyLeave,
  getAdminLeaveOverview,
  getLeaves,
  getLeaveStats,
  updateLeaveStatus,
} = require("../controllers/leaveController");

router.post("/apply", applyLeave);

router.get("/admin/overview", getAdminLeaveOverview);

router.get("/stats/:staffId", getLeaveStats);

router.put("/status/:id", updateLeaveStatus);

router.get("/:staffId", getLeaves);

module.exports = router;
