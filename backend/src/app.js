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
const poojaRoutes = require("./routes/poojaBookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());
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
app.use("/api/pooja", poojaRoutes);

module.exports = app;
