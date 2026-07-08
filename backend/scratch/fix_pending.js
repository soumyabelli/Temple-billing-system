require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("../src/models/Booking");
const Donation = require("../src/models/Donation");
const PrasadamOrder = require("../src/models/PrasadamOrder");
const Bill = require("../src/models/Bill");

const run = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/temple";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // Update Bookings
  const r1 = await Booking.updateMany(
    {},
    { $set: { paymentStatus: "Paid", status: "Completed" } }
  );
  console.log(`Updated ${r1.modifiedCount} pending bookings to Paid/Confirmed.`);

  // Update Donations
  const r2 = await Donation.updateMany(
    {},
    { $set: { status: "Not Collected" } }
  );
  console.log(`Updated ${r2.modifiedCount} donations to Not Collected.`);

  // Update Prasadam Orders
  const r3 = await PrasadamOrder.updateMany(
    {},
    { $set: { status: "Not Collected" } }
  );
  console.log(`Updated ${r3.modifiedCount} prasadam orders to Not Collected.`);

  // Update Bills
  const r4 = await Bill.updateMany(
    { status: "Pending" },
    { $set: { status: "Paid" } }
  );
  console.log(`Updated ${r4.modifiedCount} pending bills to Paid.`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
};

run();
