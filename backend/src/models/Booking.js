const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    devoteeName: { type: String, trim: true, required: true },
    devoteeEmail: { type: String, trim: true, lowercase: true },
    service: { type: String, trim: true, required: true },
    datetime: { type: String, trim: true, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected", "Cancelled"],
      default: "Pending",
    },
    contactNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
