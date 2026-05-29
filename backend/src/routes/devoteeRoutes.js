const express = require("express");
const {
  getBookings,
  createBooking,
  getDonations,
  createDonation,
  getNotifications,
  getProfile,
  getEvents,
  createEvent,
  submitSupportRequest,
  updateProfile,
  getSupportRequests,
  createNotification,
  getPrasadamOrders,
  createPrasadamOrder,
  cancelPrasadamOrder,
  updateBookingStatus,
} = require("../controllers/devoteeController");

const router = express.Router();

router.get("/bookings", getBookings);
router.post("/bookings", createBooking);
router.patch("/bookings/:id/status", updateBookingStatus);
router.get("/donations", getDonations);
router.post("/donations", createDonation);
router.get("/notifications", getNotifications);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/events", getEvents);
router.post("/events", createEvent);
router.post("/support", submitSupportRequest);
router.get("/support", getSupportRequests);
router.post("/notifications", createNotification);
router.get("/prasadam-orders", getPrasadamOrders);
router.post("/prasadam-orders", createPrasadamOrder);
router.patch("/prasadam-orders/:id/cancel", cancelPrasadamOrder);

module.exports = router;
