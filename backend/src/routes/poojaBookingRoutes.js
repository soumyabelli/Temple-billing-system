const express = require("express");
const router = express.Router();
const poojaBookingController = require("../controllers/poojaBookingController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Require authentication for all pooja routes
router.use(authenticate);

// Create a new pooja booking (allowed for cashiers and admins)
router.post("/book", authorizeRoles("cashier", "admin"), poojaBookingController.createBooking);

// Get bookings for the logged-in user
router.get("/my-bookings", authorizeRoles("cashier", "admin"), poojaBookingController.getMyBookings);

// Cancel a booking
router.delete("/:id", authorizeRoles("cashier", "admin"), poojaBookingController.cancelBooking);

module.exports = router;
