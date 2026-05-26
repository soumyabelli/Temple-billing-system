const express = require("express");
const {
  getBookings,
  createBooking,
  getDonations,
  createDonation,
  getNotifications,
  getProfile,
  getEvents,
  submitSupportRequest,
} = require("../controllers/devoteeController");

const router = express.Router();

router.get("/bookings", getBookings);
router.post("/bookings", createBooking);
router.get("/donations", getDonations);
router.post("/donations", createDonation);
router.get("/notifications", getNotifications);
router.get("/profile", getProfile);
router.get("/events", getEvents);
router.post("/support", submitSupportRequest);

module.exports = router;
