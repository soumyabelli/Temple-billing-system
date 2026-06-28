const express = require("express");

const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getAdminAttendanceDashboard,
  getStaffAttendanceDashboard,
  getStaffAttendanceRecords,
  getStaffAttendanceSummary,
  markAttendance,
  updateAttendance,
} = require("../controllers/attendanceController");

router.post("/mark", authenticate, markAttendance);
router.get("/admin/dashboard", authenticate, authorizeRoles("admin"), getAdminAttendanceDashboard);
router.put("/:id", authenticate, authorizeRoles("admin"), updateAttendance);
router.get("/:staffId/dashboard", authenticate, getStaffAttendanceDashboard);
router.get("/:staffId/records", authenticate, getStaffAttendanceRecords);
router.get("/:staffId/summary", authenticate, getStaffAttendanceSummary);

module.exports = router;
