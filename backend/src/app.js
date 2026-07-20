const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const donationRoutes = require("./routes/donationRoutes");
const devoteeRoutes = require("./routes/devoteeRoutes");
const staffRoutes = require("./routes/staffRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const adminInventoryRoutes = require("./routes/adminInventoryRoutes");
const adminPrasadamOrdersRoutes = require("./routes/adminPrasadamOrdersRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const billRoutes = require("./routes/billRoutes");
const priestRoutes = require("./routes/priestRoutes");
const prasadamRoutes = require("./routes/prasadamRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const attendanceSettingsRoutes = require("./routes/attendanceSettingsRoutes");
const transferRoutes = require("./routes/transferRoutes");
const roomRoutes = require("./routes/roomRoutes");
const attendanceLocationRoutes = require("./routes/attendanceLocationRoutes");
const accountRoutes = require("./routes/accountRoutes");
const Room = require("./models/Room");

const app = express();

app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "temple-billing-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/devotee", devoteeRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/admin", adminInventoryRoutes);
app.use("/api/admin", adminPrasadamOrdersRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/priest", priestRoutes);
app.use("/api/prasadam", prasadamRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/attendance/settings", attendanceSettingsRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/attendance-locations", attendanceLocationRoutes);
app.use("/api/accounts", accountRoutes);

// Automatic Check-in/out background scheduler running every 60 seconds
setInterval(async () => {
  try {
    const now = new Date();

    // 1. Process automatic checkouts
    // Find occupied rooms whose checkout time has passed
    const roomsToCheckout = await Room.find({
      status: "Occupied",
      checkoutDate: { $lte: now }
    });

    for (const room of roomsToCheckout) {
      console.log(`[Auto-Checkout] Room ${room.number} checkout time reached.`);
      room.status = "Available";
      room.devotee = undefined;
      room.phone = undefined;
      room.days = undefined;
      room.payMode = undefined;
      room.checkinDate = undefined;
      room.checkoutDate = undefined;
      await room.save();
    }

    // 2. Process automatic checkins
    // Find available rooms that have devotee details set and checkin time has reached (but checkout time has not)
    const roomsToCheckin = await Room.find({
      status: "Available",
      checkinDate: { $lte: now },
      checkoutDate: { $gt: now },
      devotee: { $exists: true, $ne: null }
    });

    for (const room of roomsToCheckin) {
      console.log(`[Auto-Checkin] Room ${room.number} checkin time reached.`);
      room.status = "Occupied";
      await room.save();
    }

  } catch (err) {
    console.error("Background room scheduler error:", err);
  }
}, 60000);

module.exports = app;
