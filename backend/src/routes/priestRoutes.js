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
  getCompletedServices,
  getSpecialDuties,
  acceptDuty,
  rejectDuty,
  completeDuty,
  getFestivalDuties,
  markFestivalDutyAttendance,
  completeFestivalDuty,
  getNotifications,
  readNotification,
  readAllNotifications,
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
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

// Module 3 Endpoints
router.get("/completed-services", getCompletedServices);

// Module 4 Endpoints
router.get("/special-duties", getSpecialDuties);
router.put("/accept-duty/:id", acceptDuty);
router.put("/reject-duty/:id", rejectDuty);
router.put("/complete-duty/:id", completeDuty);

// Module 5 Endpoints
router.get("/festival-duties", getFestivalDuties);
router.put("/festival-duty-attendance/:id", markFestivalDutyAttendance);
router.put("/festival-duty-complete/:id", completeFestivalDuty);

// Module 6 Endpoints
router.get("/notifications", getNotifications);
router.put("/notifications/read/:id", readNotification);
router.put("/notifications/read-all", readAllNotifications);

// Module 7 Endpoints
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Module 8 Endpoints
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;
