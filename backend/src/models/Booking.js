const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    devoteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      sparse: true,
    },
    devoteeName: { type: String, trim: true, required: true },
    devoteeEmail: { type: String, trim: true, lowercase: true },
    devoteePhone: { type: String, trim: true },
    service: { type: String, trim: true, required: true },
    datetime: { type: String, trim: true, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Bank Transfer", "Net Banking"],
      default: "UPI",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected", "Cancelled", "In Progress", "Completed", "Upcoming", "Assigned"],
      default: "Pending",
    },
    contactNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
    // whether this booking has been counted towards an event's registrations/collection
    counted: { type: Boolean, default: false },
    assignedPriest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    pendingReason: {
      type: String,
      trim: true,
    },
    pendingAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
