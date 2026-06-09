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
} = require("../controllers/shiftController");

router.get("/dashboard", getShiftDashboard);
router.get("/", getShifts);
router.post("/", createShift);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);
router.post("/assign", assignShift);
router.delete("/assign/:id", deleteAssignment);

module.exports = router;