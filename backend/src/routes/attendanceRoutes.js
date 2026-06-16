const express = require("express");

const router = express.Router();

const {
  getAdminAttendanceDashboard,
  getStaffAttendanceDashboard,
  getStaffAttendanceRecords,
  getStaffAttendanceSummary,
  markAttendance,
  updateAttendance,
} = require("../controllers/attendanceController");

router.post("/mark", markAttendance);
router.get("/admin/dashboard", getAdminAttendanceDashboard);
router.put("/:id", updateAttendance);
router.get("/:staffId/dashboard", getStaffAttendanceDashboard);
router.get("/:staffId/records", getStaffAttendanceRecords);
router.get("/:staffId/summary", getStaffAttendanceSummary);

module.exports = router;
