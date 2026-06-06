const mongoose = require("mongoose");

const INVENTORY_REQUEST_STATUSES = ["Pending", "Approved", "Rejected"];

const inventoryRequestSchema = new mongoose.Schema(
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
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      enum: ["Kg", "Liter", "Pack", "Pieces"],
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
