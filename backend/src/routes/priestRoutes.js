const express = require("express");
const {
  getPriestDashboard,
  getTodaySchedule,
  getUpcomingPoojas,
  getCompletedToday,
  updateBookingStatus,
  getAssignedPoojas,
  startPooja,
  completePooja,
  pendingPooja,
  getSevaSchedule,
  getSevaInstructions,
  getMaterialChecklist,
} = require("../controllers/priestController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication and priest role authorization to all priest endpoints
router.use(authenticate);
router.use(authorizeRoles("priest"));

router.get("/dashboard", getPriestDashboard);
router.get("/today-schedule", getTodaySchedule);
router.get("/upcoming-poojas", getUpcomingPoojas);
router.get("/completed-today", getCompletedToday);
router.patch("/bookings/:id/status", updateBookingStatus);

// Module 1 Endpoints
router.get("/assigned-poojas", getAssignedPoojas);
router.put("/start-pooja/:id", startPooja);
router.put("/complete-pooja/:id", completePooja);
router.put("/pending-pooja/:id", pendingPooja);

// Module 2 Endpoints
router.get("/seva-schedule", getSevaSchedule);
router.get("/seva-instructions", getSevaInstructions);
router.get("/material-checklist", getMaterialChecklist);

module.exports = router;
