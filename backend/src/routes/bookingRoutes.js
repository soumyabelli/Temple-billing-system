const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/dashboard", bookingController.getDashboardBookings);
router.get("/all", bookingController.getAllBookings);

module.exports = router;
