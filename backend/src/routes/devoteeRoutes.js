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
  getFestivalOverview,
  updateEventStatus,
  updateEvent,
  submitSupportRequest,
  updateProfile,
  getSupportRequests,
  replySupportRequest,
  createNotification,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPrasadamOrders,
  createPrasadamOrder,
  cancelPrasadamOrder,
  updateBookingStatus,
  markNotificationAsRead,
  markSupportRequestAsRead,
} = require("../controllers/devoteeController");

const router = express.Router();

router.get("/bookings", getBookings);
router.post("/bookings", createBooking);
router.patch("/bookings/:id/status", updateBookingStatus);
router.get("/donations", getDonations);
router.post("/donations", createDonation);
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationAsRead);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/events", getEvents);
router.post("/events", createEvent);
router.get("/events/overview", getFestivalOverview);
router.patch("/events/:id/status", updateEventStatus);
router.patch("/events/:id", updateEvent);
// Razorpay endpoints for order creation, verification and webhook
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/razorpay/webhook", express.raw({ type: "application/json" }), handleRazorpayWebhook);
router.post("/support", submitSupportRequest);
router.get("/support", getSupportRequests);
router.patch("/support/:id", replySupportRequest);
router.patch("/support/:id/read", markSupportRequestAsRead);
router.post("/notifications", createNotification);
router.get("/prasadam-orders", getPrasadamOrders);
router.post("/prasadam-orders", createPrasadamOrder);
router.patch("/prasadam-orders/:id/cancel", cancelPrasadamOrder);

module.exports = router;
