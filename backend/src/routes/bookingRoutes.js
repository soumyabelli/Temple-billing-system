const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Dashboard summary + latest bookings (no auth for admin dashboard use)
router.get("/dashboard", bookingController.getDashboardBookings);

// All bookings with search / filter / pagination
router.get("/all", bookingController.getAllBookings);

// Get receipt data for a booking
router.get("/receipt/:bookingId", bookingController.getBookingReceipt);

// Get single booking by ID
router.get("/:id", bookingController.getBookingById);

// Update booking status (workflow transition)
router.patch("/:id/status", bookingController.updateBookingStatus);

module.exports = router;
