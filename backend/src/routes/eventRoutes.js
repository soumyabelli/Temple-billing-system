const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
} = require("../controllers/eventController");

router.post("/add", createEvent);

router.get("/", getEvents);

module.exports = router;