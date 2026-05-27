const mongoose = require("mongoose");

const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"];

const leaveSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    staffName: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    leaveType: {
      type: String,
      default: "General",
      trim: true,
    },
    fromDate: {
      type: String,
      required: true,
      trim: true,
    },
    toDate: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: LEAVE_STATUSES,
      default: "Pending",
    },
    adminReason: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
