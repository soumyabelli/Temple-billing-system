const express = require("express");

const router = express.Router();

const {
  getShiftDashboard,
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  assignShift,
  deleteAssignment,
  getAvailableEmployees,
} = require("../controllers/shiftController");

router.get("/dashboard", getShiftDashboard);
router.get("/", getShifts);
router.post("/", createShift);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);
router.post("/assign", assignShift);
router.delete("/assign/:id", deleteAssignment);
router.get("/available-employees", getAvailableEmployees);

module.exports = router;