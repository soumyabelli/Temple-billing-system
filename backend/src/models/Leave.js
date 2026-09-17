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
    role: {
      type: String,
      default: "staff",
      trim: true,
    },
    staffEmail: {
      type: String,
      default: "",
      trim: true,
    },
    transferDuty: {
      type: Boolean,
      default: false,
    },
    substituteId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    substituteName: {
      type: String,
      default: "",
      trim: true,
    },
    substituteRole: {
      type: String,
      default: "",
      trim: true,
    },
    substituteEmail: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    transferStatus: {
      type: String,
      enum: ["None", "Pending", "Accepted", "Rejected"],
      default: "None",
    },
    transferRejectReason: {
      type: String,
      default: "",
      trim: true,
    },
    transferResolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
