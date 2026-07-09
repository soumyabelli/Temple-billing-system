const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// GET all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ number: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms", error: err.message });
  }
});

// POST create a new room (admin)
router.post("/", async (req, res) => {
  try {
    const { number, type, block, floor, price, capacity, bedType, amenities } = req.body;
    const existing = await Room.findOne({ number });
    if (existing) {
      return res.status(400).json({ message: "Room number already exists" });
    }
    const room = new Room({ number, type, block, floor, price, capacity, bedType, amenities });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to create room", error: err.message });
  }
});

// Shared helper: allot a room and save a Booking record
async function allotRoom({ roomNumber, devoteeName, phone, days, payMode, checkinDate, checkoutDate }) {
  const room = await Room.findOne({ number: roomNumber });
  if (!room) throw { status: 404, message: "Room not found" };
  if (room.status !== "Available") throw { status: 400, message: `Room ${roomNumber} is not available` };

  const checkin = checkinDate ? new Date(checkinDate) : new Date();
  const checkout = checkoutDate
    ? new Date(checkoutDate)
    : new Date(checkin.getTime() + (days || 1) * 24 * 60 * 60 * 1000);

  const diffDays = Math.max(1, Math.round((checkout - checkin) / (1000 * 60 * 60 * 24)));
  const totalAmount = room.price * diffDays;

  // Mark room as Occupied
  room.devotee = devoteeName;
  room.phone = phone;
  room.days = diffDays;
  room.payMode = payMode || "UPI";
  room.checkinDate = checkin;
  room.checkoutDate = checkout;
  room.status = "Occupied";
  await room.save();

  // Create a Booking record for history
  const booking = new Booking({
    devoteeName: devoteeName,
    devoteePhone: phone,
    service: `Room Allotment: Room ${room.number} (${room.type})`,
    datetime: checkin.toISOString(),
    amount: totalAmount,
    paymentMethod: payMode || "UPI",
    status: "Completed",
    notes: `Check-in: ${checkin.toISOString()} | Check-out: ${checkout.toISOString()} | Days: ${diffDays} | Room: ${room.number}`,
    days: diffDays,
    checkinDate: checkin,
    checkoutDate: checkout,
  });
  await booking.save();

  return { room, booking };
}

// POST book a room (devotee self-booking)
router.post("/book", async (req, res) => {
  try {
    const { roomNumber, devoteeName, phone, days, payMode, checkinDate, checkoutDate } = req.body;
    const { room, booking } = await allotRoom({ roomNumber, devoteeName, phone, days, payMode, checkinDate, checkoutDate });
    res.json({ message: "Room booked successfully", room, booking });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Failed to book room" });
  }
});

// POST allot a room (admin)
router.post("/allot", async (req, res) => {
  try {
    const { roomNumber, devoteeName, phone, days, payMode, checkinDate, checkoutDate } = req.body;
    const { room, booking } = await allotRoom({ roomNumber, devoteeName, phone, days, payMode, checkinDate, checkoutDate });
    res.json({ message: "Room allotted successfully", room, booking });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Failed to allot room" });
  }
});

// POST checkout a room — marks room Available & booking Completed
router.post("/checkout/:roomNumber", async (req, res) => {
  try {
    const room = await Room.findOne({ number: req.params.roomNumber });
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Mark any active booking for this room as Completed
    await Booking.updateMany(
      {
        service: { $regex: new RegExp(`Room Allotment: Room ${req.params.roomNumber}`, "i") },
        status: { $nin: ["Completed", "Cancelled"] },
      },
      { $set: { status: "Completed", completedAt: new Date() } }
    );

    room.status = "Available";
    room.devotee = undefined;
    room.phone = undefined;
    room.days = undefined;
    room.payMode = undefined;
    room.checkinDate = undefined;
    room.checkoutDate = undefined;
    await room.save();

    res.json({ message: "Checkout successful", room });
  } catch (err) {
    res.status(500).json({ message: "Failed to checkout room", error: err.message });
  }
});

// PATCH toggle maintenance status
router.patch("/maintenance/:roomNumber", async (req, res) => {
  try {
    const room = await Room.findOne({ number: req.params.roomNumber });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.status === "Maintenance") {
      room.status = "Available";
    } else if (room.status === "Available") {
      room.status = "Maintenance";
    } else {
      return res.status(400).json({ message: "Cannot toggle maintenance on an occupied room" });
    }
    await room.save();
    res.json({ message: "Room status updated", room });
  } catch (err) {
    res.status(500).json({ message: "Failed to update room status", error: err.message });
  }
});

// DELETE a room by room number
router.delete("/:roomNumber", async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ number: req.params.roomNumber });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room", error: err.message });
  }
});

module.exports = router;