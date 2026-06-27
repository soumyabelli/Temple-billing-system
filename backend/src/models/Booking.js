const mongoose = require("mongoose");

const bookingHistorySchema = new mongoose.Schema(
  {
    previousStatus: { type: String, trim: true },
    newStatus: { type: String, trim: true, required: true },
    updatedBy: { type: String, trim: true, default: "Admin" },
    note: { type: String, trim: true, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    gst: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Bank Transfer", "Net Banking"],
      default: "UPI",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    transactionId: { type: String, trim: true, default: "" },
    bookingNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "Booked",
        "Pending",
        "Approved",
        "Confirmed",
        "Assigned",
        "In Progress",
        "Completed",
        "Rejected",
        "Cancelled",
        "Upcoming",
      ],
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
    priestName: { type: String, trim: true, default: "" },
    startedAt: { type: Date },
    completedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true, default: "" },
    pendingReason: { type: String, trim: true },
    pendingAt: { type: Date },
    // Full audit trail of every status change
    bookingHistory: { type: [bookingHistorySchema], default: [] },
  },
  { timestamps: true }
);

// Auto-generate bookingNumber before save if not set
bookingSchema.pre("save", async function (next) {
  if (!this.bookingNumber) {
    try {
      const last = await this.constructor.findOne({}, { bookingNumber: 1 }, { sort: { createdAt: -1 } });
      let nextNum = 1001;
      if (last && last.bookingNumber) {
        const parsed = parseInt(last.bookingNumber.replace(/^PB/i, ""), 10);
        if (!isNaN(parsed)) nextNum = parsed + 1;
      }
      this.bookingNumber = `PB${nextNum}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
