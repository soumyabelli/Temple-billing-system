const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const donationRoutes = require("./routes/donationRoutes");
const devoteeRoutes = require("./routes/devoteeRoutes");
const staffRoutes = require("./routes/staffRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "temple-billing-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/devotee", devoteeRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/leaves", leaveRoutes);

module.exports = app;
