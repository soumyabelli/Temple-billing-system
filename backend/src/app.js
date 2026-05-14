const express = require("express");
const cors = require("cors");
const billRoutes = require("./routes/billRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "temple-billing-backend" });
});

app.use("/api/bills", billRoutes);

module.exports = app;

