const mongoose = require("mongoose");

const INVENTORY_REQUEST_STATUSES = ["Pending", "Approved", "Rejected"];

const inventoryRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Staff", "Priest"],
      required: true,
      default: "Staff",
    },
    requestedBy: {
      type: String,
      trim: true,
      default: "",
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      enum: ["Kg", "Liter", "Pack", "Pieces", "Box"],
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: INVENTORY_REQUEST_STATUSES,
      default: "Pending",
    },
    adminReason: {
      type: String,
      default: "",
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      default: "",
      trim: true,
    },
    approvedAt: {
      type: Date,
      default: null,
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

module.exports = mongoose.model("InventoryRequest", inventoryRequestSchema);
