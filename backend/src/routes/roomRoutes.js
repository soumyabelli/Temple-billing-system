const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Bill = require("../models/Bill");
const { recordTransaction } = require("../services/accountingService");
const { optionalAuthenticate } = require("../middleware/authMiddleware");

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

const Notification = require("../models/Notification");
const { generateRoomBookingReceiptPDF } = require("../utils/pdfGenerator");
const { sendRoomBookingConfirmation } = require("../utils/communicationService");
const { createStaffNotification } = require("../utils/notificationService");

// Shared helper: allot a room and save a Booking record
async function allotRoom({ roomNumber, devoteeName, phone, email, devoteeEmail, days, payMode, checkinDate, checkoutDate }, req = {}) {
  const room = await Room.findOne({ number: roomNumber });
  if (!room) throw { status: 404, message: "Room not found" };
  if (room.status !== "Available") throw { status: 400, message: `Room ${roomNumber} is not available` };

  const { resolveDevoteeDetails } = require("../utils/devoteeLookup");
  const rawEmail = email || devoteeEmail || req?.body?.email || req?.body?.devoteeEmail || req?.user?.email || null;
  const cleanEmail = rawEmail ? String(rawEmail).trim().toLowerCase() : undefined;

  const resolvedDevotee = await resolveDevoteeDetails({
    name: devoteeName,
    email: cleanEmail,
    phone,
  });

  const finalDevoteeName = (devoteeName || resolvedDevotee.name || "Devotee").trim();
  const finalEmail = cleanEmail || resolvedDevotee.email || undefined;
  const finalPhone = phone || resolvedDevotee.phone || undefined;
  const finalAddress = req?.body?.address || req?.body?.devoteeAddress || resolvedDevotee.address || undefined;

  const checkin = checkinDate ? new Date(checkinDate) : new Date();
  const checkout = checkoutDate
    ? new Date(checkoutDate)
    : new Date(checkin.getTime() + (days || 1) * 24 * 60 * 60 * 1000);

  const diffDays = Math.max(1, Math.round((checkout - checkin) / (1000 * 60 * 60 * 24)));
  const totalAmount = room.price * diffDays;
  const serviceName = `Room Allotment: Room ${room.number} (${room.type})`;

  // Mark room as Occupied
  room.devotee = finalDevoteeName;
  room.phone = finalPhone;
  room.days = diffDays;
  room.payMode = payMode || "Cash";
  room.checkinDate = checkin;
  room.checkoutDate = checkout;
  room.status = "Occupied";
  await room.save();

  // Create a Booking record for history
  const booking = new Booking({
    devoteeName: finalDevoteeName,
    devoteePhone: finalPhone,
    devoteeEmail: finalEmail,
    devoteeAddress: finalAddress,
    address: finalAddress,
    service: serviceName,
    datetime: checkin.toISOString(),
    amount: totalAmount,
    paymentMethod: payMode || "Cash",
    status: "Completed",
    notes: `Check-in: ${checkin.toISOString()} | Check-out: ${checkout.toISOString()} | Days: ${diffDays} | Room: ${room.number}`,
    days: diffDays,
    checkinDate: checkin,
    checkoutDate: checkout,
  });
  await booking.save();

  const referenceNo = `RM-${String(booking._id).slice(-6).toUpperCase()}`;

  // Create Bill for Receipts ledger
  try {
    await Bill.create({
      devoteeName: finalDevoteeName,
      devoteeEmail: finalEmail,
      devoteePhone: finalPhone,
      devoteeAddress: finalAddress,
      sevaType: serviceName,
      items: [{
        itemType: "Room",
        itemName: serviceName,
        amount: totalAmount,
      }],
      amount: totalAmount,
      paymentMode: payMode || "Cash",
      billType: "Room Booking",
      referenceNo,
      sourceId: booking._id.toString(),
      notes: `Days: ${diffDays} | Room: ${room.number}`,
      status: "Paid",
      billDate: checkin,
    });
  } catch (billErr) {
    console.warn("Failed to create room bill:", billErr.message);
  }

  // Create AccountTransaction under Room Income
  try {
    const cashierUserId = req?.user ? req.user.id : null;
    await recordTransaction({
      transactionType: "Credit",
      source: "Room Booking",
      category: "Room Income",
      amount: totalAmount,
      paymentMethod: payMode || "Cash",
      status: "Completed",
      description: `Room Allotment: Room ${room.number} (${room.type}) for ${devoteeName}`,
      referenceId: booking._id,
      referenceModel: "Booking",
      recordedBy: cashierUserId,
      cashierId: cashierUserId,
      cashierName: req?.user?.name || undefined,
    });
  } catch (accErr) {
    console.warn("Failed to record room accounting transaction:", accErr.message);
  }

  // Generate official PDF receipt & dispatch multi-channel notifications
  let base64Attachment = undefined;
  try {
    const devoteeObj = { name: devoteeName, phone, email: cleanEmail };
    const bookingDetails = {
      ...booking.toObject(),
      referenceNo,
      service: serviceName,
      checkinDate: checkin,
      checkoutDate: checkout,
      days: diffDays,
      amount: totalAmount,
      paymentMethod: payMode || "Cash",
    };

    const pdfBuffer = await generateRoomBookingReceiptPDF(devoteeObj, bookingDetails);
    if (pdfBuffer) {
      base64Attachment = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    }

    if (cleanEmail || phone) {
      await sendRoomBookingConfirmation(devoteeObj, bookingDetails).catch((err) =>
        console.warn("Failed to send room booking confirmation:", err.message)
      );
    }
  } catch (pdfErr) {
    console.warn("Failed to generate room booking PDF/email:", pdfErr.message);
  }

  // Devotee Website Notification (with downloadable receipt)
  try {
    await Notification.create({
      title: `Room Booking Confirmed: Room ${room.number}`,
      message: `Your accommodation booking for Room ${room.number} (${room.type}) from ${checkin.toLocaleDateString("en-IN")} to ${checkout.toLocaleDateString("en-IN")} (Total: ₹${totalAmount}) has been confirmed. You can download your official receipt anytime from this notification or your Devotee Receipts tab.`,
      audienceEmail: cleanEmail || undefined,
      category: "booking",
      attachment: base64Attachment,
      emailSent: true, // Already sent by sendRoomBookingConfirmation
    });
  } catch (notifErr) {
    console.warn("Failed to create room allotment website notification:", notifErr.message);
  }

  // Cashier notification
  await createStaffNotification({
    title: `🛏️ Room Allotment: Room ${room.number}`,
    message: `Room ${room.number} (${room.type}) allotted to "${devoteeName}" — ₹${totalAmount} (${payMode || "Cash"}).`,
    audienceRole: "cashier",
    category: "booking",
  }).catch(() => { });

  return { room, booking };
}

// POST book a room (devotee self-booking)
router.post("/book", optionalAuthenticate, async (req, res) => {
  try {
    const { roomNumber, devoteeName, phone, email, devoteeEmail, days, payMode, checkinDate, checkoutDate } = req.body;
    const { room, booking } = await allotRoom({ roomNumber, devoteeName, phone, email, devoteeEmail, days, payMode, checkinDate, checkoutDate }, req);
    res.json({ message: "Room booked successfully", room, booking });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Failed to book room" });
  }
});

// POST allot a room (admin/cashier)
router.post("/allot", optionalAuthenticate, async (req, res) => {
  try {
    const { roomNumber, devoteeName, phone, email, devoteeEmail, days, payMode, checkinDate, checkoutDate } = req.body;
    const { room, booking } = await allotRoom({ roomNumber, devoteeName, phone, email, devoteeEmail, days, payMode, checkinDate, checkoutDate }, req);
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