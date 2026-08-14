const mongoose = require("mongoose");

const transferRequestSchema = new mongoose.Schema(
  {
    referenceType: {
      type: String,
      enum: ["Booking", "Task", "DefaultDuty"],
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
    },
    originalPriest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedPriest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TransferRequest", transferRequestSchema);
