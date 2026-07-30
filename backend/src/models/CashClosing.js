const mongoose = require("mongoose");

const cashClosingSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    openingCash: {
      type: Number,
      required: true,
      default: 0,
    },
    cashCollected: {
      type: Number,
      required: true,
      default: 0,
    },
    upiCollected: {
      type: Number,
      default: 0,
    },
    cardCollected: {
      type: Number,
      default: 0,
    },
    bankTransferCollected: {
      type: Number,
      default: 0,
    },
    totalSystemCollection: {
      type: Number,
      default: 0,
    },
    cashDeposited: {
      type: Number,
      default: 0,
    },
    closingCash: {
      type: Number,
      required: true,
    },
    discrepancy: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending Verification", "Verified", "Disputed"],
      default: "Pending Verification",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CashClosing", cashClosingSchema);
