const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  updateEvent,
  updateEventStatus,
} = require("../controllers/eventController");

router.post("/add", createEvent);

router.put("/:id", updateEvent);

router.patch("/:id/status", updateEventStatus);

router.get("/", getEvents);

module.exports = router;