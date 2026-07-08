require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("../src/models/Booking");
const Donation = require("../src/models/Donation");
const PrasadamOrder = require("../src/models/PrasadamOrder");
const Bill = require("../src/models/Bill");

const check = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/temple";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const bookings = await Booking.find();
  const donations = await Donation.find();
  const orders = await PrasadamOrder.find();
  const bills = await Bill.find();

  console.log("Bookings Count:", bookings.length);
  console.log("Bookings Total Amount:", bookings.reduce((s, x) => s + (x.amount || 0), 0));
  console.log("Bookings Pending Total Amount:", bookings.filter(x => x.status === "Pending" || x.paymentStatus === "Pending").reduce((s, x) => s + (x.amount || 0), 0));

  console.log("Donations Count:", donations.length);
  console.log("Donations Total Amount:", donations.reduce((s, x) => s + (x.amount || 0), 0));
  console.log("Donations Pending Total Amount:", donations.filter(x => String(x.status).toLowerCase() === "pending").reduce((s, x) => s + (x.amount || 0), 0));

  console.log("Prasadam Orders Count:", orders.length);
  console.log("Prasadam Orders Total Amount:", orders.reduce((s, x) => s + (x.amount || 0), 0));

  console.log("Bills Count:", bills.length);
  console.log("Bills Total Amount (Paid):", bills.filter(x => x.status === "Paid").reduce((s, x) => s + (x.amount || 0), 0));
  console.log("Bills Total Amount (Pending):", bills.filter(x => x.status === "Pending").reduce((s, x) => s + (x.amount || 0), 0));
  console.log("Bills Total Amount (All):", bills.reduce((s, x) => s + (x.amount || 0), 0));

  await mongoose.disconnect();
};

check();
